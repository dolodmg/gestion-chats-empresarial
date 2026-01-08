import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { TagBadge } from './TagBadge';

interface Tag {
  name: string;
  color: string;
  _id?: string;
}

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tags: Tag[];
  onCreateTag: (name: string, color: string) => Promise<void>;
  onDeleteTag: (tagName: string) => Promise<void>;
  onUpdateTagColor: (tagName: string, color: string) => Promise<void>;
  readOnly?: boolean; // For advisors - can view and edit colors but not create/delete
}

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  tags,
  onCreateTag,
  onDeleteTag,
  onUpdateTagColor,
  readOnly = false
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editColor, setEditColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setNewTagName('');
      setNewTagColor('#3B82F6');
      setEditingTag(null);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('El nombre de la tag es requerido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onCreateTag(newTagName.trim(), newTagColor);
      setNewTagName('');
      setNewTagColor('#3B82F6');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando tag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTag = async (tagName: string) => {
    if (!confirm(`¿Estás seguro de eliminar la tag "${tagName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await onDeleteTag(tagName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error eliminando tag');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateColor = async (tagName: string) => {
    setLoading(true);
    try {
      await onUpdateTagColor(tagName, editColor);
      setEditingTag(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error actualizando color');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Gestionar etiquetas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Create new tag - Hidden for read-only mode */}
          {!readOnly && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide">
                Crear nueva etiqueta
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
                  placeholder="Nombre de la etiqueta"
                  maxLength={30}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  disabled={loading}
                />
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-14 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  disabled={loading}
                />
                <button
                  onClick={handleCreateTag}
                  disabled={loading || !newTagName.trim()}
                  className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear
                </button>
              </div>
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>
          )}

          {/* Existing tags */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 tracking-wide">
              Tags existentes ({tags.length})
            </h3>

            {tags.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                  <Plus className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 text-sm">
                  No hay etiquetas creadas. Crea tu primera etiqueta arriba.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div
                    key={tag.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      {editingTag === tag.name ? (
                        <>
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            className="w-10 h-10 border border-gray-300 rounded-lg cursor-pointer"
                          />
                          <TagBadge
                            name={tag.name}
                            color={editColor}
                            size="md"
                          />
                        </>
                      ) : (
                        <TagBadge
                          name={tag.name}
                          color={tag.color}
                          size="md"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingTag === tag.name ? (
                        <>
                          <button
                            onClick={() => handleUpdateColor(tag.name)}
                            disabled={loading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingTag(null)}
                            disabled={loading}
                            className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingTag(tag.name);
                              setEditColor(tag.color);
                            }}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar color"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {/* Delete button - Hidden for read-only mode */}
                          {!readOnly && (
                            <button
                              onClick={() => handleDeleteTag(tag.name)}
                              disabled={loading}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar tag"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};