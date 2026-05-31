export const LIBRARY_PAGE_SIZE = 3;

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const start = (currentPage - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    currentPage,
    totalPages,
    totalItems: items.length,
    pageSize,
  };
}

export function libraryHref(page: number): string {
  if (page <= 1) return "/library";
  return `/library?page=${page}`;
}
