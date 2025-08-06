import { Request, Response } from "express";
import Tag from "../models/tag.model.js";

// Obtenir tous les tags avec pagination
export const getTags = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const sortOrder = (req.query.sortOrder as string) || "desc";

    // Construction du filtre
    const filter: any = {};

    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Construction du tri
    const sort: any = {};
    sort[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Exécution des requêtes
    const [tags, totalItems] = await Promise.all([
      Tag.find(filter).sort(sort).skip(skip).limit(limit).lean(),
      Tag.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      success: true,
      data: {
        tags,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des tags:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des tags",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Créer un nouveau tag
export const createTag = async (req: Request, res: Response) => {
  try {
    const { name, color = "#6B7280" } = req.body;

    // Validation basique
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Le nom du tag est requis",
      });
    }

    // Vérifier l'unicité du nom
    const existingTag = await Tag.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingTag) {
      return res.status(400).json({
        success: false,
        message: "Un tag avec ce nom existe déjà",
      });
    }

    // Générer un slug à partir du nom
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Vérifier l'unicité du slug
    let finalSlug = slug;
    let counter = 1;
    while (await Tag.findOne({ slug: finalSlug })) {
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    const tag = new Tag({
      name: name.trim(),
      slug: finalSlug,
      color,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTag = await tag.save();

    res.status(201).json({
      success: true,
      data: {
        tag: savedTag,
      },
      message: "Tag créé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la création du tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création du tag",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Obtenir un tag par ID
export const getTagById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id).lean();

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag non trouvé",
      });
    }

    res.json({
      success: true,
      data: {
        tag,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du tag",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Mettre à jour un tag
export const updateTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Mettre à jour la date de modification
    updateData.updatedAt = new Date();

    // Vérifier l'unicité du nom si il est modifié
    if (updateData.name) {
      const existingTag = await Tag.findOne({
        name: { $regex: new RegExp(`^${updateData.name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingTag) {
        return res.status(400).json({
          success: false,
          message: "Un tag avec ce nom existe déjà",
        });
      }
    }

    const tag = await Tag.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag non trouvé",
      });
    }

    res.json({
      success: true,
      data: {
        tag,
      },
      message: "Tag mis à jour avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du tag",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Supprimer un tag
export const deleteTag = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag non trouvé",
      });
    }

    res.json({
      success: true,
      message: "Tag supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du tag:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression du tag",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Obtenir les statistiques des tags
export const getTagStats = async (req: Request, res: Response) => {
  try {
    const totalTags = await Tag.countDocuments();

    res.json({
      success: true,
      data: {
        stats: {
          totalTags,
        },
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};

// Fusionner des tags
export const mergeTags = async (req: Request, res: Response) => {
  try {
    const { sourceTagIds, targetTagId } = req.body;

    if (!sourceTagIds || !Array.isArray(sourceTagIds) || !targetTagId) {
      return res.status(400).json({
        success: false,
        message: "IDs des tags source et target requis",
      });
    }

    // Vérifier que le tag target existe
    const targetTag = await Tag.findById(targetTagId);
    if (!targetTag) {
      return res.status(404).json({
        success: false,
        message: "Tag target non trouvé",
      });
    }

    // TODO: Mettre à jour tous les articles qui utilisent les tags source
    // pour utiliser le tag target à la place
    // Cette fonctionnalité sera implémentée quand les relations seront activées

    // Supprimer les tags source
    await Tag.deleteMany({ _id: { $in: sourceTagIds } });

    res.json({
      success: true,
      message: `${sourceTagIds.length} tag(s) fusionné(s) avec succès`,
    });
  } catch (error) {
    console.error("Erreur lors de la fusion des tags:", error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la fusion des tags",
      error: process.env.NODE_ENV === "development" ? error : undefined,
    });
  }
};
