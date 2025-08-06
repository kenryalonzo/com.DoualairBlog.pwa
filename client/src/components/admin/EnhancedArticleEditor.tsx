import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  FileText,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  Monitor,
  Plus,
  Quote,
  Save,
  Settings,
  Smartphone,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useToastContext } from "../../contexts/ToastContext";
import type { Article, CreateArticleData } from "../../services/articleService";
import { articleService } from "../../services/articleService";
import type { Category } from "../../services/categoryService";
import { categoryService } from "../../services/categoryService";
import type { Tag as TagType } from "../../services/tagService";
import { tagService } from "../../services/tagService";
import KeyboardShortcuts from "../ui/KeyboardShortcuts";
import MarkdownPreview from "../ui/MarkdownPreview";

interface EnhancedArticleEditorProps {
  article?: Article | null;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

interface UploadedMedia {
  id: string;
  url: string;
  name: string;
  size: number;
  type: string;
  mediaType: "image" | "video";
}

const EnhancedArticleEditor: React.FC<EnhancedArticleEditorProps> = ({
  article,
  onSave,
  onCancel,
}) => {
  const { toast } = useToastContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // États principaux
  const [formData, setFormData] = useState<CreateArticleData>({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    isFeatured: false,
    tags: [],
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // États de l'interface
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // États pour l'upload de médias
  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [showMediaGallery, setShowMediaGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Initialisation
  useEffect(() => {
    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt,
        categoryId: article.categoryId,
        status: article.status,
        isFeatured: article.isFeatured,
        tags: article.tags,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        seoKeywords: article.seoKeywords,
        featuredImage: article.featuredImage,
      });
      setSelectedTags(article.tags);
    }
    loadCategories();
    loadTags();
  }, [article]);

  // Auto-save
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (formData.title || formData.content) {
        handleAutoSave();
      }
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault();
            handleSave();
            break;
          case "b":
            e.preventDefault();
            insertMarkdown("**", "**");
            break;
          case "i":
            e.preventDefault();
            insertMarkdown("*", "*");
            break;
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Chargement des données
  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll({
        limit: 100,
        isActive: true,
      });
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Erreur lors du chargement des catégories:", error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await tagService.getAll({ limit: 100 });
      setAvailableTags(response.tags || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  // Gestionnaires d'événements
  const handleInputChange = (field: keyof CreateArticleData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoSave = async () => {
    if (!formData.title && !formData.content) return;

    try {
      // Logique d'auto-save (optionnelle)
      setLastSaved(new Date());
    } catch (error) {
      console.error("Erreur lors de l'auto-save:", error);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Le titre est obligatoire");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Le contenu est obligatoire");
      return;
    }

    setIsLoading(true);
    try {
      const dataToSave = {
        ...formData,
        tags: selectedTags,
      };

      let savedArticle: Article;
      if (article && article._id) {
        savedArticle = await articleService.update(article._id, dataToSave);
        toast.success("Article mis à jour avec succès !");
      } else {
        savedArticle = await articleService.create(dataToSave);
        toast.success("Article créé avec succès !");
      }

      setLastSaved(new Date());
      if (onSave && savedArticle) {
        onSave(savedArticle);
      }
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des tags
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const existingTag = availableTags.find(
        (tag) => tag.name.toLowerCase() === newTag.toLowerCase()
      );

      if (existingTag) {
        if (!selectedTags.includes(existingTag._id)) {
          setSelectedTags((prev) => [...prev, existingTag._id]);
        }
      } else {
        const response = await tagService.create({ name: newTag });
        const newTagObj = response.tag;
        setAvailableTags((prev) => [...prev, newTagObj]);
        setSelectedTags((prev) => [...prev, newTagObj._id]);
      }

      setNewTag("");
    } catch (error) {
      console.error("Erreur lors de l'ajout du tag:", error);
      toast.error("Erreur lors de l'ajout du tag");
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
  };

  // Gestion de l'upload de médias
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        uploadMedia(file);
      } else {
        toast.error(`${file.name} n'est pas un fichier média valide`);
      }
    });
  };

  const uploadMedia = async (file: File) => {
    setUploadProgress(0);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file); // L'endpoint accepte "image" pour tous les médias

      // Appel API réel pour l'upload
      const response = await fetch("/api/upload/image", {
        method: "POST",
        body: formDataUpload,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload");
      }

      const result = await response.json();

      const uploadedMediaItem: UploadedMedia = {
        id: result.id || Date.now().toString(),
        url: result.url || URL.createObjectURL(file), // Fallback vers URL locale
        name: file.name,
        size: file.size,
        type: file.type,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      };

      setUploadedMedia((prev) => [...prev, uploadedMediaItem]);
      setUploadProgress(null);
      const mediaType = file.type.startsWith("video/") ? "Vidéo" : "Image";
      toast.success(`${mediaType} ${file.name} uploadée avec succès !`);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);

      // Fallback : utiliser une URL locale si l'upload échoue
      const mediaUrl = URL.createObjectURL(file);
      const uploadedMediaItem: UploadedMedia = {
        id: Date.now().toString(),
        url: mediaUrl,
        name: file.name,
        size: file.size,
        type: file.type,
        mediaType: file.type.startsWith("video/") ? "video" : "image",
      };

      setUploadedMedia((prev) => [...prev, uploadedMediaItem]);
      setUploadProgress(null);
      const mediaType = file.type.startsWith("video/") ? "Vidéo" : "Image";
      toast.warning(
        `${mediaType} ${file.name} ajoutée localement (upload serveur échoué)`
      );
    }
  };

  // Gestion du drag & drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, []);

  // Insertion de markdown
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);

    const newText = before + selectedText + after;
    const newContent =
      formData.content.substring(0, start) +
      newText +
      formData.content.substring(end);

    handleInputChange("content", newContent);

    // Repositionner le curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const insertMedia = (
    mediaUrl: string,
    altText: string = "",
    mediaType: "image" | "video" = "image"
  ) => {
    let markdown: string;
    if (mediaType === "video") {
      // Pour les vidéos, on utilise une balise HTML video
      markdown = `<video controls width="100%" style="max-width: 600px;">
  <source src="${mediaUrl}" type="video/mp4">
  Votre navigateur ne supporte pas la lecture de vidéos.
</video>`;
    } else {
      // Pour les images, on utilise la syntaxe markdown classique
      markdown = `![${altText}](${mediaUrl})`;
    }
    insertMarkdown(markdown);
    setShowMediaGallery(false);
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-base-100 border-b border-base-300 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button onClick={onCancel} className="btn btn-ghost btn-sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </button>
              <h1 className="text-xl font-semibold">
                {article ? "Modifier l'article" : "Nouvel article"}
              </h1>
              {lastSaved && (
                <span className="text-sm text-base-content/60">
                  Dernière sauvegarde : {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Boutons de vue */}
              <div className="join">
                <button
                  onClick={() => setViewMode("desktop")}
                  className={`btn btn-sm join-item ${
                    viewMode === "desktop" ? "btn-active" : "btn-outline"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("tablet")}
                  className={`btn btn-sm join-item ${
                    viewMode === "tablet" ? "btn-active" : "btn-outline"
                  }`}
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`btn btn-sm join-item ${
                    viewMode === "mobile" ? "btn-active" : "btn-outline"
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>

              {/* Boutons d'action */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`btn btn-sm ${
                  showSettings ? "btn-active" : "btn-outline"
                }`}
              >
                <Settings className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowShortcuts(true)}
                className="btn btn-sm btn-outline"
                title="Raccourcis clavier"
              >
                ?
              </button>

              <button
                onClick={handleSave}
                disabled={isLoading}
                className="btn btn-primary btn-sm"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Contenu principal */}
          <div className="lg:col-span-3">
            {/* Titre */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Titre de l'article..."
                className="input input-bordered w-full text-2xl font-bold"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
              />
            </div>

            {/* Extrait */}
            <div className="mb-6">
              <textarea
                placeholder="Extrait de l'article (résumé court)..."
                className="textarea textarea-bordered w-full h-20 resize-none"
                value={formData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                maxLength={300}
              />
              <div className="text-right text-sm text-base-content/60 mt-1">
                {formData.excerpt?.length || 0}/300 caractères
              </div>
            </div>

            {/* Onglets */}
            <div className="tabs tabs-boxed mb-4">
              <button
                onClick={() => setActiveTab("edit")}
                className={`tab ${activeTab === "edit" ? "tab-active" : ""}`}
              >
                <Type className="w-4 h-4 mr-2" />
                Édition
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`tab ${activeTab === "preview" ? "tab-active" : ""}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Aperçu
              </button>
            </div>

            {/* Contenu */}
            <div className="card bg-base-100 shadow-sm">
              {activeTab === "edit" ? (
                <div className="card-body p-0">
                  {/* Toolbar */}
                  <div className="flex flex-wrap items-center gap-2 p-4 border-b border-base-300">
                    <button
                      onClick={() => insertMarkdown("**", "**")}
                      className="btn btn-sm btn-ghost"
                      title="Gras (Ctrl+B)"
                    >
                      <Bold className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("*", "*")}
                      className="btn btn-sm btn-ghost"
                      title="Italique (Ctrl+I)"
                    >
                      <Italic className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("`", "`")}
                      className="btn btn-sm btn-ghost"
                      title="Code"
                    >
                      <Code className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("> ")}
                      className="btn btn-sm btn-ghost"
                      title="Citation"
                    >
                      <Quote className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("- ")}
                      className="btn btn-sm btn-ghost"
                      title="Liste"
                    >
                      <List className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("[", "](url)")}
                      className="btn btn-sm btn-ghost"
                      title="Lien"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>

                    <div className="divider divider-horizontal"></div>

                    <button
                      onClick={() => setShowMediaGallery(true)}
                      className="btn btn-sm btn-ghost"
                      title="Insérer un média"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="btn btn-sm btn-ghost"
                      title="Upload d'image"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Zone d'édition */}
                  <div
                    className={`relative ${
                      isDragging
                        ? "bg-primary/10 border-2 border-dashed border-primary"
                        : ""
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <textarea
                      ref={textareaRef}
                      placeholder="Écrivez votre article en Markdown..."
                      className="textarea textarea-bordered w-full min-h-96 resize-none border-0 focus:outline-none"
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                    />

                    {isDragging && (
                      <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-sm">
                        <div className="text-center">
                          <Upload className="w-12 h-12 mx-auto mb-2 text-primary" />
                          <p className="text-lg font-medium">
                            Déposez vos images ici
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barre de progression upload */}
                  {uploadProgress !== null && (
                    <div className="p-4 border-t border-base-300">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Upload en cours...</span>
                        <progress
                          className="progress progress-primary flex-1"
                          value={uploadProgress}
                          max="100"
                        ></progress>
                        <span className="text-sm">{uploadProgress}%</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="card-body">
                  <MarkdownPreview
                    content={
                      formData.content || "Aucun contenu à prévisualiser..."
                    }
                    className="min-h-96"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statut et publication */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-base">Publication</h3>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Statut</span>
                  </label>
                  <select
                    className="select select-bordered select-sm"
                    value={formData.status}
                    onChange={(e) =>
                      handleInputChange("status", e.target.value)
                    }
                  >
                    <option value="draft">Brouillon</option>
                    <option value="published">Publié</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">Article à la une</span>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        handleInputChange("isFeatured", e.target.checked)
                      }
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Catégorie */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-base">Catégorie</h3>
                <select
                  className="select select-bordered select-sm"
                  value={formData.categoryId || ""}
                  onChange={(e) =>
                    handleInputChange("categoryId", e.target.value || undefined)
                  }
                >
                  <option value="">Aucune catégorie</option>
                  {(categories || []).map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tags */}
            <div className="card bg-base-100 shadow-sm">
              <div className="card-body">
                <h3 className="card-title text-base">Tags</h3>

                {/* Tags sélectionnés */}
                <div className="flex flex-wrap gap-2 mb-2">
                  {(selectedTags || []).map((tagId) => {
                    const tag = availableTags.find((t) => t._id === tagId);
                    if (!tag) return null;
                    return (
                      <span key={tagId} className="badge badge-primary gap-2">
                        {tag.name}
                        <button
                          onClick={() => handleRemoveTag(tagId)}
                          className="btn btn-ghost btn-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    );
                  })}
                </div>

                {/* Ajouter un tag */}
                <div className="join">
                  <input
                    type="text"
                    placeholder="Nouveau tag..."
                    className="input input-bordered input-sm join-item flex-1"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  />
                  <button
                    onClick={handleAddTag}
                    className="btn btn-primary btn-sm join-item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Tags disponibles */}
                <div className="mt-2 max-h-32 overflow-auto">
                  {(availableTags || [])
                    .filter((tag) => !(selectedTags || []).includes(tag._id))
                    .map((tag) => (
                      <button
                        key={tag._id}
                        onClick={() =>
                          setSelectedTags((prev) => [...prev, tag._id])
                        }
                        className="btn btn-ghost btn-xs mr-1 mb-1"
                      >
                        {tag.name}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* SEO */}
            {showSettings && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-base">SEO</h3>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Titre SEO</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Titre pour les moteurs de recherche..."
                      className="input input-bordered input-sm"
                      value={formData.seoTitle || ""}
                      onChange={(e) =>
                        handleInputChange("seoTitle", e.target.value)
                      }
                      maxLength={60}
                    />
                    <div className="text-right text-xs text-base-content/60 mt-1">
                      {formData.seoTitle?.length || 0}/60 caractères
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description SEO</span>
                    </label>
                    <textarea
                      placeholder="Description pour les moteurs de recherche..."
                      className="textarea textarea-bordered textarea-sm h-20 resize-none"
                      value={formData.seoDescription || ""}
                      onChange={(e) =>
                        handleInputChange("seoDescription", e.target.value)
                      }
                      maxLength={160}
                    />
                    <div className="text-right text-xs text-base-content/60 mt-1">
                      {formData.seoDescription?.length || 0}/160 caractères
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Mots-clés SEO</span>
                    </label>
                    <input
                      type="text"
                      placeholder="mot-clé1, mot-clé2, mot-clé3..."
                      className="input input-bordered input-sm"
                      value={formData.seoKeywords?.join(", ") || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "seoKeywords",
                          e.target.value
                            .split(",")
                            .map((k) => k.trim())
                            .filter((k) => k)
                        )
                      }
                    />
                    <div className="text-xs text-base-content/60 mt-1">
                      Séparez les mots-clés par des virgules
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Médias uploadés */}
            {uploadedMedia.length > 0 && (
              <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-base">Médias</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {uploadedMedia.map((media) => (
                      <div key={media.id} className="relative group">
                        {media.mediaType === "video" ? (
                          <video
                            src={media.url}
                            className="w-full h-20 object-cover rounded cursor-pointer"
                            onClick={() =>
                              insertMedia(
                                media.url,
                                media.name,
                                media.mediaType
                              )
                            }
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={media.name}
                            className="w-full h-20 object-cover rounded cursor-pointer"
                            onClick={() =>
                              insertMedia(
                                media.url,
                                media.name,
                                media.mediaType
                              )
                            }
                          />
                        )}
                        <button
                          onClick={() =>
                            setUploadedMedia((prev) =>
                              prev.filter((item) => item.id !== media.id)
                            )
                          }
                          className="absolute top-1 right-1 btn btn-ghost btn-xs opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Modal galerie de médias */}
      {showMediaGallery && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <h3 className="font-bold text-lg mb-4">Galerie de médias</h3>

            {uploadedMedia.length === 0 ? (
              <div className="text-center py-8">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
                <p className="text-base-content/60">Aucun média uploadé</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn btn-primary mt-4"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Uploader des médias
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                {uploadedMedia.map((media) => (
                  <div
                    key={media.id}
                    className="cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() =>
                      insertMedia(media.url, media.name, media.mediaType)
                    }
                  >
                    {media.mediaType === "video" ? (
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover rounded"
                      />
                    ) : (
                      <img
                        src={media.url}
                        alt={media.name}
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <p className="text-xs mt-1 truncate">
                      {media.mediaType === "video" ? "🎥" : "🖼️"} {media.name}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-action">
              <button
                onClick={() => setShowMediaGallery(false)}
                className="btn"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal raccourcis clavier */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default EnhancedArticleEditor;
