import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bold,
  Code,
  Eye,
  FileText,
  Globe,
  Hash,
  Italic,
  Link2,
  List,
  Monitor,
  Quote,
  Save,
  Settings,
  Smartphone,
  Star,
  Tag,
  Type,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToastContext } from "../../contexts/ToastContext";
import type { Article, CreateArticleData } from "../../services/articleService";
import { articleService } from "../../services/articleService";
import type { Category } from "../../services/categoryService";
import { categoryService } from "../../services/categoryService";
import type { Tag as TagType } from "../../services/tagService";
import { tagService } from "../../services/tagService";

interface ArticleEditorProps {
  article?: Article | null;
  onSave?: (article: Article) => void;
  onCancel?: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({
  article,
  onSave,
  onCancel,
}) => {
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
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">(
    "desktop"
  );
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const { toast } = useToastContext();

  // Charger les données initiales
  useEffect(() => {
    loadCategories();
    loadTags();

    if (article) {
      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || "",
        featuredImage: article.featuredImage,
        featuredVideo: article.featuredVideo,
        videoType: article.videoType,
        categoryId: article.categoryId,
        tags: article.tags,
        status: article.status,
        isFeatured: article.isFeatured,
        seoTitle: article.seoTitle,
        seoDescription: article.seoDescription,
        seoKeywords: article.seoKeywords,
      });
      setSelectedTags(article.tags);
    }
  }, [article]);

  // Raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (!isCtrlOrCmd) return;

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          handleSave();
          break;
        case "b":
          e.preventDefault();
          handleShortcut("bold");
          break;
        case "i":
          e.preventDefault();
          handleShortcut("italic");
          break;
        case "k":
          e.preventDefault();
          handleShortcut("link");
          break;
        case "e":
          e.preventDefault();
          handleShortcut("code");
          break;
        case "p":
          e.preventDefault();
          handleShortcut("preview");
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [activeTab]);

  // Chargement des catégories
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

  // Chargement des tags
  const loadTags = async () => {
    try {
      const response = await tagService.getAll({ limit: 100 });
      setAvailableTags(response.tags || []);
    } catch (error) {
      console.error("Erreur lors du chargement des tags:", error);
    }
  };

  // Sauvegarde automatique
  useEffect(() => {
    if (!formData.title && !formData.content) return;

    const autoSaveTimer = setTimeout(() => {
      handleAutoSave();
    }, 30000); // Auto-save toutes les 30 secondes

    return () => clearTimeout(autoSaveTimer);
  }, [formData]);

  // Gestionnaires d'événements
  const handleInputChange = (field: keyof CreateArticleData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoSave = async () => {
    if (!article || !formData.title) return;

    try {
      setAutoSaving(true);
      await articleService.update(article._id, formData);
      setLastSaved(new Date());
    } catch (error) {
      console.error("Erreur lors de la sauvegarde automatique:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleSave = async (status?: "draft" | "published" | "archived") => {
    if (!formData.title.trim()) {
      toast.error("Le titre est requis");
      return;
    }

    if (!formData.content.trim()) {
      toast.error("Le contenu est requis");
      return;
    }

    try {
      setSaving(true);
      const dataToSave = {
        ...formData,
        tags: selectedTags,
        status: status || formData.status,
      };

      let savedArticle: Article;

      if (article) {
        const response = await articleService.update(article._id, dataToSave);
        savedArticle = response.article;
        toast.success("Article mis à jour avec succès");
      } else {
        const response = await articleService.create(dataToSave);
        savedArticle = response.article;
        toast.success("Article créé avec succès");
      }

      setLastSaved(new Date());
      onSave?.(savedArticle);
    } catch (error: any) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error(error.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      // Vérifier si le tag existe déjà
      const existingTag = availableTags.find(
        (tag) => tag.name.toLowerCase() === newTag.toLowerCase()
      );

      if (existingTag) {
        if (!selectedTags.includes(existingTag._id)) {
          setSelectedTags((prev) => [...prev, existingTag._id]);
        }
      } else {
        // Créer un nouveau tag
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

  const insertMarkdown = (syntax: string, placeholder = "") => {
    const textarea = document.getElementById(
      "content-editor"
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = selectedText || placeholder;

    let newText = "";
    switch (syntax) {
      case "bold":
        newText = `**${replacement}**`;
        break;
      case "italic":
        newText = `*${replacement}*`;
        break;
      case "code":
        newText = `\`${replacement}\``;
        break;
      case "quote":
        newText = `> ${replacement}`;
        break;
      case "list":
        newText = `- ${replacement}`;
        break;
      case "heading":
        newText = `## ${replacement}`;
        break;
      case "link":
        newText = `[${replacement || "texte du lien"}](url)`;
        break;
      default:
        newText = replacement;
    }

    const newContent =
      textarea.value.substring(0, start) +
      newText +
      textarea.value.substring(end);

    handleInputChange("content", newContent);

    // Repositionner le curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + newText.length,
        start + newText.length
      );
    }, 0);
  };

  const generateExcerpt = () => {
    if (!formData.content) return;

    // Extraire le texte sans markdown
    const plainText = formData.content
      .replace(/[#*`>\-\[\]]/g, "")
      .replace(/\n+/g, " ")
      .trim();

    const excerpt =
      plainText.substring(0, 160) + (plainText.length > 160 ? "..." : "");
    handleInputChange("excerpt", excerpt);
  };

  const formatLastSaved = () => {
    if (!lastSaved) return "";
    return `Dernière sauvegarde: ${lastSaved.toLocaleTimeString()}`;
  };

  // Gestionnaire des raccourcis clavier
  const handleShortcut = (action: string) => {
    switch (action) {
      case "save":
        handleSave();
        break;
      case "bold":
        insertMarkdown("bold", "texte en gras");
        break;
      case "italic":
        insertMarkdown("italic", "texte en italique");
        break;
      case "code":
        insertMarkdown("code", "code");
        break;
      case "link":
        insertMarkdown("link");
        break;
      case "preview":
        setActiveTab(activeTab === "edit" ? "preview" : "edit");
        break;
    }
  };

  return (
    <div className="h-full flex flex-col bg-base-100">
      {/* Header de l'éditeur */}
      <div className="flex items-center justify-between p-4 border-b border-base-300">
        <div className="flex items-center gap-4">
          <button onClick={onCancel} className="btn btn-ghost btn-sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </button>

          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">
              {article ? "Modifier l'article" : "Nouvel article"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Statut de sauvegarde */}
          <div className="text-xs text-base-content/60">
            {autoSaving && (
              <span className="flex items-center gap-1">
                <span className="loading loading-spinner loading-xs"></span>
                Sauvegarde...
              </span>
            )}
            {lastSaved && !autoSaving && <span>{formatLastSaved()}</span>}
          </div>

          {/* Actions */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`btn btn-sm ${
              showSettings ? "btn-active" : "btn-ghost"
            }`}
          >
            <Settings className="w-4 h-4" />
          </button>

          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Sauvegarder
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <button onClick={() => handleSave("draft")}>
                  <FileText className="w-4 h-4" />
                  Sauvegarder en brouillon
                </button>
              </li>
              <li>
                <button onClick={() => handleSave("published")}>
                  <Globe className="w-4 h-4" />
                  Publier l'article
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Panneau principal */}
        <div className="flex-1 flex flex-col">
          {/* Onglets */}
          <div className="flex items-center border-b border-base-300">
            <button
              onClick={() => setActiveTab("edit")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "edit"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/70 hover:text-base-content"
              }`}
            >
              <Type className="w-4 h-4 mr-2 inline" />
              Édition
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-4 py-2 text-sm font-medium border-b-2 ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-base-content/70 hover:text-base-content"
              }`}
            >
              <Eye className="w-4 h-4 mr-2 inline" />
              Aperçu
            </button>

            {activeTab === "preview" && (
              <div className="ml-auto flex items-center gap-2 px-4">
                <button
                  onClick={() => setPreviewMode("desktop")}
                  className={`btn btn-xs ${
                    previewMode === "desktop" ? "btn-active" : "btn-ghost"
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setPreviewMode("mobile")}
                  className={`btn btn-xs ${
                    previewMode === "mobile" ? "btn-active" : "btn-ghost"
                  }`}
                >
                  <Smartphone className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              {activeTab === "edit" ? (
                <motion.div
                  key="edit"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Barre d'outils markdown */}
                  <div className="flex items-center gap-1 p-2 border-b border-base-300 bg-base-50">
                    <button
                      onClick={() => insertMarkdown("bold", "texte en gras")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Gras"
                    >
                      <Bold className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() =>
                        insertMarkdown("italic", "texte en italique")
                      }
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Italique"
                    >
                      <Italic className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("code", "code")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Code"
                    >
                      <Code className="w-3 h-3" />
                    </button>
                    <div className="divider divider-horizontal"></div>
                    <button
                      onClick={() => insertMarkdown("heading", "Titre")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Titre"
                    >
                      <Hash className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("quote", "citation")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Citation"
                    >
                      <Quote className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("list", "élément de liste")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Liste"
                    >
                      <List className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => insertMarkdown("link")}
                      className="btn btn-xs btn-ghost tooltip"
                      data-tip="Lien"
                    >
                      <Link2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Zone d'édition */}
                  <div className="flex-1 p-4 overflow-auto">
                    {/* Titre */}
                    <input
                      type="text"
                      placeholder="Titre de l'article..."
                      className="input input-ghost text-3xl font-bold w-full mb-4 p-0 border-none focus:outline-none"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                    />

                    {/* Contenu */}
                    <textarea
                      id="content-editor"
                      placeholder="Commencez à écrire votre article..."
                      className="textarea textarea-ghost w-full h-96 resize-none border-none focus:outline-none text-base leading-relaxed"
                      value={formData.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full overflow-auto"
                >
                  <div
                    className={`mx-auto p-6 ${
                      previewMode === "mobile" ? "max-w-sm" : "max-w-4xl"
                    }`}
                  >
                    {/* Aperçu de l'article */}
                    <article className="bg-base-100 rounded-lg p-6 shadow-sm">
                      {/* Métadonnées de l'article */}
                      <div className="mb-6">
                        {formData.isFeatured && (
                          <div className="badge badge-warning mb-2">
                            <Star className="w-3 h-3 mr-1" />À la une
                          </div>
                        )}
                        <h1 className="text-4xl font-bold mb-4">
                          {formData.title || "Titre de l'article"}
                        </h1>
                        {formData.excerpt && (
                          <p className="text-lg text-base-content/70 mb-4">
                            {formData.excerpt}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-base-content/60">
                          <span>Par Auteur</span>
                          <span>•</span>
                          <span>{new Date().toLocaleDateString("fr-FR")}</span>
                          {formData.categoryId && (
                            <>
                              <span>•</span>
                              <span>
                                {categories.find(
                                  (c) => c._id === formData.categoryId
                                )?.name || "Catégorie"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Image à la une */}
                      {formData.featuredImage && (
                        <div className="mb-6">
                          <img
                            src={formData.featuredImage}
                            alt={formData.title}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* Contenu avec rendu markdown simple */}
                      <div className="prose prose-lg max-w-none">
                        <div
                          className="text-base leading-relaxed whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{
                            __html: (
                              formData.content ||
                              "Commencez à écrire votre article..."
                            )
                              .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                              .replace(/\*(.*?)\*/g, "<em>$1</em>")
                              .replace(
                                /`(.*?)`/g,
                                '<code class="bg-base-200 px-1 py-0.5 rounded">$1</code>'
                              )
                              .replace(
                                /^## (.*$)/gim,
                                '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>'
                              )
                              .replace(
                                /^# (.*$)/gim,
                                '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>'
                              )
                              .replace(/\n\n/g, '</p><p class="mb-4">')
                              .replace(/\n/g, "<br>"),
                          }}
                        />
                      </div>

                      {/* Tags */}
                      {selectedTags.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-base-300">
                          <div className="flex flex-wrap gap-2">
                            {(selectedTags || []).map((tagId) => {
                              const tag = availableTags.find(
                                (t) => t._id === tagId
                              );
                              if (!tag) return null;
                              return (
                                <span
                                  key={tagId}
                                  className="badge badge-outline"
                                  style={{ borderColor: tag.color }}
                                >
                                  {tag.name}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </article>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Panneau latéral des paramètres */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="border-l border-base-300 bg-base-50 overflow-hidden"
            >
              <div className="p-4 h-full overflow-auto">
                <h3 className="font-semibold mb-4">Paramètres de l'article</h3>

                {/* Statut et visibilité */}
                <div className="space-y-4">
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
                    <label className="cursor-pointer label">
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

                  {/* Catégorie */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Catégorie</span>
                    </label>
                    <select
                      className="select select-bordered select-sm"
                      value={formData.categoryId || ""}
                      onChange={(e) =>
                        handleInputChange(
                          "categoryId",
                          e.target.value || undefined
                        )
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

                  {/* Tags */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Tags</span>
                    </label>

                    {/* Tags sélectionnés */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      {(selectedTags || []).map((tagId) => {
                        const tag = availableTags.find((t) => t._id === tagId);
                        if (!tag) return null;
                        return (
                          <span
                            key={tagId}
                            className="badge badge-primary gap-2"
                          >
                            {tag.name}
                            <button
                              onClick={() => handleRemoveTag(tagId)}
                              className="btn btn-ghost btn-xs"
                            >
                              ×
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
                        onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                      />
                      <button
                        onClick={handleAddTag}
                        className="btn btn-primary btn-sm join-item"
                      >
                        <Tag className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Tags disponibles */}
                    <div className="mt-2 max-h-32 overflow-auto">
                      {(availableTags || [])
                        .filter(
                          (tag) => !(selectedTags || []).includes(tag._id)
                        )
                        .map((tag) => (
                          <button
                            key={tag._id}
                            onClick={() =>
                              setSelectedTags((prev) => [...prev, tag._id])
                            }
                            className="badge badge-outline badge-sm mr-1 mb-1"
                          >
                            {tag.name}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Extrait */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Extrait</span>
                      <button
                        onClick={generateExcerpt}
                        className="btn btn-xs btn-ghost"
                      >
                        Auto-générer
                      </button>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Résumé de l'article..."
                      rows={3}
                      value={formData.excerpt}
                      onChange={(e) =>
                        handleInputChange("excerpt", e.target.value)
                      }
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        {formData.excerpt?.length || 0}/160 caractères
                      </span>
                    </label>
                  </div>

                  {/* Image à la une */}
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Image à la une</span>
                    </label>
                    <input
                      type="url"
                      placeholder="URL de l'image..."
                      className="input input-bordered input-sm"
                      value={formData.featuredImage || ""}
                      onChange={(e) =>
                        handleInputChange("featuredImage", e.target.value)
                      }
                    />
                    {formData.featuredImage && (
                      <div className="mt-2">
                        <img
                          src={formData.featuredImage}
                          alt="Aperçu"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>

                  {/* SEO */}
                  <div className="divider">SEO</div>

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
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        {formData.seoTitle?.length || 0}/60 caractères
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Description SEO</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered textarea-sm"
                      placeholder="Description pour les moteurs de recherche..."
                      rows={2}
                      value={formData.seoDescription || ""}
                      onChange={(e) =>
                        handleInputChange("seoDescription", e.target.value)
                      }
                    />
                    <label className="label">
                      <span className="label-text-alt">
                        {formData.seoDescription?.length || 0}/160 caractères
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Indicateur de raccourcis */}
      <div className="fixed bottom-4 right-4 z-50">
        <div
          className="tooltip tooltip-left"
          data-tip="Ctrl+S: Sauvegarder, Ctrl+B: Gras, Ctrl+I: Italique"
        >
          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="btn btn-circle btn-primary shadow-lg"
          >
            ⌨️
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArticleEditor;
