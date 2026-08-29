export function formatCategoryId(categoryId: string | number) {
  return `CAT-${categoryId}`
}

export function formatCategoryDate(dateString: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatCategoryText(value: string | null) {
  return value?.trim() || '-'
}

export function formatCategoryStatus(isActive: boolean) {
  return isActive ? 'Active' : 'Inactive'
}
