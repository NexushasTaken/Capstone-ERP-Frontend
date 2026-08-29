import { PaginationProps } from "@/app/types/inventory"
import { getPaginationPages } from "@/app/utils/helpers/paginationHelpers"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export function PaginationDemo({
    currentPage,
    totalPages,
    onPageChange
}: PaginationProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            className="rounded-lg"
            onClick={(e) => {
              e.preventDefault()

              if (currentPage > 1) {
                onPageChange(currentPage - 1)
              }
            }}/>
        </PaginationItem>

       {getPaginationPages(currentPage, totalPages).map((page, index) => {
        if (page === "ellipsis") {
            return (
            <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
            </PaginationItem>
            )
        }

        return (
            <PaginationItem key={page}>
            <PaginationLink
                href="#"
                isActive={currentPage === page}
                className="rounded-lg"
                onClick={(e) => {
                e.preventDefault()
                onPageChange(page)
                }}
            >
                {page}
            </PaginationLink>
            </PaginationItem>
        )
        })}

        <PaginationItem>
          <PaginationNext
            href="#"
            className="rounded-lg"
            onClick={(e) => {
              e.preventDefault()

              if (currentPage < totalPages) {
                onPageChange(currentPage + 1)
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
