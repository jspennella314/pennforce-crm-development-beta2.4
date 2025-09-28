"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FilterBuilder } from "./FilterBuilder";
import { Filter, Save, Settings, Star, Eye, Trash2, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ListView {
  id: string;
  name: string;
  filtersJson: any[];
  columnsJson?: string[];
  isPinned: boolean;
  isPublic: boolean;
  owner: {
    id: string;
    name: string;
  };
}

interface EnhancedListViewBarProps {
  objectName: string;
  onApply: (filters: any[]) => void;
  onColumnsChange?: (columns: string[]) => void;
}

export function EnhancedListViewBar({
  objectName,
  onApply,
  onColumnsChange
}: EnhancedListViewBarProps) {
  const [views, setViews] = useState<ListView[]>([]);
  const [currentFilters, setCurrentFilters] = useState<any[]>([]);
  const [selectedView, setSelectedView] = useState<string>("");
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newViewName, setNewViewName] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    loadViews();
  }, [objectName]);

  const loadViews = async () => {
    try {
      const response = await fetch(`/api/listviews?object=${objectName}`);
      const data = await response.json();
      setViews(data);
    } catch (error) {
      console.error("Failed to load views:", error);
    }
  };

  const applyView = (viewId: string) => {
    const view = views.find(v => v.id === viewId);
    if (view) {
      setCurrentFilters(view.filtersJson || []);
      setSelectedView(viewId);
      onApply(view.filtersJson || []);
      if (onColumnsChange && view.columnsJson) {
        onColumnsChange(view.columnsJson);
      }
    }
  };

  const applyFilters = () => {
    onApply(currentFilters);
    setFilterDialogOpen(false);
  };

  const saveView = async () => {
    if (!newViewName.trim()) return;

    try {
      await fetch("/api/listviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          objectName,
          name: newViewName,
          filtersJson: currentFilters,
          isPublic,
        }),
      });

      setNewViewName("");
      setSaveDialogOpen(false);
      await loadViews();
    } catch (error) {
      console.error("Failed to save view:", error);
    }
  };

  const clearFilters = () => {
    setCurrentFilters([]);
    setSelectedView("");
    onApply([]);
  };

  const activeFiltersCount = currentFilters.length;

  return (
    <div className="space-y-4">
      {/* Main Control Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border rounded-lg">
        {/* View Selector */}
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-gray-500" />
          <Select value={selectedView} onValueChange={applyView}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a view..." />
            </SelectTrigger>
            <SelectContent>
              {views.map((view) => (
                <SelectItem key={view.id} value={view.id}>
                  <div className="flex items-center gap-2">
                    {view.isPinned && <Star className="h-3 w-3 text-yellow-500" />}
                    <span>{view.name}</span>
                    {view.isPublic && <Badge variant="secondary" className="text-xs">Public</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Filter {objectName}</DialogTitle>
                <DialogDescription>
                  Create filter conditions to narrow down your results
                </DialogDescription>
              </DialogHeader>

              <FilterBuilder
                filters={currentFilters}
                onFiltersChange={setCurrentFilters}
                objectName={objectName}
              />

              <DialogFooter>
                <Button variant="outline" onClick={() => setFilterDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear All
            </Button>
          )}
        </div>

        {/* Save View */}
        <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Save View
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save List View</DialogTitle>
              <DialogDescription>
                Save the current filters as a new list view
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">View Name</label>
                <Input
                  placeholder="Enter view name..."
                  value={newViewName}
                  onChange={(e) => setNewViewName(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="isPublic" className="text-sm">
                  Make this view public (visible to all users)
                </label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveView} disabled={!newViewName.trim()}>
                Save View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Results Summary */}
        <div className="ml-auto text-sm text-gray-500">
          {selectedView && (
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {views.find(v => v.id === selectedView)?.name}
            </span>
          )}
          {!selectedView && activeFiltersCount > 0 && (
            <span className="flex items-center gap-1">
              <Filter className="h-3 w-3" />
              {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} applied
            </span>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {currentFilters.map((filter, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              <span className="text-xs">
                {filter.field} {filter.op} {filter.value}
              </span>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}