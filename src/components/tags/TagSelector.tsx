import React, { useState, useRef, useEffect } from 'react';
import { Tag, Plus } from 'lucide-react';
import { TagBadge } from './TagBadge';

interface TagOption {
  name: string;
  color: string;
}

interface TagSelectorProps {
  availableTags: TagOption[];
  selectedTags: string[];
  onTagAdd: (tagName: string) => void;
  onTagRemove: (tagName: string) => void;
  onCreateTag?: () => void;
  disabled?: boolean;
}

export const TagSelector: React.FC<TagSelectorProps> = ({
  availableTags,
  selectedTags,
  onTagAdd,
  onTagRemove,
  onCreateTag,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unselectedTags = availableTags.filter(tag => !selectedTags.includes(tag.name));

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <Tag className="w-4 h-4" />
        Gestionar tags
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Tags</h3>
          </div>

          {/* Selected tags */}
          {selectedTags.length > 0 && (
            <div className="px-4 py-3 border-b border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-2">Aplicadas</p>
              <div className="flex flex-wrap gap-2">
                {selectedTags.map(tagName => {
                  const tag = availableTags.find(t => t.name === tagName);
                  return (
                    <TagBadge
                      key={tagName}
                      name={tagName}
                      color={tag?.color || '#6B7280'}
                      size="sm"
                      onRemove={() => onTagRemove(tagName)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Available tags */}
          <div className="overflow-y-auto flex-1">
            {unselectedTags.length > 0 ? (
              <div className="px-2 py-2">
                <p className="text-xs font-medium text-gray-500 px-2 mb-2">Disponibles</p>
                {unselectedTags.map(tag => (
                  <button
                    key={tag.name}
                    onClick={() => {
                      onTagAdd(tag.name);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 rounded-md transition-colors group"
                  >
                    <TagBadge
                      name={tag.name}
                      color={tag.color}
                      size="sm"
                    />
                    <Plus className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                  </button>
                ))}
              </div>
            ) : selectedTags.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No hay tags disponibles
              </div>
            ) : (
              <div className="px-4 py-4 text-center text-sm text-gray-500">
                Todas las tags están aplicadas
              </div>
            )}
          </div>

          {/* Create new tag button */}
          {onCreateTag && (
            <div className="px-2 py-2 border-t border-gray-200">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onCreateTag();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              >
                <Plus className="w-4 h-4" />
                Crear nueva tag
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};