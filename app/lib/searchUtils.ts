import { SearchFilter } from '@/app/components/AdvancedSearch';

export function buildPrismaWhere(filters: SearchFilter[], baseWhere: any = {}) {
  if (filters.length === 0) return baseWhere;

  const conditions = filters.map((filter) => {
    const { field, operator, value } = filter;

    switch (operator) {
      case 'eq':
        return { [field]: value };
      case 'ne':
        return { [field]: { not: value } };
      case 'contains':
        return { [field]: { contains: value, mode: 'insensitive' } };
      case 'startsWith':
        return { [field]: { startsWith: value, mode: 'insensitive' } };
      case 'endsWith':
        return { [field]: { endsWith: value, mode: 'insensitive' } };
      case 'gt':
        return { [field]: { gt: value } };
      case 'gte':
        return { [field]: { gte: value } };
      case 'lt':
        return { [field]: { lt: value } };
      case 'lte':
        return { [field]: { lte: value } };
      case 'in':
        return { [field]: { in: Array.isArray(value) ? value : value.split(',').map((v: string) => v.trim()) } };
      case 'notIn':
        return { [field]: { notIn: Array.isArray(value) ? value : value.split(',').map((v: string) => v.trim()) } };
      default:
        return { [field]: value };
    }
  });

  return {
    ...baseWhere,
    AND: conditions,
  };
}

export function buildSearchQuery(searchTerm: string, searchFields: string[]) {
  if (!searchTerm || !searchFields.length) return undefined;

  return {
    OR: searchFields.map((field) => ({
      [field]: { contains: searchTerm, mode: 'insensitive' },
    })),
  };
}
