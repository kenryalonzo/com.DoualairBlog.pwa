import React, { useEffect } from 'react';
import { Keyboard } from 'lucide-react';

interface EditorShortcutsProps {
  onShortcut: (action: string) => void;
  isVisible: boolean;
  onToggle: () => void;
}

const EditorShortcuts: React.FC<EditorShortcutsProps> = ({
  onShortcut,
  isVisible,
  onToggle
}) => {
  // Gestionnaire des raccourcis clavier
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Vérifier si Ctrl/Cmd est pressé
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      
      if (!isCtrlOrCmd) return;

      switch (e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          onShortcut('save');
          break;
        case 'b':
          e.preventDefault();
          onShortcut('bold');
          break;
        case 'i':
          e.preventDefault();
          onShortcut('italic');
          break;
        case 'k':
          e.preventDefault();
          onShortcut('link');
          break;
        case 'e':
          e.preventDefault();
          onShortcut('code');
          break;
        case 'p':
          e.preventDefault();
          onShortcut('preview');
          break;
        case '/':
          e.preventDefault();
          onToggle();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onShortcut, onToggle]);

  const shortcuts = [
    { key: 'Ctrl+S', action: 'Sauvegarder', description: 'Sauvegarder l\'article' },
    { key: 'Ctrl+B', action: 'Gras', description: 'Mettre en gras' },
    { key: 'Ctrl+I', action: 'Italique', description: 'Mettre en italique' },
    { key: 'Ctrl+K', action: 'Lien', description: 'Insérer un lien' },
    { key: 'Ctrl+E', action: 'Code', description: 'Code inline' },
    { key: 'Ctrl+P', action: 'Aperçu', description: 'Basculer l\'aperçu' },
    { key: 'Ctrl+/', action: 'Aide', description: 'Afficher/masquer cette aide' },
  ];

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 right-4 btn btn-circle btn-primary shadow-lg z-50 tooltip tooltip-left"
        data-tip="Raccourcis clavier (Ctrl+/)"
      >
        <Keyboard className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="card bg-base-100 shadow-xl border border-base-300 w-80">
        <div className="card-body p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Keyboard className="w-4 h-4" />
              Raccourcis clavier
            </h3>
            <button
              onClick={onToggle}
              className="btn btn-ghost btn-xs"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-2">
            {shortcuts.map((shortcut, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{shortcut.action}</div>
                  <div className="text-base-content/60 text-xs">{shortcut.description}</div>
                </div>
                <kbd className="kbd kbd-sm">{shortcut.key}</kbd>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-base-300">
            <p className="text-xs text-base-content/60">
              Utilisez ces raccourcis pour éditer plus rapidement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorShortcuts;
