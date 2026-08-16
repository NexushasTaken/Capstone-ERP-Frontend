import { Pencil, Trash2 } from 'lucide-react'
import type { StatusActionItem } from '@/app/types/statusAction'

export const editDeleteActions: StatusActionItem[] = [
  {
    label: 'Edit',
    value: 'edit',
    icon: Pencil,
  },
  {
    label: 'Delete',
    value: 'delete',
    icon: Trash2,
    variant: 'destructive',
  },
]
