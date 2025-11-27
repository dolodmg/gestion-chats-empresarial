import React, { useRef, useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TagFilterProps {
  availableTags: Array<{ name: string; color: string }>;
  selectedTag: string | null;
  onTagSelect: (tagName: string | null) => void;
  chatCount?: number;
}

export const TagFilter: React.FC<TagFilterProps> = ({
  availableTags,
  selectedTag,
  onTagSelect,
  chatCount
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [availableTags]);

  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: -200,
      behavior: 'smooth'
    });
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    container.scrollBy({
      left: 200,
      behavior: 'smooth'
    });
  };

  return (
    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        FILTRAR POR:
        </span>
        {chatCount !== undefined && (
          <span className="text-xs text-gray-500">
            ({chatCount} {chatCount === 1 ? 'chat' : 'chats'})
          </span>
        )}
      </div>
      
      {/* Contenedor con botones de navegación */}
      <div className="relative">
        {/* Botón izquierdo */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 text-gray-700" />
          </button>
        )}

        {/* Scroll horizontal para tags */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide px-2"
        >
          {/* Botón "Todas" */}
          <button
            onClick={() => onTagSelect(null)}
            className={`
              flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium 
              whitespace-nowrap transition-all flex-shrink-0
              ${selectedTag === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }
            `}
          >
            Todas
          </button>

          {/* Tags disponibles */}
          {availableTags.map((tag) => (
            <button
              key={tag.name}
              onClick={() => onTagSelect(tag.name)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium 
                whitespace-nowrap transition-all flex-shrink-0
                ${selectedTag === tag.name
                  ? 'ring-2 ring-offset-2 shadow-md'
                  : 'hover:shadow-sm'
                }
              `}
              style={{
                backgroundColor: selectedTag === tag.name ? tag.color : `${tag.color}20`,
                color: selectedTag === tag.name ? 'white' : tag.color,
                borderColor: tag.color
              }}
            >
              {tag.name}
              {selectedTag === tag.name && (
                <X className="w-3 h-3" />
              )}
            </button>
          ))}
        </div>

        {/* Botón derecho */}
        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-1.5 hover:bg-gray-100 transition-colors border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 text-gray-700" />
          </button>
        )}
      </div>
    </div>
  );
};