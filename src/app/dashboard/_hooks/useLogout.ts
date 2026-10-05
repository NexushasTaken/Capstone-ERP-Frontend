import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { queryKeys } from "@/lib/query/queryKeys"
import { logoutUser, storeCurrentUser } from "@/services/profileApi"

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      storeCurrentUser(null)
      queryClient.removeQueries({ queryKey: queryKeys.auth.currentUser })
      toast.success("You're logged out successfully!")
      router.push("/")
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || "Unable to log out. Please try again.")
    },
  })
}
