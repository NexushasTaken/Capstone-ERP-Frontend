export type PaginationPage = number | 'ellipsis'

export function getPaginationPages(currentPage: number, totalPages: number): PaginationPage[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages: PaginationPage[] = [1]

  if (currentPage > 4) {
    pages.push('ellipsis')
  }

  const startPage = Math.max(2, currentPage - 1)
  const endPage = Math.min(totalPages - 1, currentPage + 1)

  for (let page = startPage; page <= endPage; page++) {
    pages.push(page)
  }

  if (currentPage < totalPages - 3) {
    pages.push('ellipsis')
  }

  pages.push(totalPages)

  return pages
}
