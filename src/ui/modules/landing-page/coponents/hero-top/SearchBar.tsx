import { Input } from '@/ui/design-system/forms/input';
import { useRef } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export const SearchBar = ({ value, onChange, suggestions = [], onSuggestionClick, className }: SearchBarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={`relative ${className || ''}`}>
      <div className="flex items-center bg-gray rounded shadow-md border px-3 py-2 focus-within:ring-2 focus-within:ring-primary/5">
        <span className="text-white mr-2">
          <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
        </span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Ville, site d’intérêt…"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="flex-1 bg-gray outline-none border-none text-white"
        />
        {value && (
          <button
            type="button"
            className="ml-2 text-gray-400 hover:text-gray-600 focus:outline-none"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            aria-label="Effacer"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        )}
      </div>
      {suggestions.length > 0 && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20 animate-fade-in">
          <div className="py-2">
            {suggestions.map((s, idx) => (
              <button
                key={s + idx}
                type="button"
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700 text-base"
                onClick={() => onSuggestionClick && onSuggestionClick(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 