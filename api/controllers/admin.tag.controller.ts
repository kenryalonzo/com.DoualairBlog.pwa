import { Response } from "express";
import Tag from "../models/tag.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";

// Créer un nouveau tag
export const createTag: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      throw createError(400, "Le nom du tag est requis");
    }

    // Vérifier si le tag existe déjà
    const existingTag = await Tag.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingTag) {
      throw createError(400, "Un tag avec ce nom existe déjà");
    }

    const tag = new Tag({
      name,
      description,
      color
    });

    await tag.save();

    res.status(201).json({
      success: true,
      message: "Tag créé avec succès",
      data: { tag }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir tous les tags
export const getTags: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      page = '1',
      limit = '50',
      search,
      sort = 'name',
      order = 'asc',
      withArticles = 'false'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const filters: any = {};

    if (search) {
      filters.$text = { $search: search as string };
    }

    if (withArticles === 'true') {
      filters.articlesCount = { $gt: 0 };
    }

    // Construire le tri
    const sortObj: any = {};
    if (sort === 'popularity') {
      sortObj.articlesCount = order === 'asc' ? 1 : -1;
      sortObj.name = 1; // Tri secondaire par nom
    } else {
      sortObj[sort as string] = order === 'asc' ? 1 : -1;
    }

    // Exécuter la requête
    const [tags, total] = await Promise.all([
      Tag.find(filters)
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Tag.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        tags,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir un tag par ID
export const getTagById: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);

    if (!tag) {
      throw createError(404, "Tag non trouvé");
    }

    res.json({
      success: true,
      data: { tag }
    });
  } catch (error) {
    throw error;
  }
};

// Mettre à jour un tag
export const updateTag: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      throw createError(404, "Tag non trouvé");
    }

    // Vérifier l'unicité du nom si modifié
    if (updateData.name && updateData.name !== tag.name) {
      const existingTag = await Tag.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingTag) {
        throw createError(400, "Un tag avec ce nom existe déjà");
      }
    }

    // Mettre à jour le tag
    Object.assign(tag, updateData);
    await tag.save();

    res.json({
      success: true,
      message: "Tag mis à jour avec succès",
      data: { tag }
    });
  } catch (error) {
    throw error;
  }
};

// Supprimer un tag
export const deleteTag: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      throw createError(404, "Tag non trouvé");
    }

    await tag.deleteOne();

    res.json({
      success: true,
      message: "Tag supprimé avec succès"
    });
  } catch (error) {
    throw error;
  }
};

// Fusionner deux tags
export const mergeTags: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { sourceId, targetId } = req.body;

    if (!sourceId || !targetId) {
      throw createError(400, "Les IDs des tags source et cible sont requis");
    }

    if (sourceId === targetId) {
      throw createError(400, "Les tags source et cible ne peuvent pas être identiques");
    }

    const [sourceTag, targetTag] = await Promise.all([
      Tag.findById(sourceId),
      Tag.findById(targetId)
    ]);

    if (!sourceTag) {
      throw createError(404, "Tag source non trouvé");
    }

    if (!targetTag) {
      throw createError(404, "Tag cible non trouvé");
    }

    // Fusionner les tags
    await sourceTag.merge(targetId);

    res.json({
      success: true,
      message: `Tag "${sourceTag.name}" fusionné avec "${targetTag.name}" avec succès`
    });
  } catch (error) {
    throw error;
  }
};

// Nettoyer les tags inutilisés
export const cleanupTags: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const deletedCount = await Tag.cleanup();

    res.json({
      success: true,
      message: `${deletedCount} tag(s) inutilisé(s) supprimé(s) avec succès`,
      data: { deletedCount }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les tags populaires
export const getPopularTags: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { limit = '20' } = req.query;
    const limitNum = parseInt(limit as string);

    const tags = await Tag.findPopular(limitNum);

    res.json({
      success: true,
      data: { tags }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir le nuage de tags
export const getTagCloud: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { limit = '50' } = req.query;
    const limitNum = parseInt(limit as string);

    const tagCloud = await Tag.getTagCloud(limitNum);

    res.json({
      success: true,
      data: { tagCloud }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les statistiques des tags
export const getTagStats: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [stats, recentTags, topTags] = await Promise.all([
      Tag.getStats(),
      Tag.findRecent(5),
      Tag.findPopular(5)
    ]);

    res.json({
      success: true,
      data: {
        stats,
        recentTags,
        topTags
      }
    });
  } catch (error) {
    throw error;
  }
};

// Créer plusieurs tags en une fois
export const createMultipleTags: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { names } = req.body;

    if (!Array.isArray(names) || names.length === 0) {
      throw createError(400, "Une liste de noms de tags est requise");
    }

    const tags = await Tag.findOrCreate(names);

    res.status(201).json({
      success: true,
      message: `${tags.length} tag(s) créé(s) ou trouvé(s) avec succès`,
      data: { tags }
    });
  } catch (error) {
    throw error;
  }
};
