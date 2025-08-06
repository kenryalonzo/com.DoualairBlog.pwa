import { Request, Response } from "express";
import Category from "../models/category.model.js";

// Obtenir toutes les catégories avec pagination
export const getCategories = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;
    const sortBy = req.query.sortBy as string || 'createdAt';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Construction du filtre
    const filter: any = {};
    
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Exécution des requêtes
    const [categories, totalItems] = await Promise.all([
      Category.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(),
      Category.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        categories,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des catégories',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Créer une nouvelle catégorie
export const createCategory = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      color = '#3B82F6',
      isActive = true
    } = req.body;

    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Le nom de la catégorie est requis'
      });
    }

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Vérifier l'unicité du slug
    let finalSlug = slug;
    let counter = 1;
    while (await Category.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const category = new Category({
      name,
      slug: finalSlug,
      description,
      color,
      isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      data: {
        category: savedCategory
      },
      message: 'Catégorie créée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la création de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Obtenir une catégorie par ID
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id).lean();

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Mettre à jour une catégorie
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Mettre à jour la date de modification
    updateData.updatedAt = new Date();

    const category = await Category.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      data: {
        category
      },
      message: 'Catégorie mise à jour avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Supprimer une catégorie
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }

    res.json({
      success: true,
      message: 'Catégorie supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression de la catégorie',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Obtenir les statistiques des catégories
export const getCategoryStats = async (req: Request, res: Response) => {
  try {
    const [
      totalCategories,
      activeCategories,
      inactiveCategories
    ] = await Promise.all([
      Category.countDocuments(),
      Category.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: false })
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalCategories,
          activeCategories,
          inactiveCategories
        }
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};
