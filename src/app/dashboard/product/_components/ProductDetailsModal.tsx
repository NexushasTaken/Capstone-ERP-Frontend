import { Layers, Tag } from 'lucide-react'
import CloseButton from '@/components/CloseButton'
import { ModalTitle } from '@/components/AppModal'
import SeeMoreModal from '@/components/SeeMoreModal'
import { formatDate, formatPeso } from '@/lib/format'
import type { ProductListItem } from '@/types/product'
import { formatProductId } from '../_lib/productHelpers'

interface ProductDetailsModalProps {
  product: ProductListItem | null
  onClose: () => void
}

// The read-only "See more" view of a product.
export default function ProductDetailsModal({ product, onClose }: ProductDetailsModalProps) {
  return (
    <SeeMoreModal onClose={onClose} open={product !== null} className="flex h-auto flex-col lg:max-h-[70vh]">
      <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
        <div className="flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs">{product ? formatProductId(product.id) : ''}</span>
          </div>
          <ModalTitle className="text-xl font-medium text-[#0c0d0d] capitalize">{product?.name}</ModalTitle>
        </div>
        <CloseButton onClick={onClose} />
      </div>

      <div className="flex h-full w-full flex-col overflow-y-auto p-4">
        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
              <Layers className="h-6 w-6 text-[#777777]" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs">Category</span>
              <span className="truncate text-base font-semibold capitalize">{product?.categoryName ?? 'Uncategorized'}</span>
            </div>
          </div>

          <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
              <Tag className="h-6 w-6 text-[#777777]" />
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="text-xs">Price</span>
              <span className="truncate text-base font-semibold">
                {product ? formatPeso(product.price) : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <span className="text-xs uppercase text-[#121514]">Product history</span>
          <div className="h-px w-full border-b border-[#E2E2E2]" />
        </div>

        <div className="mt-4 rounded-xl bg-[#F0F1F1] p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="block text-xs text-[#737A76]">Created at</span>
              <span className="font-semibold text-[#0c0d0d]">
                {product ? formatDate(product.created_At) : ''}
              </span>
            </div>
            {/* createdBy / updatedBy / updatedAt dto */}
          </div>
        </div>
      </div>
    </SeeMoreModal>
  )
}
