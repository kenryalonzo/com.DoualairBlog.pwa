import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationError } from "express-validator";
import { createError } from "../utils/error.js";

// Interface pour les erreurs de validation formatées
interface FormattedValidationError {
  field: string;
  message: string;
  value?: any;
}

// Middleware pour valider les requêtes
export const validateRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Formater les erreurs pour une meilleure lisibilité
    const formattedErrors: FormattedValidationError[] = errors
      .array()
      .map((error: ValidationError) => {
        if (error.type === 'field') {
          return {
            field: error.path,
            message: error.msg,
            value: error.value
          };
        }
        // Pour les erreurs alternatives ou autres types
        return {
          field: 'unknown',
          message: error.msg,
          value: undefined
        };
      });

    // Créer un message d'erreur détaillé
    const errorMessage = formattedErrors
      .map(err => `${err.field}: ${err.message}`)
      .join(', ');

    // Retourner une erreur 400 avec les détails
    return next(createError(400, `Erreurs de validation: ${errorMessage}`, {
      validationErrors: formattedErrors
    }));
  }

  next();
};

// Middleware pour valider les paramètres de pagination
export const validatePagination = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { page = '1', limit = '10' } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);

  // Valider les valeurs de pagination
  if (isNaN(pageNum) || pageNum < 1) {
    return next(createError(400, "Le numéro de page doit être un entier positif"));
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return next(createError(400, "La limite doit être entre 1 et 100"));
  }

  // Ajouter les valeurs validées à la requête
  req.pagination = {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  };

  next();
};

// Middleware pour valider les paramètres de tri
export const validateSort = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { sort = 'createdAt', order = 'desc' } = req.query;

    // Valider le champ de tri
    if (!allowedFields.includes(sort as string)) {
      return next(createError(400, `Champ de tri invalide. Champs autorisés: ${allowedFields.join(', ')}`));
    }

    // Valider l'ordre de tri
    if (!['asc', 'desc'].includes(order as string)) {
      return next(createError(400, "L'ordre de tri doit être 'asc' ou 'desc'"));
    }

    // Ajouter les valeurs validées à la requête
    req.sort = {
      field: sort as string,
      order: order as string,
      sortObj: { [sort as string]: order === 'asc' ? 1 : -1 }
    };

    next();
  };
};

// Middleware pour valider les filtres de date
export const validateDateFilters = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { dateFrom, dateTo } = req.query;

  if (dateFrom) {
    const fromDate = new Date(dateFrom as string);
    if (isNaN(fromDate.getTime())) {
      return next(createError(400, "Format de date invalide pour dateFrom"));
    }
    req.dateFilters = { ...req.dateFilters, dateFrom: fromDate };
  }

  if (dateTo) {
    const toDate = new Date(dateTo as string);
    if (isNaN(toDate.getTime())) {
      return next(createError(400, "Format de date invalide pour dateTo"));
    }
    req.dateFilters = { ...req.dateFilters, dateTo: toDate };
  }

  // Valider que dateFrom est antérieure à dateTo
  if (req.dateFilters?.dateFrom && req.dateFilters?.dateTo) {
    if (req.dateFilters.dateFrom > req.dateFilters.dateTo) {
      return next(createError(400, "La date de début doit être antérieure à la date de fin"));
    }
  }

  next();
};

// Middleware pour valider les IDs MongoDB
export const validateMongoId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];
    
    if (!id) {
      return next(createError(400, `Paramètre ${paramName} requis`));
    }

    // Vérifier le format MongoDB ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return next(createError(400, `${paramName} invalide`));
    }

    next();
  };
};

// Middleware pour valider les slugs
export const validateSlug = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const slug = req.params[paramName];
    
    if (!slug) {
      return next(createError(400, `Paramètre ${paramName} requis`));
    }

    // Vérifier le format du slug
    if (!slug.match(/^[a-z0-9-]+$/)) {
      return next(createError(400, `${paramName} invalide. Seuls les lettres minuscules, chiffres et tirets sont autorisés`));
    }

    if (slug.length < 2 || slug.length > 100) {
      return next(createError(400, `${paramName} doit contenir entre 2 et 100 caractères`));
    }

    next();
  };
};

// Middleware pour nettoyer et valider les chaînes de caractères
export const sanitizeStrings = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fields.forEach(field => {
      if (req.body[field] && typeof req.body[field] === 'string') {
        // Nettoyer les espaces en début et fin
        req.body[field] = req.body[field].trim();
        
        // Supprimer les caractères de contrôle
        req.body[field] = req.body[field].replace(/[\x00-\x1F\x7F]/g, '');
      }
    });

    next();
  };
};

// Middleware pour valider les types de fichiers
export const validateFileType = (allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    if (!allowedTypes.includes(req.file.mimetype)) {
      return next(createError(400, `Type de fichier non autorisé. Types autorisés: ${allowedTypes.join(', ')}`));
    }

    next();
  };
};

// Middleware pour valider la taille des fichiers
export const validateFileSize = (maxSizeInBytes: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.file) {
      return next();
    }

    if (req.file.size > maxSizeInBytes) {
      const maxSizeInMB = maxSizeInBytes / (1024 * 1024);
      return next(createError(400, `Fichier trop volumineux. Taille maximale: ${maxSizeInMB}MB`));
    }

    next();
  };
};

// Étendre l'interface Request pour inclure nos propriétés personnalisées
declare global {
  namespace Express {
    interface Request {
      pagination?: {
        page: number;
        limit: number;
        skip: number;
      };
      sort?: {
        field: string;
        order: string;
        sortObj: Record<string, 1 | -1>;
      };
      dateFilters?: {
        dateFrom?: Date;
        dateTo?: Date;
      };
    }
  }
}
