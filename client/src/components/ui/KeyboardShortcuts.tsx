import React from 'react';
import { Keyboard, X } from 'lucide-react';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + S', description: 'Sauvegarder l\'article' },
    { key: 'Ctrl + B', description: 'Texte en gras' },
    { key: 'Ctrl + I', description: 'Texte en italique' },
    { key: 'Ctrl + K', description: 'Insérer un lien' },
    { key: 'Ctrl + Shift + I', description: 'Insérer une image' },
    { key: 'Ctrl + Shift + C', description: 'Insérer du code' },
    { key: 'Ctrl + Shift + Q', description: 'Insérer une citation' },
    { key: 'Ctrl + Shift + L', description: 'Insérer une liste' },
    { key: 'Tab', description: 'Indenter (dans les listes)' },
    { key: 'Shift + Tab', description: 'Désindenter (dans les listes)' },
    { key: 'Ctrl + Z', description: 'Annuler' },
    { key: 'Ctrl + Y', description: 'Refaire' },
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg flex items-center">
            <Keyboard className="w-5 h-5 mr-2" />
            Raccourcis clavier
          </h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between py-2 px-3 bg-base-200 rounded">
              <span className="text-sm">{shortcut.description}</span>
              <kbd className="kbd kbd-sm">{shortcut.key}</kbd>
            </div>
          ))}
        </div>

        <div className="modal-action">
          <button onClick={onClose} className="btn">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
