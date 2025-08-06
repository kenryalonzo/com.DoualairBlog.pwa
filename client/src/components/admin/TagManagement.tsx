import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag as TagIcon,
  Hash,
  Save,
  X,
  Palette,
  TrendingUp,
} from 'lucide-react';
import { useToastContext } from '../../contexts/ToastContext';
import type { Tag } from '../../services/tagService';
import { tagService } from '../../services/tagService';

const TagManagement: React.FC = () => {
  const { toast } = useToastContext();
  
  // États
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  
  // États du formulaire
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
  });

  // Couleurs prédéfinies
  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
    '#64748B', '#0F172A', '#7C2D12', '#166534',
  ];

  // Chargement des tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const response = await tagService.getAll({ limit: 100 });
      setTags(response.tags || []);
    } catch (error) {
      console.error('Erreur lors du chargement des tags:', error);
      toast.error('Erreur lors du chargement des tags');
    } finally {
      setLoading(false);
    }
  };

  // Filtrage des tags
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Tri des tags par utilisation
  const sortedTags = [...filteredTags].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));

  // Gestion du formulaire
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Le nom du tag est obligatoire');
      return;
    }

    try {
      if (editingTag) {
        await tagService.update(editingTag._id, formData);
        toast.success('Tag mis à jour avec succès !');
      } else {
        await tagService.create(formData);
        toast.success('Tag créé avec succès !');
      }
      
      resetForm();
      loadTags();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      color: '#3B82F6',
    });
    setEditingTag(null);
    setShowForm(false);
  };

  const handleEdit = (tag: Tag) => {
    setFormData({
      name: tag.name,
      color: tag.color || '#3B82F6',
    });
    setEditingTag(tag);
    setShowForm(true);
  };

  const handleDelete = async (tag: Tag) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le tag "${tag.name}" ?`)) {
      return;
    }

    try {
      await tagService.delete(tag._id);
      toast.success('Tag supprimé avec succès !');
      loadTags();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      toast.error(error.message || 'Erreur lors de la suppression');
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
          <h1 className="text-2xl font-bold">Gestion des Tags</h1>
          <p className="text-base-content/60">
            Organisez vos articles avec des mots-clés
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Tag
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-primary">
            <TagIcon className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Tags</div>
          <div className="stat-value text-primary">{tags.length}</div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-success">
            <TrendingUp className="w-8 h-8" />
          </div>
          <div className="stat-title">Plus Utilisé</div>
          <div className="stat-value text-success text-sm">
            {sortedTags[0]?.name || 'Aucun'}
          </div>
          <div className="stat-desc">
            {sortedTags[0]?.usageCount || 0} utilisations
          </div>
        </div>
        
        <div className="stat bg-base-100 rounded-lg shadow-sm">
          <div className="stat-figure text-info">
            <Hash className="w-8 h-8" />
          </div>
          <div className="stat-title">Utilisation Totale</div>
          <div className="stat-value text-info">
            {tags.reduce((sum, tag) => sum + (tag.usageCount || 0), 0)}
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Rechercher un tag..."
            className="input input-bordered w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des tags */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedTags.map((tag) => (
          <motion.div
            key={tag._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card bg-base-100 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
          >
            <div className="card-body p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium text-sm">{tag.name}</span>
                </div>
                
                <div className="dropdown dropdown-end">
                  <button className="btn btn-ghost btn-xs">
                    <Hash className="w-3 h-3" />
                  </button>
                  <ul className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-40">
                    <li>
                      <button onClick={() => handleEdit(tag)} className="text-xs">
                        <Edit className="w-3 h-3" />
                        Modifier
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleDelete(tag)}
                        className="text-error text-xs"
                      >
                        <Trash2 className="w-3 h-3" />
                        Supprimer
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-base-content/60">
                  {tag.slug}
                </span>
                <span className="badge badge-sm">
                  {tag.usageCount || 0}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {sortedTags.length === 0 && (
        <div className="text-center py-12">
          <TagIcon className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
          <h3 className="text-lg font-medium mb-2">Aucun tag trouvé</h3>
          <p className="text-base-content/60 mb-4">
            {searchTerm ? 'Aucun tag ne correspond à votre recherche.' : 'Commencez par créer votre premier tag.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer un tag
            </button>
          )}
        </div>
      )}

      {/* Modal de formulaire */}
      {showForm && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingTag ? 'Modifier le tag' : 'Nouveau tag'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Nom *</span>
                </label>
                <input
                  type="text"
                  placeholder="Nom du tag"
                  className="input input-bordered"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt">
                    Le slug sera généré automatiquement
                  </span>
                </label>
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
                      className={`w-6 h-6 rounded-full border-2 ${
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
                  {editingTag ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManagement;
