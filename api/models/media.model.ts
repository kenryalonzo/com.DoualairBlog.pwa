import mongoose, { Schema } from "mongoose";
import { IMedia } from "../types/index.js";
import fs from 'fs/promises';
import path from 'path';

// Interface pour le document Media avec méthodes
interface IMediaDocument extends IMedia {
  getFullPath(): string;
  getPublicUrl(): string;
  delete(): Promise<void>;
  generateThumbnail(): Promise<string | null>;
  getFileInfo(): Promise<{ exists: boolean; size: number; lastModified: Date }>;
}

const mediaSchema = new Schema<IMediaDocument>(
  {
    filename: {
      type: String,
      required: [true, 'Le nom de fichier est requis'],
      trim: true,
      index: true
    },
    originalName: {
      type: String,
      required: [true, 'Le nom original est requis'],
      trim: true
    },
    mimetype: {
      type: String,
      required: [true, 'Le type MIME est requis'],
      trim: true,
      index: true
    },
    size: {
      type: Number,
      required: [true, 'La taille est requise'],
      min: [0, 'La taille ne peut pas être négative']
    },
    path: {
      type: String,
      required: [true, 'Le chemin est requis'],
      trim: true
    },
    url: {
      type: String,
      required: [true, 'L\'URL est requise'],
      trim: true
    },
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: [true, 'Le type de média est requis'],
      index: true
    },
    alt: {
      type: String,
      trim: true,
      maxlength: [200, 'Le texte alternatif ne peut pas dépasser 200 caractères']
    },
    caption: {
      type: String,
      trim: true,
      maxlength: [500, 'La légende ne peut pas dépasser 500 caractères']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'L\'utilisateur est requis'],
      index: true
    },
    articleId: {
      type: Schema.Types.ObjectId,
      ref: 'Article',
      default: null,
      index: true
    },
    isPublic: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index composé pour les requêtes fréquentes
mediaSchema.index({ userId: 1, type: 1, createdAt: -1 });
mediaSchema.index({ articleId: 1, type: 1 });
mediaSchema.index({ isPublic: 1, type: 1, createdAt: -1 });

// Validation personnalisée pour les types de fichiers
mediaSchema.pre('save', function(next) {
  // Déterminer le type basé sur le mimetype
  if (this.mimetype.startsWith('image/')) {
    this.type = 'image';
  } else if (this.mimetype.startsWith('video/')) {
    this.type = 'video';
  } else {
    this.type = 'document';
  }

  // Valider les types de fichiers autorisés
  const allowedImageTypes = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 
    'image/webp', 'image/svg+xml'
  ];
  
  const allowedVideoTypes = [
    'video/mp4', 'video/webm', 'video/ogg', 'video/avi',
    'video/mov', 'video/wmv', 'video/flv'
  ];

  const allowedDocumentTypes = [
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const allAllowedTypes = [
    ...allowedImageTypes,
    ...allowedVideoTypes,
    ...allowedDocumentTypes
  ];

  if (!allAllowedTypes.includes(this.mimetype)) {
    throw new Error(`Type de fichier non autorisé: ${this.mimetype}`);
  }

  // Valider la taille des fichiers
  const maxSizes = {
    image: 10 * 1024 * 1024,    // 10MB pour les images
    video: 100 * 1024 * 1024,   // 100MB pour les vidéos
    document: 5 * 1024 * 1024   // 5MB pour les documents
  };

  if (this.size > maxSizes[this.type]) {
    throw new Error(`Fichier trop volumineux. Taille maximale pour ${this.type}: ${maxSizes[this.type] / (1024 * 1024)}MB`);
  }

  next();
});

// Middleware pre-remove pour supprimer le fichier physique
mediaSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    await this.delete();
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Méthodes d'instance
mediaSchema.methods.getFullPath = function(): string {
  return path.resolve(this.path);
};

mediaSchema.methods.getPublicUrl = function(): string {
  // Retourner l'URL publique du fichier
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  return `${baseUrl}${this.url}`;
};

mediaSchema.methods.delete = async function(): Promise<void> {
  try {
    const fullPath = this.getFullPath();
    await fs.unlink(fullPath);
    
    // Supprimer aussi la miniature si elle existe
    if (this.type === 'video') {
      const thumbnailPath = fullPath.replace(/\.[^/.]+$/, '_thumb.jpg');
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        // Ignorer si la miniature n'existe pas
      }
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier:', error);
    // Ne pas lever d'erreur si le fichier n'existe pas
  }
};

mediaSchema.methods.generateThumbnail = async function(): Promise<string | null> {
  if (this.type !== 'video') return null;

  // Cette méthode devrait utiliser ffmpeg ou une autre bibliothèque
  // pour générer une miniature de la vidéo
  // Pour l'instant, on retourne null
  return null;
};

mediaSchema.methods.getFileInfo = async function(): Promise<{ exists: boolean; size: number; lastModified: Date }> {
  try {
    const fullPath = this.getFullPath();
    const stats = await fs.stat(fullPath);
    
    return {
      exists: true,
      size: stats.size,
      lastModified: stats.mtime
    };
  } catch (error) {
    return {
      exists: false,
      size: 0,
      lastModified: new Date()
    };
  }
};

// Virtuals pour les relations
mediaSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

mediaSchema.virtual('article', {
  ref: 'Article',
  localField: 'articleId',
  foreignField: '_id',
  justOne: true
});

// Méthodes statiques
mediaSchema.statics.findByUser = function(userId: string, type?: string) {
  const query: any = { userId };
  if (type) query.type = type;
  
  return this.find(query).sort({ createdAt: -1 });
};

mediaSchema.statics.findByArticle = function(articleId: string, type?: string) {
  const query: any = { articleId };
  if (type) query.type = type;
  
  return this.find(query).sort({ createdAt: -1 });
};

mediaSchema.statics.findPublic = function(type?: string) {
  const query: any = { isPublic: true };
  if (type) query.type = type;
  
  return this.find(query).sort({ createdAt: -1 });
};

mediaSchema.statics.findOrphaned = function() {
  return this.find({ articleId: null });
};

mediaSchema.statics.cleanup = async function() {
  // Supprimer les médias orphelins de plus de 24h
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  const orphanedMedia = await this.find({
    articleId: null,
    createdAt: { $lt: oneDayAgo }
  });

  let deletedCount = 0;
  for (const media of orphanedMedia) {
    try {
      await media.deleteOne();
      deletedCount++;
    } catch (error) {
      console.error('Erreur lors de la suppression du média:', error);
    }
  }

  return deletedCount;
};

mediaSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' }
      }
    }
  ]);

  const result = {
    total: 0,
    totalSize: 0,
    images: { count: 0, size: 0 },
    videos: { count: 0, size: 0 },
    documents: { count: 0, size: 0 }
  };

  stats.forEach(stat => {
    result.total += stat.count;
    result.totalSize += stat.totalSize;
    
    if (stat._id === 'image') {
      result.images = { count: stat.count, size: stat.totalSize };
    } else if (stat._id === 'video') {
      result.videos = { count: stat.count, size: stat.totalSize };
    } else if (stat._id === 'document') {
      result.documents = { count: stat.count, size: stat.totalSize };
    }
  });

  return result;
};

const Media = mongoose.model<IMediaDocument>('Media', mediaSchema);

export default Media;
export type { IMediaDocument };
