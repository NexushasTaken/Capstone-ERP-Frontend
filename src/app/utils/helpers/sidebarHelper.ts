export const getNavItemClasses = (isActive: boolean) =>
    isActive
      ? 'bg-[#0c0d0d] text-[#F2F0F0] hover:bg-[#1B1C1C] duration-300 transition-all'
      : 'text-[#0c0d0d] hover:bg-[#F0F1F1] duration-300 transition-all'

export const profileFallback = {
  firstName: 'User',
  lastName: '',
  role: '',
}