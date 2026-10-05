export const getNavItemClasses = (isActive: boolean) =>
  isActive
    ? "bg-primary text-primary-foreground hover:bg-primary/90 duration-300 transition-all"
    : "text-foreground hover:bg-accent duration-300 transition-all"

export const profileFallback = {
  firstName: "User",
  lastName: "",
  role: "",
}
