"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus } from "lucide-react";

interface Filter {
  field: string;
  op: string;
  value: string;
}

interface FilterBuilderProps {
  filters: Filter[];
  onFiltersChange: (filters: Filter[]) => void;
  objectName: string;
}

const FIELD_OPTIONS = {
  accounts: [
    { value: "name", label: "Account Name" },
    { value: "type", label: "Account Type" },
    { value: "industry", label: "Industry" },
    { value: "revenue", label: "Annual Revenue" },
    { value: "employees", label: "Employees" },
    { value: "owner", label: "Account Owner" },
  ],
  contacts: [
    { value: "firstName", label: "First Name" },
    { value: "lastName", label: "Last Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "title", label: "Title" },
    { value: "account", label: "Account" },
  ],
  aircraft: [
    { value: "tailNumber", label: "Tail Number" },
    { value: "manufacturer", label: "Manufacturer" },
    { value: "model", label: "Model" },
    { value: "year", label: "Year" },
    { value: "totalTime", label: "Total Time" },
    { value: "status", label: "Status" },
  ],
  opportunities: [
    { value: "name", label: "Opportunity Name" },
    { value: "stage", label: "Stage" },
    { value: "amount", label: "Amount" },
    { value: "closeDate", label: "Close Date" },
    { value: "probability", label: "Probability" },
    { value: "owner", label: "Owner" },
  ],
};

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equal" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Does Not Contain" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "gt", label: "Greater Than" },
  { value: "gte", label: "Greater Than or Equal" },
  { value: "lt", label: "Less Than" },
  { value: "lte", label: "Less Than or Equal" },
  { value: "is_null", label: "Is Empty" },
  { value: "is_not_null", label: "Is Not Empty" },
];

export function FilterBuilder({ filters, onFiltersChange, objectName }: FilterBuilderProps) {
  const fieldOptions = FIELD_OPTIONS[objectName as keyof typeof FIELD_OPTIONS] || FIELD_OPTIONS.accounts;

  const addFilter = () => {
    const newFilter: Filter = {
      field: fieldOptions[0]?.value || "name",
      op: "contains",
      value: "",
    };
    onFiltersChange([...filters, newFilter]);
  };

  const updateFilter = (index: number, updates: Partial<Filter>) => {
    const newFilters = filters.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter
    );
    onFiltersChange(newFilters);
  };

  const removeFilter = (index: number) => {
    onFiltersChange(filters.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <Select
            value={filter.field}
            onValueChange={(value) => updateFilter(index, { field: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fieldOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filter.op}
            onValueChange={(value) => updateFilter(index, { op: value })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATORS.map((operator) => (
                <SelectItem key={operator.value} value={operator.value}>
                  {operator.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!["is_null", "is_not_null"].includes(filter.op) && (
            <Input
              placeholder="Value"
              value={filter.value}
              onChange={(e) => updateFilter(index, { value: e.target.value })}
              className="flex-1"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeFilter(index)}
            className="text-red-600 hover:text-red-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addFilter}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Filter Condition
      </Button>
    </div>
  );
}