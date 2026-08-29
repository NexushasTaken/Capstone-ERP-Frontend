import { toast } from 'sonner'

interface OptimisticMutationOptions {
  optimisticUpdate: () => void
  rollback: () => void
  mutation: () => Promise<unknown>
  reconcile?: () => Promise<unknown>
  onSuccess?: () => void
  onSettled?: () => void
  successMessage: string
  errorMessage: string
}

export async function runOptimisticMutation({
  optimisticUpdate,
  rollback,
  mutation,
  reconcile,
  onSuccess,
  onSettled,
  successMessage,
  errorMessage,
}: OptimisticMutationOptions) {
  optimisticUpdate()

  try {
    await mutation()
    if (reconcile) await reconcile()
    toast.success(successMessage)
    onSuccess?.()
  } catch (err) {
    rollback()
    toast.error(err instanceof Error ? err.message : errorMessage)
  } finally {
    onSettled?.()
  }
}
