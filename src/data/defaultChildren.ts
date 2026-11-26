export interface ChildTypeItem {
  id: string;
  slug: string;
  title: string;
  imageUrl?: string;
  description?: string;
}

// Zero hardcoded data: subcategories and types strictly fetched from MySQL database via API
export function hasSubcategoryTypes(id?: string, slug?: string, rawId?: string | number): boolean {
  return false;
}

export const DEFAULT_CHILDREN: Record<string, ChildTypeItem[]> = {};
