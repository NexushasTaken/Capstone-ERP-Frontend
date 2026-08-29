'use client'

import { Search, X, Tag, Layers, Plus } from 'lucide-react'
import { fetchProducts, insertProduct } from '@/app/utils/api/productApi'
import { exportToCSV } from '@/app/utils/exportToCsv'
import { useEffect, useRef, useState } from 'react'
import SeeMoreModal from '@/app/components/modals/SeeMoreModal'
import CloseButton from '@/app/components/CloseButton'
import { PaginationDemo } from '@/app/components/Pagination'
import { formatPeso } from '@/app/utils/helpers/saleHelpers'
import { formatProductId, formatDate } from '@/app/utils/helpers/productHelper'
import type { ProductListItem } from '@/app/types/product'
import { Button } from '@/components/ui/button'
import AppModal from '@/app/components/modals/AppModal'
import { toast } from 'sonner'
import { CategoryListItem } from '@/app/types/category'
import { fetchCategories } from '@/app/utils/api/categoryApi'
import  Loading from "@/app/components/loaders/Loading"

const tableColumns = ['Product ID', 'Category', 'Product Name', 'Price', 'Created At']
const ITEMS_PER_PAGE = 10

export default function ProductForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null)
  const [, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryListItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const categoriesLoadedRef = useRef(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [pageCount, setPageCount] = useState(1)
  const [rows, setRows] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    price: '',
  })

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search)
      setCurrentPage(1)
    }, 400)
    return () => clearTimeout(timeout)
  }, [search])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const { items, pageCount, rows } = await fetchProducts({
          page: currentPage,
          pageSize: ITEMS_PER_PAGE,
          name: debouncedSearch || undefined,
        })
        if (!cancelled) {
          setProducts(items)
          setPageCount(pageCount)
          setRows(rows)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [currentPage, debouncedSearch])

  useEffect(() => {
    if (!isAddModalOpen || categoriesLoadedRef.current) return

    let cancelled = false
    async function loadCategories() {
      setCategoriesLoading(true)
      try {
        const data = await fetchCategories()
        if (!cancelled) {
          setCategories(data)
          categoriesLoadedRef.current = true
        }
      } catch (err) {
        if (!cancelled) toast.error(err instanceof Error ? err.message : 'Failed to load categories')
      } finally {
        if (!cancelled) setCategoriesLoading(false)
      }
    }

    loadCategories()
    return () => {
      cancelled = true
    }
  }, [isAddModalOpen])

  const formCanSubmit =
    form.name.trim() !== '' &&
    form.categoryId.trim() !== '' &&
    form.price.trim() !== '' &&
    Number(form.price) > 0

  function updateFormField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleAddProduct() {
    setIsSubmitting(true)
    try {
      await insertProduct({
        categoryId: Number(form.categoryId),
        name: form.name,
        price: Number(form.price),
      })

      toast.success('Product added successfully')

      setIsAddModalOpen(false)
      setForm({ name: '', categoryId: '', price: '' })

      setCurrentPage(1)
      const { items, pageCount, rows } = await fetchProducts({
        page: 1,
        pageSize: ITEMS_PER_PAGE,
        name: debouncedSearch || undefined,
      })
      setProducts(items)
      setPageCount(pageCount)
      setRows(rows)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add product')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="flex w-full flex-col overflow-hidden rounded-2xl bg-white p-4 lg:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-medium tracking-tight text-[#121514]">Products</h1>
          <span className="rounded-md border border-[#DFE2E0] px-3 py-1 text-sm text-[#121514]">
            {rows}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products"
              className="w-full rounded-xl border border-[#DFE2E0] bg-white px-3 py-2 text-sm text-[#121514] placeholder:text-[#737A76] focus:border-[#121514] focus:outline-none focus:ring-1 focus:ring-[#121514]"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76] cursor-pointer transition-colors hover:text-[#121514]"
              >
                <X className="h-5 w-5" />
              </button>
            ) : (
              <Search className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-[#737A76]" />
            )}
          </div>
            {/* {productFilters.map((filter) => ( */}
              {/* <button
                className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  selectedFilter === filter.label
                    ? 'border-[#121514] bg-[#121514] text-white'
                    : 'border-[#E1E4E2] bg-white text-[#121514] hover:bg-[#DCE4DF]'
                }`}
                key={filter.label}
                type="button"
                onClick={() => {
                  setSelectedFilter(filter.label as 'All' | 'Active' | 'Inactive')
                  setCurrentPage(1)
                }}
              >
                {filter.label} <span className="ml-1">{filter.count}</span>
              </button> */}
            {/* ))} */}
          <button
            className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
            type="button"
            onClick={() =>
              exportToCSV(
                products,
                [
                  { header: 'Product ID', value: (product) => formatProductId(product.id) },
                  { header: 'Category', value: (product) => product.categoryName },
                  { header: 'Product name', value: (product) => product.name },
                  { header: 'Price', value: (product) => product.price },
                  { header: 'Created at', value: (product) => formatDate(product.created_At) },
                ],
                'products'
              )
            }
          >
            Export to CSV
          </button>
          <Button
            className="rounded-xl cursor-pointer px-3 py-2 text-sm"
            onClick={() => setIsAddModalOpen(true)}
            type="button"
          >
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </div>
      </div>

      <div className="mt-5 min-h-0 overflow-auto scrollbar-none">
        <table className="w-full min-w-235 border-separate border-spacing-y-2 text-left">
          <thead className="text-sm font-normal text-[#737A76]">
            <tr>
              {tableColumns.map((column) => (
                <th className="px-3 pb-1 font-normal" key={column} scope="col">
                  {column}
                </th>
              ))}
              <th className="px-3 pb-1 font-normal text-right" scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  <Loading />
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-red-500">
                  {error}
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No products found.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={product.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium">{formatProductId(product.id)}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{product.categoryName}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{product.name}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap">{formatPeso(product.price)}</td>
                  <td className="px-3 py-5 whitespace-nowrap">{formatDate(product.created_At)}</td>
                  <td className="rounded-r-xl px-3 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-1.5 text-sm whitespace-nowrap transition-all hover:bg-[#DCE4DF]"
                        type="button"
                        onClick={() => {
                          setSelectedProduct(product)
                          setIsSeeMoreOpen(true)
                        }}
                      >
                        See more
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex w-full flex-col items-center justify-between gap-4 lg:flex-row lg:gap-0">
        <span className="text-sm text-[#737A76]">
          Showing {products.length} of {rows} products
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={pageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* MODALS */}
      
      <SeeMoreModal onClose={() => setIsSeeMoreOpen(false)} open={isSeeMoreOpen} className="flex h-full flex-col lg:max-h-[70vh]">
        <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
          <div className="flex flex-col justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs">{selectedProduct ? formatProductId(selectedProduct.id) : ''}</span>
            </div>
            <span className="text-xl font-medium text-[#0c0d0d]">{selectedProduct?.name}</span>
          </div>
          <CloseButton onClick={() => setIsSeeMoreOpen(false)} />
        </div>

        <div className="flex h-full w-full flex-col overflow-y-auto p-4">
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
                <Layers className="h-6 w-6 text-[#777777]" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs">Category</span>
                <span className="truncate text-base font-semibold">{selectedProduct?.categoryName}</span>
              </div>
            </div>

            <div className="flex h-16 w-full items-center gap-2 rounded-lg bg-[#F0F1F1] px-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1B1C1C]">
                <Tag className="h-6 w-6 text-[#777777]" />
              </span>
              <div className="flex min-w-0 flex-col">
                <span className="text-xs">Price</span>
                <span className="truncate text-base font-semibold">
                  {selectedProduct ? formatPeso(selectedProduct.price) : ''}
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
                  {selectedProduct ? formatDate(selectedProduct.created_At) : ''}
                </span>
              </div>
              {/* createdBy / updatedBy / updatedAt dto */}
            </div>
          </div>
        </div>
      </SeeMoreModal>

      <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => setIsAddModalOpen(false)}
          open={isAddModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">New product item</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Add product</span>
            </div>
            <CloseButton onClick={() => setIsAddModalOpen(false)} />
          </div>

          <div className="flex flex-col gap-4 p-4">
            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Product name</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) => updateFormField('name', event.target.value)}
                value={form.name}
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Category</span>
              <select
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                onChange={(event) => updateFormField('categoryId', event.target.value)}
                value={form.categoryId}
                disabled={categoriesLoading}
              >
                <option value="" disabled>
                  {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.type}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1 text-sm text-[#121514]">
              <span className="text-xs text-[#68716C]">Price</span>
              <input
                className="h-10 rounded-xl border border-[#DFE2E0] bg-white px-3 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                min={1}
                onChange={(event) => updateFormField('price', event.target.value)}
                type="number"
                value={form.price}
              />
            </label>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button
              className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
              onClick={() => setIsAddModalOpen(false)}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={!formCanSubmit}
              onClick={handleAddProduct}
              type="button"
            >
              <Plus className="h-4 w-4" />
              Add product
            </Button>
          </div>
      </AppModal>
    </section>
  )
}
