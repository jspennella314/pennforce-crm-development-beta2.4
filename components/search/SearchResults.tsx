"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Building2, Plane, Target, User, Search } from "lucide-react";

interface SearchResult {
  id: string;
  type: 'account' | 'aircraft' | 'opportunity' | 'contact';
  title: string;
  subtitle: string;
  url: string;
}

interface SearchResultsProps {
  isOpen: boolean;
  onClose: () => void;
  query: string;
  onQueryChange: (query: string) => void;
}

export default function SearchResults({ isOpen, onClose, query, onQueryChange }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'account':
        return <Building2 className="h-4 w-4" />;
      case 'aircraft':
        return <Plane className="h-4 w-4" />;
      case 'opportunity':
        return <Target className="h-4 w-4" />;
      case 'contact':
        return <User className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'account':
        return 'bg-blue-100 text-blue-800';
      case 'aircraft':
        return 'bg-green-100 text-green-800';
      case 'opportunity':
        return 'bg-purple-100 text-purple-800';
      case 'contact':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelect = (result: SearchResult) => {
    router.push(result.url);
    onClose();
    onQueryChange('');
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border rounded-md shadow-lg">
      <Command>
        <CommandInput
          placeholder="Search accounts, aircraft, opportunities..."
          value={query}
          onValueChange={onQueryChange}
          className="border-none focus:ring-0"
        />
        <CommandList className="max-h-80">
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="text-sm text-gray-500">Searching...</div>
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}

          {!loading && results.length > 0 && (
            <CommandGroup heading="Search Results">
              {results.map((result) => (
                <CommandItem
                  key={`${result.type}-${result.id}`}
                  onSelect={() => handleSelect(result)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center space-x-3 w-full">
                    <div className="flex-shrink-0">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-sm truncate">
                          {result.title}
                        </span>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${getTypeBadgeColor(result.type)}`}
                        >
                          {result.type}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </Command>
    </div>
  );
}