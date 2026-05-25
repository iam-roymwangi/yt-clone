"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

interface SearchInputProps {
  initialValue?: string;
  placeholder?: string;
  size?: "sm" | "lg";
}

export default function SearchInput({
  initialValue = "",
  placeholder = "Search...",
  size = "sm",
}: SearchInputProps) {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue if it changes externally
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Fetch suggestions with a debounce of 200ms
  useEffect(() => {
    if (!query.trim() || !isFocused) {
      setSuggestions([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/suggestions?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.slice(0, 8)); // Limit to top 8 suggestions
        }
      } catch (err) {
        console.error("Failed to fetch suggestions:", err);
      }
    }, 200);

    return () => clearTimeout(delayDebounce);
  }, [query, isFocused]);

  // Dismiss dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();

    // Check if the query is a YouTube URL
    const videoMatch = trimmed.match(
      /(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    );
    if (videoMatch?.[1]) {
      router.push(`/watch?v=${videoMatch[1]}`);
      return;
    }

    const channelMatch = trimmed.match(
      /youtube\.com\/channel\/(UC[\w-]{20,})/
    );
    if (channelMatch?.[1]) {
      router.push(`/channel/${channelMatch[1]}`);
      return;
    }

    const handleMatch = trimmed.match(/youtube\.com\/@([\w.-]+)/);
    if (handleMatch?.[1]) {
      router.push(`/channel/@${handleMatch[1]}`);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearchSubmit(query);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
          const selected = suggestions[highlightedIndex];
          setQuery(selected);
          handleSearchSubmit(selected);
        } else {
          handleSearchSubmit(query);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  // Size classes
  const isLarge = size === "lg";
  const iconSizeClass = isLarge ? "w-5 h-5 left-4" : "w-4 h-4 left-3";
  const inputPaddingClass = isLarge ? "py-4 pl-12 pr-6 text-lg" : "py-2 pl-10 pr-4 text-sm";
  const containerMaxClass = isLarge ? "w-full max-w-2xl" : "w-full max-w-2xl";

  return (
    <div ref={containerRef} className={`relative flex-1 ${containerMaxClass}`}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearchSubmit(query);
        }}
        className="w-full relative group"
      >
        <div className={`absolute inset-y-0 ${isLarge ? "left-4" : "left-3.5"} flex items-center pointer-events-none`}>
          <Search className={`${iconSizeClass} text-zinc-500 group-focus-within:text-violet-500 transition-colors`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsFocused(true);
            if (query.trim()) setIsOpen(true);
          }}
          onBlur={() => {
            // Keep delay to allow click on suggestion list items before blur runs
            setTimeout(() => setIsFocused(false), 200);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`w-full bg-zinc-900 border border-zinc-800 rounded-full outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600 text-white ${inputPaddingClass}`}
        />
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/90 backdrop-blur-md shadow-2xl transition-all duration-200">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => {
              const isHighlighted = index === highlightedIndex;
              return (
                <li
                  key={suggestion}
                  onClick={() => {
                    setQuery(suggestion);
                    handleSearchSubmit(suggestion);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    isHighlighted
                      ? "bg-violet-600/20 text-white font-medium border-l-2 border-violet-500"
                      : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{suggestion}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
