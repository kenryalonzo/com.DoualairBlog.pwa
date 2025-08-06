import { Response } from "express";
import Category from "../models/category.model.js";
import { AuthRequest, ControllerFunction } from "../types/index.js";
import { createError } from "../utils/error.js";

// Créer une nouvelle catégorie
export const createCategory: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name, description, color, icon, parentId } = req.body;

    if (!name) {
      throw createError(400, "Le nom de la catégorie est requis");
    }

    // Vérifier que la catégorie parent existe si fournie
    if (parentId) {
      const parentCategory = await Category.findById(parentId);
      if (!parentCategory) {
        throw createError(404, "Catégorie parent non trouvée");
      }
      if (!parentCategory.isActive) {
        throw createError(400, "La catégorie parent n'est pas active");
      }
    }

    const category = new Category({
      name,
      description,
      color,
      icon,
      parentId: parentId || null
    });

    await category.save();

    // Populer la relation parent pour la réponse
    await category.populate('parent', 'name slug color');

    res.status(201).json({
      success: true,
      message: "Catégorie créée avec succès",
      data: { category }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir toutes les catégories
export const getCategories: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      isActive,
      parentId,
      sort = 'name',
      order = 'asc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Construire les filtres
    const filters: any = {};

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (parentId !== undefined) {
      filters.parentId = parentId === 'null' ? null : parentId;
    }

    if (search) {
      filters.$text = { $search: search as string };
    }

    // Construire le tri
    const sortObj: any = {};
    sortObj[sort as string] = order === 'asc' ? 1 : -1;

    // Exécuter la requête
    const [categories, total] = await Promise.all([
      Category.find(filters)
        .populate('parent', 'name slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum),
      Category.countDocuments(filters)
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: {
        categories,
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

// Obtenir la hiérarchie des catégories
export const getCategoryHierarchy: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const hierarchy = await Category.getHierarchy();

    res.json({
      success: true,
      data: { hierarchy }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir une catégorie par ID
export const getCategoryById: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id)
      .populate('parent', 'name slug color description')
      .populate('children', 'name slug color articlesCount');

    if (!category) {
      throw createError(404, "Catégorie non trouvée");
    }

    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    throw error;
  }
};

// Mettre à jour une catégorie
export const updateCategory: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const category = await Category.findById(id);
    if (!category) {
      throw createError(404, "Catégorie non trouvée");
    }

    // Vérifier la catégorie parent si fournie
    if (updateData.parentId && updateData.parentId !== category.parentId?.toString()) {
      const parentCategory = await Category.findById(updateData.parentId);
      if (!parentCategory) {
        throw createError(404, "Catégorie parent non trouvée");
      }
      if (!parentCategory.isActive) {
        throw createError(400, "La catégorie parent n'est pas active");
      }
    }

    // Mettre à jour la catégorie
    Object.assign(category, updateData);
    await category.save();

    // Populer les relations pour la réponse
    await category.populate([
      { path: 'parent', select: 'name slug color' },
      { path: 'children', select: 'name slug color articlesCount' }
    ]);

    res.json({
      success: true,
      message: "Catégorie mise à jour avec succès",
      data: { category }
    });
  } catch (error) {
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategory: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      throw createError(404, "Catégorie non trouvée");
    }

    // Vérifier s'il y a des catégories enfants
    const childrenCount = await Category.countDocuments({ parentId: id });
    if (childrenCount > 0) {
      throw createError(400, "Impossible de supprimer une catégorie qui a des sous-catégories");
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: "Catégorie supprimée avec succès"
    });
  } catch (error) {
    throw error;
  }
};

// Activer/désactiver une catégorie
export const toggleCategoryStatus: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      throw createError(404, "Catégorie non trouvée");
    }

    category.isActive = isActive;
    await category.save();

    res.json({
      success: true,
      message: `Catégorie ${isActive ? 'activée' : 'désactivée'} avec succès`,
      data: { category }
    });
  } catch (error) {
    throw error;
  }
};

// Obtenir les statistiques des catégories
export const getCategoryStats: ControllerFunction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const [
      totalCategories,
      activeCategories,
      rootCategories,
      categoriesWithArticles,
      topCategories
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ parentId: null, isActive: true }),
      Category.countDocuments({ articlesCount: { $gt: 0 } }),
      Category.find({ articlesCount: { $gt: 0 } })
        .sort({ articlesCount: -1 })
        .limit(5)
        .select('name slug articlesCount color')
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalCategories,
          activeCategories,
          inactiveCategories: totalCategories - activeCategories,
          rootCategories,
          categoriesWithArticles,
          emptyCategoriesCount: totalCategories - categoriesWithArticles
        },
        topCategories
      }
    });
  } catch (error) {
    throw error;
  }
};
