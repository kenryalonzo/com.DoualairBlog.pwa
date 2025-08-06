import mongoose, { Schema } from "mongoose";
import { IArticle } from "../types/index.js";

// Fonction pour générer un slug unique
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Supprimer les caractères spéciaux
    .replace(/[\s_-]+/g, '-') // Remplacer espaces et underscores par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets en début et fin
};

// Interface pour le document Article avec méthodes
interface IArticleDocument extends IArticle {
  generateSlug(): string;
  updateCounters(): Promise<void>;
  isPublished(): boolean;
  canBeEditedBy(userId: string, userRole: string): boolean;
}

const articleSchema = new Schema<IArticleDocument>(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
      minlength: [3, 'Le titre doit contenir au moins 3 caractères']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
      minlength: [10, 'Le contenu doit contenir au moins 10 caractères']
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, 'L\'extrait ne peut pas dépasser 500 caractères']
    },
    featuredImage: {
      type: String,
      trim: true
    },
    featuredVideo: {
      type: String,
      trim: true
    },
    videoType: {
      type: String,
      enum: ['upload', 'youtube', 'vimeo', 'url'],
      default: null
    },
    videoThumbnail: {
      type: String,
      trim: true
    },
    videoDuration: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
      index: true
    },
    publishedAt: {
      type: Date,
      default: null,
      index: true
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'auteur est requis'],
      index: true
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true
    },
    tags: [{
      type: Schema.Types.ObjectId,
      ref: 'Tag'
    }],
    viewCount: {
      type: Number,
      default: 0,
      min: 0
    },
    likesCount: {
      type: Number,
      default: 0,
      min: 0
    },
    commentsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    seoTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Le titre SEO ne peut pas dépasser 60 caractères']
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'La description SEO ne peut pas dépasser 160 caractères']
    },
    seoKeywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index composé pour les requêtes fréquentes
articleSchema.index({ status: 1, publishedAt: -1 });
articleSchema.index({ authorId: 1, status: 1 });
articleSchema.index({ categoryId: 1, status: 1 });
articleSchema.index({ tags: 1, status: 1 });
articleSchema.index({ isFeatured: 1, status: 1, publishedAt: -1 });

// Index de recherche textuelle
articleSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
  seoKeywords: 'text'
}, {
  weights: {
    title: 10,
    excerpt: 5,
    seoKeywords: 3,
    content: 1
  }
});

// Middleware de pré-sauvegarde pour générer le slug
articleSchema.pre('save', async function(next) {
  // Générer le slug si le titre a changé ou si c'est un nouveau document
  if (this.isModified('title') || this.isNew) {
    let baseSlug = generateSlug(this.title);
    let slug = baseSlug;
    let counter = 1;

    // Vérifier l'unicité du slug
    while (await mongoose.model('Article').findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }

  // Générer l'extrait automatiquement si non fourni
  if (!this.excerpt && this.content) {
    // Supprimer les balises HTML et prendre les 200 premiers caractères
    const plainText = this.content.replace(/<[^>]*>/g, '');
    this.excerpt = plainText.substring(0, 200).trim() + (plainText.length > 200 ? '...' : '');
  }

  // Définir la date de publication lors du passage en statut "published"
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Générer les métadonnées SEO si non fournies
  if (!this.seoTitle) {
    this.seoTitle = this.title.substring(0, 60);
  }

  if (!this.seoDescription && this.excerpt) {
    this.seoDescription = this.excerpt.substring(0, 160);
  }

  next();
});

// Méthodes d'instance
articleSchema.methods.generateSlug = function(): string {
  return generateSlug(this.title);
};

articleSchema.methods.isPublished = function(): boolean {
  return this.status === 'published' && this.publishedAt && this.publishedAt <= new Date();
};

articleSchema.methods.canBeEditedBy = function(userId: string, userRole: string): boolean {
  // Les admins peuvent tout éditer
  if (userRole === 'admin') return true;
  
  // Les modérateurs peuvent éditer les articles publiés
  if (userRole === 'moderator') return true;
  
  // L'auteur peut éditer ses propres articles
  return this.authorId.toString() === userId;
};

articleSchema.methods.updateCounters = async function(): Promise<void> {
  // Cette méthode sera utilisée pour mettre à jour les compteurs
  // depuis les collections de commentaires et d'interactions
  const Comment = mongoose.model('Comment');
  const UserInteraction = mongoose.model('UserInteraction');

  const [commentsCount, likesCount] = await Promise.all([
    Comment.countDocuments({ articleId: this._id, isApproved: true }),
    UserInteraction.countDocuments({ articleId: this._id, type: 'like' })
  ]);

  this.commentsCount = commentsCount;
  this.likesCount = likesCount;
  
  await this.save();
};

// Virtuals pour les relations
articleSchema.virtual('author', {
  ref: 'User',
  localField: 'authorId',
  foreignField: '_id',
  justOne: true
});

articleSchema.virtual('category', {
  ref: 'Category',
  localField: 'categoryId',
  foreignField: '_id',
  justOne: true
});

articleSchema.virtual('tagDetails', {
  ref: 'Tag',
  localField: 'tags',
  foreignField: '_id'
});

// Méthodes statiques
articleSchema.statics.findPublished = function(filters = {}) {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() },
    ...filters
  }).sort({ publishedAt: -1 });
};

articleSchema.statics.findFeatured = function(limit = 5) {
  return this.findPublished({ isFeatured: true }).limit(limit);
};

articleSchema.statics.findByCategory = function(categoryId: string) {
  return this.findPublished({ categoryId });
};

articleSchema.statics.findByTag = function(tagId: string) {
  return this.findPublished({ tags: tagId });
};

articleSchema.statics.search = function(query: string, filters = {}) {
  return this.find({
    $text: { $search: query },
    status: 'published',
    publishedAt: { $lte: new Date() },
    ...filters
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

const Article = mongoose.model<IArticleDocument>('Article', articleSchema);

export default Article;
export type { IArticleDocument };
