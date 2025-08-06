import mongoose, { Schema } from "mongoose";
import { ICategory } from "../types/index.js";

// Fonction pour générer un slug unique
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/[\s_-]+/g, "-") // Remplacer espaces et underscores par des tirets
    .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début et fin
};

// Interface pour le document Category avec méthodes
interface ICategoryDocument extends ICategory {
  generateSlug(): string;
  getChildren(): Promise<ICategoryDocument[]>;
  getParent(): Promise<ICategoryDocument | null>;
  isChildOf(categoryId: string): Promise<boolean>;
}

// Interface pour les méthodes statiques
interface ICategoryModel extends mongoose.Model<ICategoryDocument> {
  findBySlug(slug: string): Promise<ICategoryDocument | null>;
  getRootCategories(): Promise<ICategoryDocument[]>;
  getHierarchy(): Promise<any[]>;
  search(query: string): Promise<ICategoryDocument[]>;
  getStats(): Promise<{ total: number; withArticles: number; avgArticlesPerCategory: number }>;
}

const categorySchema = new Schema<ICategoryDocument>(
  {
    name: {
      type: String,
      required: [true, "Le nom de la catégorie est requis"],
      trim: true,
      maxlength: [100, "Le nom ne peut pas dépasser 100 caractères"],
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "La description ne peut pas dépasser 500 caractères"],
    },
    color: {
      type: String,
      trim: true,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Couleur hexadécimale invalide",
      ],
      default: "#3B82F6", // Bleu par défaut
    },
    icon: {
      type: String,
      trim: true,
      maxlength: [50, "L'icône ne peut pas dépasser 50 caractères"],
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      default: null,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    articlesCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index composé pour les requêtes fréquentes
categorySchema.index({ isActive: 1, articlesCount: -1 });
categorySchema.index({ parentId: 1, isActive: 1 });

// Index de recherche textuelle
categorySchema.index(
  {
    name: "text",
    description: "text",
  },
  {
    weights: {
      name: 10,
      description: 1,
    },
  }
);

// Validation personnalisée pour éviter les références circulaires
categorySchema.pre("save", async function (next) {
  // Générer le slug si le nom a changé ou si c'est un nouveau document
  if (this.isModified("name") || this.isNew) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (
      await mongoose.model("Category").findOne({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Vérifier les références circulaires si parentId est défini
  if (this.parentId) {
    const isCircular = await this.isChildOf(this.parentId.toString());
    if (isCircular) {
      throw new Error(
        "Référence circulaire détectée dans la hiérarchie des catégories"
      );
    }

    // Vérifier que la catégorie parent existe et est active
    const parent = await mongoose.model("Category").findById(this.parentId);
    if (!parent) {
      throw new Error("La catégorie parent n'existe pas");
    }
    if (!parent.isActive) {
      throw new Error("La catégorie parent n'est pas active");
    }
  }

  next();
});

// Middleware post-save pour mettre à jour le compteur d'articles
// categorySchema.post("save", async function () {
//   await this.updateArticlesCount();
// }); // Désactivé temporairement

// Middleware pre-remove pour gérer les articles orphelins
// categorySchema.pre(
//   "deleteOne",
//   { document: true, query: false },
//   async function (next) {
//     const Article = mongoose.model("Article");
//
//     // Mettre à jour les articles qui utilisent cette catégorie
//     await Article.updateMany(
//       { categoryId: this._id },
//       { $unset: { categoryId: 1 } }
//     );
//
//     // Mettre à jour les catégories enfants pour les rendre orphelines
//     await mongoose
//       .model("Category")
//       .updateMany({ parentId: this._id }, { $unset: { parentId: 1 } });
//
//     next();
//   }
// ); // Désactivé temporairement

// Méthodes d'instance
categorySchema.methods.generateSlug = function (): string {
  return generateSlug(this.name);
};

// categorySchema.methods.updateArticlesCount = async function (): Promise<void> {
//   const Article = mongoose.model("Article");
//
//   const count = await Article.countDocuments({
//     categoryId: this._id,
//     status: "published",
//   });
//
//   this.articlesCount = count;
//   await this.save();
// }; // Désactivé temporairement

categorySchema.methods.getChildren = async function (): Promise<
  ICategoryDocument[]
> {
  return await mongoose
    .model("Category")
    .find({
      parentId: this._id,
      isActive: true,
    })
    .sort({ name: 1 });
};

categorySchema.methods.getParent =
  async function (): Promise<ICategoryDocument | null> {
    if (!this.parentId) return null;

    return await mongoose.model("Category").findById(this.parentId);
  };

categorySchema.methods.isChildOf = async function (
  categoryId: string
): Promise<boolean> {
  if (!this.parentId) return false;

  if (this.parentId.toString() === categoryId) return true;

  const parent = await this.getParent();
  if (!parent) return false;

  return await parent.isChildOf(categoryId);
};

// Virtuals pour les relations
categorySchema.virtual("parent", {
  ref: "Category",
  localField: "parentId",
  foreignField: "_id",
  justOne: true,
});

categorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parentId",
});

categorySchema.virtual("articles", {
  ref: "Article",
  localField: "_id",
  foreignField: "categoryId",
});

// Méthodes statiques
categorySchema.statics.findActive = function (filters = {}) {
  return this.find({
    isActive: true,
    ...filters,
  }).sort({ name: 1 });
};

categorySchema.statics.findRootCategories = function () {
  return this.findActive({ parentId: null });
};

categorySchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug, isActive: true });
};

categorySchema.statics.findPopular = function (limit = 10) {
  return this.findActive().sort({ articlesCount: -1 }).limit(limit);
};

categorySchema.statics.search = function (query: string) {
  return this.find(
    {
      $text: { $search: query },
      isActive: true,
    },
    {
      score: { $meta: "textScore" },
    }
  ).sort({ score: { $meta: "textScore" } });
};

categorySchema.statics.getHierarchy = async function () {
  const categories = await this.findActive().populate("children");

  // Construire la hiérarchie
  const rootCategories = categories.filter((cat) => !cat.parentId);

  const buildTree = (parentId: any) => {
    return categories
      .filter(
        (cat) => cat.parentId && cat.parentId.toString() === parentId.toString()
      )
      .map((cat) => ({
        ...cat.toObject(),
        children: buildTree(cat._id),
      }));
  };

  return rootCategories.map((cat) => ({
    ...cat.toObject(),
    children: buildTree(cat._id),
  }));
};

const Category = mongoose.model<ICategoryDocument, ICategoryModel>("Category", categorySchema);

export default Category;
export type { ICategoryDocument };
