import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Palette,
  Eye,
  EyeOff,
  Save,
  X,
  Folder,
  Hash,
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import type { Category } from '../../services/categoryService';
import { categoryService } from '../../services/categoryService';

const CategoryManagement: React.FC = () => {
  const { toast } = useToastContext();
  
  // États
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3B82F6',
    isActive: true,
  });

  // Couleurs prédéfinies
  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
  ];

  // Chargement des catégories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoryService.getAll({ limit: 100 });
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des catégories
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Gestion du formulaire
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom de la catégorie est obligatoire');
      return;
    }

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory._id, formData);
        toast.success('Catégorie mise à jour avec succès !');
      } else {
        await categoryService.create(formData);
        toast.success('Catégorie créée avec succès !');
      }
      
      resetForm();
      loadCategories();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      color: '#3B82F6',
      isActive: true,
    });
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3B82F6',
      isActive: category.isActive,
    });
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la catégorie "${category.name}" ?`)) {
      return;
    }

    try {
      await categoryService.delete(category._id);
      toast.success('Catégorie supprimée avec succès !');
      loadCategories();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      await categoryService.update(category._id, { isActive: !category.isActive });
      toast.success(`Catégorie ${category.isActive ? 'désactivée' : 'activée'} !`);
      loadCategories();
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestion des Catégories</h1>
          <p className="text-base-content/60">
            Organisez vos articles par catégories
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Catégorie
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-primary">
            <Folder className="w-8 h-8" />
          </div>
          <div className="stat-title">Total</div>
          <div className="stat-value text-primary">{categories.length}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-success">
            <Eye className="w-8 h-8" />
          </div>
          <div className="stat-title">Actives</div>
          <div className="stat-value text-success">
            {categories.filter(c => c.isActive).length}
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-warning">
            <EyeOff className="w-8 h-8" />
          </div>
          <div className="stat-title">Inactives</div>
          <div className="stat-value text-warning">
            {categories.filter(c => !c.isActive).length}
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher une catégorie..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCategories.map((category) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="card-body">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <h3 className="font-semibold">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-base-content/60 mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="dropdown dropdown-end">
                  <button className="btn btn-ghost btn-sm">
                    <Hash className="w-4 h-4" />
                  </button>
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52">
                    <li>
                      <button onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4" />
                        Modifier
                      </button>
                    </li>
                    <li>
                      <button onClick={() => toggleActive(category)}>
                        {category.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4" />
                            Désactiver
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4" />
                            Activer
                          </>
                        )}
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleDelete(category)}
                        className="text-error"
                      >
                        <Trash2 className="w-4 h-4" />
                        Supprimer
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <span className={`badge ${category.isActive ? 'badge-success' : 'badge-warning'}`}>
                  {category.isActive ? 'Active' : 'Inactive'}
                </span>
                <span className="text-xs text-base-content/40">
                  {category.articleCount || 0} articles
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-12">
          <Folder className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <h3 className="text-lg font-medium mb-2">Aucune catégorie trouvée</h3>
          <p className="text-base-content/60 mb-4">
            {searchTerm ? 'Aucune catégorie ne correspond à votre recherche.' : 'Commencez par créer votre première catégorie.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une catégorie
            </button>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom *</span>
                </label>
                <input
                  type="text"
                  placeholder="Nom de la catégorie"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Description</span>
                </label>
                <textarea
                  placeholder="Description de la catégorie"
                  className="textarea textarea-bordered h-20"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Couleur</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === color ? 'border-base-content' : 'border-base-300'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleInputChange('color', color)}
                    />
                  ))}
                </div>
                <input
                  type="color"
                  className="input input-bordered w-full h-12"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>

              <div className="form-control">
                <label className="label cursor-pointer">
                  <span className="label-text">Catégorie active</span>
                  <input
                    type="checkbox"
                    className="toggle toggle-primary"
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn btn-ghost"
                >
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingCategory ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
