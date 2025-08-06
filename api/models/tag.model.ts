import mongoose, { Schema } from "mongoose";
import { ITag } from "../types/index.js";

// Fonction pour générer un slug unique
const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Supprimer les caractères spéciaux
    .replace(/[\s_-]+/g, "-") // Remplacer espaces et underscores par des tirets
    .replace(/^-+|-+$/g, ""); // Supprimer les tirets en début et fin
};

// Interface pour le document Tag avec méthodes
interface ITagDocument extends ITag {
  generateSlug(): string;
  // updateArticlesCount(): Promise<void>; // Désactivé temporairement
  // merge(targetTagId: string): Promise<void>; // Désactivé temporairement
}

const tagSchema = new Schema<ITagDocument>(
  {
    name: {
      type: String,
      required: [true, "Le nom du tag est requis"],
      trim: true,
      maxlength: [50, "Le nom ne peut pas dépasser 50 caractères"],
      minlength: [2, "Le nom doit contenir au moins 2 caractères"],
      unique: true,
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
      maxlength: [200, "La description ne peut pas dépasser 200 caractères"],
    },
    color: {
      type: String,
      trim: true,
      match: [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
        "Couleur hexadécimale invalide",
      ],
      default: "#6B7280", // Gris par défaut
    },
    articlesCount: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index composé pour les requêtes fréquentes
tagSchema.index({ articlesCount: -1, createdAt: -1 });

// Index de recherche textuelle
tagSchema.index(
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

// Middleware de pré-sauvegarde pour générer le slug
tagSchema.pre("save", async function (next) {
  // Générer le slug si le nom a changé ou si c'est un nouveau document
  if (this.isModified("name") || this.isNew) {
    let baseSlug = generateSlug(this.name);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (
      await mongoose.model("Tag").findOne({ slug, _id: { $ne: this._id } })
    ) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  next();
});

// Middleware post-save pour mettre à jour le compteur d'articles
// tagSchema.post("save", async function () {
//   await this.updateArticlesCount();
// }); // Désactivé temporairement

// Middleware pre-remove pour gérer les articles qui utilisent ce tag
// tagSchema.pre(
//   "deleteOne",
//   { document: true, query: false },
//   async function (next) {
//     const Article = mongoose.model("Article");
//
//     // Retirer ce tag de tous les articles
//     await Article.updateMany({ tags: this._id }, { $pull: { tags: this._id } });
//
//     next();
//   }
// ); // Désactivé temporairement

// Méthodes d'instance
tagSchema.methods.generateSlug = function (): string {
  return generateSlug(this.name);
};

// tagSchema.methods.updateArticlesCount = async function (): Promise<void> {
//   const Article = mongoose.model("Article");
//
//   const count = await Article.countDocuments({
//     tags: this._id,
//     status: "published",
//   });
//
//   this.articlesCount = count;
//   await this.save();
// }; // Désactivé temporairement

// tagSchema.methods.merge = async function (targetTagId: string): Promise<void> {
//   const Article = mongoose.model("Article");
//   const targetTag = await mongoose.model("Tag").findById(targetTagId);
//
//   if (!targetTag) {
//     throw new Error("Tag cible non trouvé");
//   }
//
//   // Transférer tous les articles de ce tag vers le tag cible
//   const articlesWithThisTag = await Article.find({ tags: this._id });
//
//   for (const article of articlesWithThisTag) {
//     // Retirer ce tag et ajouter le tag cible s'il n'y est pas déjà
//     article.tags = article.tags.filter(
//       (tagId) => tagId.toString() !== this._id.toString()
//     );
//
//     if (!article.tags.some((tagId) => tagId.toString() === targetTagId)) {
//       article.tags.push(targetTagId);
//     }
//
//     await article.save();
//   }
//
//   // Mettre à jour les compteurs
//   await targetTag.updateArticlesCount();
//
//   // Supprimer ce tag
//   await this.deleteOne();
// }; // Désactivé temporairement

// Virtuals pour les relations
tagSchema.virtual("articles", {
  ref: "Article",
  localField: "_id",
  foreignField: "tags",
});

// Méthodes statiques
tagSchema.statics.findBySlug = function (slug: string) {
  return this.findOne({ slug });
};

tagSchema.statics.findPopular = function (limit = 20) {
  return this.find({ articlesCount: { $gt: 0 } })
    .sort({ articlesCount: -1, name: 1 })
    .limit(limit);
};

tagSchema.statics.findRecent = function (limit = 10) {
  return this.find({ articlesCount: { $gt: 0 } })
    .sort({ createdAt: -1 })
    .limit(limit);
};

tagSchema.statics.search = function (query: string) {
  return this.find(
    {
      $text: { $search: query },
    },
    {
      score: { $meta: "textScore" },
    }
  ).sort({ score: { $meta: "textScore" } });
};

tagSchema.statics.findOrCreate = async function (names: string[]) {
  const tags = [];

  for (const name of names) {
    const trimmedName = name.trim();
    if (!trimmedName) continue;

    let tag = await this.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    });

    if (!tag) {
      tag = new this({ name: trimmedName });
      await tag.save();
    }

    tags.push(tag);
  }

  return tags;
};

tagSchema.statics.getTagCloud = async function (limit = 50) {
  const tags = await this.find({ articlesCount: { $gt: 0 } })
    .sort({ articlesCount: -1 })
    .limit(limit);

  // Calculer les tailles relatives pour le nuage de tags
  const maxCount = tags[0]?.articlesCount || 1;
  const minCount = tags[tags.length - 1]?.articlesCount || 1;

  return tags.map((tag) => ({
    ...tag.toObject(),
    weight:
      Math.ceil(((tag.articlesCount - minCount) / (maxCount - minCount)) * 5) +
      1,
  }));
};

tagSchema.statics.cleanup = async function () {
  // Supprimer les tags sans articles
  const result = await this.deleteMany({ articlesCount: 0 });
  return result.deletedCount;
};

tagSchema.statics.getStats = async function () {
  const [totalTags, usedTags, avgArticlesPerTag] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ articlesCount: { $gt: 0 } }),
    this.aggregate([
      { $match: { articlesCount: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: "$articlesCount" } } },
    ]),
  ]);

  return {
    totalTags,
    usedTags,
    unusedTags: totalTags - usedTags,
    avgArticlesPerTag: avgArticlesPerTag[0]?.avg || 0,
  };
};

const Tag = mongoose.model<ITagDocument>("Tag", tagSchema);

export default Tag;
export type { ITagDocument };
