export const getLinkClasses = (isActive: boolean) =>
    isActive
      ? 'bg-[#0c0d0d] text-[#F2F0F0] hover:bg-[#1B1C1C] duration-300 transition-all'
      : 'bg-[#FFFFFF] border-2 border-[#F0F1F1] text-[#0c0d0d] hover:bg-[#F0F1F1] hover:border-none'

export const profileFallback = {
  firstName: 'User',
  lastName: '',
  position: 'Staff',
  type: 'Account',
  avatarSrc: '/defaultProfile.avif',
}