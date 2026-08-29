'use client'

import { Search, X, Tag, Layers, Plus, ChevronDown } from 'lucide-react'
import {
  deleteProduct,
  fetchNoCategoryProductCount,
  fetchProducts,
  insertProduct,
  updateProduct,
} from '@/app/utils/api/productApi'
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
import StatusAction from '@/app/components/StatusAction'
import { editDeleteActions } from '@/app/utils/helpers/statusActionHelpers'
import { runOptimisticMutation } from '@/app/utils/helpers/optimisticMutation'

const tableColumns = ['Product ID', 'Category', 'Product Name', 'Price', 'Created At']
const ITEMS_PER_PAGE = 10
const PRODUCT_LOAD_PAGE_SIZE = 1000
type ProductCategoryFilter = 'All' | 'Categorized' | 'Uncategorized'

export default function ProductForm() {
  const [isSeeMoreOpen, setIsSeeMoreOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductListItem | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<CategoryListItem[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const categoriesLoadedRef = useRef(false)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<ProductCategoryFilter>('All')
  const [currentPage, setCurrentPage] = useState(1)

  const [products, setProducts] = useState<ProductListItem[]>([])
  const [, setPageCount] = useState(1)
  const [rows, setRows] = useState(0)
  const [noCategoryCount, setNoCategoryCount] = useState(0)
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
        const activeSearch = selectedFilter === 'Uncategorized' ? undefined : debouncedSearch || undefined
        const [{ items, pageCount, rows }, uncategorizedCount] = await Promise.all([
          fetchProducts({
            page: 1,
            pageSize: PRODUCT_LOAD_PAGE_SIZE,
            name: activeSearch,
          }),
          fetchNoCategoryProductCount(),
        ])
        if (!cancelled) {
          setProducts(items)
          setPageCount(pageCount)
          setRows(rows)
          setNoCategoryCount(uncategorizedCount)
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
  }, [debouncedSearch, selectedFilter])

  useEffect(() => {
    if ((!isAddModalOpen && !isEditModalOpen) || categoriesLoadedRef.current) return

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
  }, [isAddModalOpen, isEditModalOpen])

  const isProductCategorized = (product: ProductListItem) => product.categoryId !== null

  const displayedProducts = [...products].sort((a, b) => {
    const dateA = new Date(a.created_At).getTime()
    const dateB = new Date(b.created_At).getTime()

    if (Number.isFinite(dateA) && Number.isFinite(dateB) && dateA !== dateB) {
      return dateB - dateA
    }

    return b.id - a.id
  })

  const filteredProducts = displayedProducts.filter((product) => {
    if (selectedFilter === 'Categorized') return isProductCategorized(product)
    if (selectedFilter === 'Uncategorized') return !isProductCategorized(product)
    return true
  })

  const filteredPageCount = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE))
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const productFilters: { label: ProductCategoryFilter; count: number }[] = [
    { label: 'All', count: rows },
    { label: 'Categorized', count: Math.max(rows - noCategoryCount, 0) },
    { label: 'Uncategorized', count: noCategoryCount },
  ]

  const formCanSubmit =
    form.name.trim() !== '' &&
    form.price.trim() !== '' &&
    Number(form.price) > 0

  function updateFormField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setForm({ name: '', categoryId: '', price: '' })
    setSelectedProduct(null)
  }

  async function reloadProducts(page = currentPage) {
    const activeSearch = selectedFilter === 'Uncategorized' ? undefined : debouncedSearch || undefined
    const [{ items, pageCount, rows }, uncategorizedCount] = await Promise.all([
      fetchProducts({
        page,
        pageSize: PRODUCT_LOAD_PAGE_SIZE,
        name: activeSearch,
      }),
      fetchNoCategoryProductCount(),
    ])

    setProducts(items)
    setPageCount(pageCount)
    setRows(rows)
    setNoCategoryCount(uncategorizedCount)
  }

  async function handleAddProduct() {
    if (!formCanSubmit) return

    const previousProducts = products
    const previousRows = rows
    const previousNoCategoryCount = noCategoryCount
    const categoryId = form.categoryId ? Number(form.categoryId) : null
    const optimisticProduct: ProductListItem = {
      id: -Date.now(),
      categoryId,
      name: form.name.trim(),
      price: Number(form.price),
      categoryName: categories.find((category) => category.id === categoryId)?.type ?? null,
      created_At: new Date().toISOString(),
    }

    setIsSubmitting(true)
    setIsAddModalOpen(false)
    resetForm()
    setCurrentPage(1)

    await runOptimisticMutation({
      optimisticUpdate: () => {
        setProducts((prev) => [optimisticProduct, ...prev])
        setRows((prev) => prev + 1)
        if (categoryId === null) setNoCategoryCount((prev) => prev + 1)
      },
      rollback: () => {
        setProducts(previousProducts)
        setRows(previousRows)
        setNoCategoryCount(previousNoCategoryCount)
      },
      mutation: () =>
        insertProduct({
          categoryId,
          name: optimisticProduct.name,
          price: optimisticProduct.price,
        }),
      reconcile: () => reloadProducts(1),
      successMessage: 'Product added successfully',
      errorMessage: 'Failed to add product',
      onSettled: () => setIsSubmitting(false),
    })
  }

  async function handleUpdateProduct() {
    if (!selectedProduct || !formCanSubmit) return

    const previousProducts = products
    const previousNoCategoryCount = noCategoryCount
    const productId = selectedProduct.id
    const categoryId = form.categoryId ? Number(form.categoryId) : null
    const nextProduct: ProductListItem = {
      ...selectedProduct,
      categoryId,
      name: form.name.trim(),
      price: Number(form.price),
      categoryName: categories.find((category) => category.id === categoryId)?.type ?? null,
    }

    setIsSubmitting(true)
    setIsEditModalOpen(false)
    resetForm()

    await runOptimisticMutation({
      optimisticUpdate: () => {
        setProducts((prev) =>
          prev.map((product) => (product.id === productId ? nextProduct : product))
        )
        if (selectedProduct.categoryId !== null && categoryId === null) {
          setNoCategoryCount((prev) => prev + 1)
        }
        if (selectedProduct.categoryId === null && categoryId !== null) {
          setNoCategoryCount((prev) => Math.max(prev - 1, 0))
        }
      },
      rollback: () => {
        setProducts(previousProducts)
        setNoCategoryCount(previousNoCategoryCount)
      },
      mutation: () =>
        updateProduct({
          id: productId,
          categoryId: categoryId ?? 0,
          name: nextProduct.name,
          price: nextProduct.price,
        }),
      reconcile: () => reloadProducts(),
      successMessage: 'Product updated successfully',
      errorMessage: 'Failed to update product',
      onSettled: () => setIsSubmitting(false),
    })
  }

  async function handleDeleteProduct() {
    if (!selectedProduct) return

    setIsSubmitting(true)
    try {
      await deleteProduct(selectedProduct.id)
      toast.success('Product deleted successfully')
      setIsDeleteModalOpen(false)
      resetForm()
      await reloadProducts()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete product')
    } finally {
      setIsSubmitting(false)
    }
  }

  function openEditModal(product: ProductListItem) {
    setSelectedProduct(product)
    setForm({
      name: product.name,
      categoryId: product.categoryId ? String(product.categoryId) : '',
      price: String(product.price),
    })
    setIsEditModalOpen(true)
  }

  function openDeleteModal(product: ProductListItem) {
    setSelectedProduct(product)
    setIsDeleteModalOpen(true)
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
          {selectedFilter !== 'Uncategorized' ? (
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
          ) : null}
            {productFilters.map((filter) => (
              <button
                className={`cursor-pointer rounded-xl border px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  selectedFilter === filter.label
                    ? 'border-[#121514] bg-[#121514] text-white'
                    : 'border-[#E1E4E2] bg-white text-[#121514] hover:bg-[#DCE4DF]'
                }`}
                key={filter.label}
                type="button"
                onClick={() => {
                  setSelectedFilter(filter.label)
                  setCurrentPage(1)
                  if (filter.label === 'Uncategorized') {
                    setSearch('')
                    setDebouncedSearch('')
                  }
                }}
              >
                {filter.label} <span className="ml-1">{filter.count}</span>
              </button>
            ))}
          <button
            className="cursor-pointer rounded-xl border border-[#DFE2E0] px-3 py-2 text-sm whitespace-nowrap transition-colors hover:bg-[#DCE4DF]"
            type="button"
            onClick={() =>
              exportToCSV(
                filteredProducts,
                [
                  { header: 'Product ID', value: (product) => formatProductId(product.id) },
                  { header: 'Category', value: (product) => product.categoryName ?? 'Uncategorized' },
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
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 1} className="px-3 py-4 text-center text-sm text-[#737A76]">
                  No products found.
                </td>
              </tr>
            ) : (
              paginatedProducts.map((product) => (
                <tr className="bg-[#FAFBFA] text-sm text-[#121514]" key={product.id}>
                  <td className="rounded-l-xl px-3 py-5 font-medium">{formatProductId(product.id)}</td>
                  <td className="px-3 py-5 font-medium whitespace-nowrap capitalize">{product.categoryName ?? 'Uncategorized'}</td>
                  <td className="px-3 py-5 whitespace-nowrap capitalize">{product.name}</td>
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
                      <StatusAction
                        actions={editDeleteActions}
                        label={`More actions for product ${product.id}`}
                        onAction={(action) => {
                          if (action === 'edit') openEditModal(product)
                          if (action === 'delete') openDeleteModal(product)
                        }}
                      />
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
          Showing {paginatedProducts.length} of {selectedFilter === 'All' ? rows : productFilters.find((filter) => filter.label === selectedFilter)?.count ?? filteredProducts.length} products
        </span>
        <div className="flex">
          <PaginationDemo currentPage={currentPage} totalPages={filteredPageCount} onPageChange={setCurrentPage} />
        </div>
      </div>

      {/* MODALS */}
      
      <SeeMoreModal onClose={() => setIsSeeMoreOpen(false)} open={isSeeMoreOpen} className="flex h-auto flex-col lg:max-h-[70vh]">
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
                <span className="truncate text-base font-semibold">{selectedProduct?.categoryName ?? 'Uncategorized'}</span>
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
<option value="">
{categoriesLoading ? 'Loading categories...' : 'No category'}
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

      <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => {
            setIsEditModalOpen(false)
            resetForm()
          }}
          open={isEditModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">{selectedProduct ? formatProductId(selectedProduct.id) : ''}</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Edit product</span>
            </div>
            <CloseButton
              onClick={() => {
                setIsEditModalOpen(false)
                resetForm()
              }}
            />
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
              <div className="relative">
                <select
                  className="h-10 w-full appearance-none rounded-xl border border-[#DFE2E0] bg-white px-3 pr-10 text-sm outline-none focus:border-[#121514] focus:ring-1 focus:ring-[#121514]"
                  onChange={(event) => updateFormField('categoryId', event.target.value)}
                  value={form.categoryId}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'No category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.type}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737A76]" />
              </div>
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
              onClick={() => {
                setIsEditModalOpen(false)
                resetForm()
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={!formCanSubmit || isSubmitting}
              onClick={handleUpdateProduct}
              type="button"
            >
              Save changes
            </Button>
          </div>
      </AppModal>

      <AppModal
          className="flex max-h-[90vh] flex-col"
          onClose={() => {
            setIsDeleteModalOpen(false)
            resetForm()
          }}
          open={isDeleteModalOpen}
        >
          <div className="flex w-full items-center justify-between gap-2 border-b border-[#E2E2E2] p-4">
            <div className="flex flex-col">
              <span className="text-xs text-[#737A76]">{selectedProduct ? formatProductId(selectedProduct.id) : ''}</span>
              <span className="text-xl font-medium text-[#0c0d0d]">Delete product</span>
            </div>
            <CloseButton
              onClick={() => {
                setIsDeleteModalOpen(false)
                resetForm()
              }}
            />
          </div>

          <div className="flex flex-col gap-2 p-4">
            <span className="text-sm text-[#121514]">
              Are you sure you want to delete this product?
            </span>
            <span className="text-sm font-medium text-[#0c0d0d] capitalize">
              {selectedProduct?.name}
            </span>
          </div>

          <div className="flex justify-end gap-2 border-t border-[#E2E2E2] p-4">
            <Button
              className="rounded-xl border-[#DFE2E0] px-3 py-2 text-sm"
              onClick={() => {
                setIsDeleteModalOpen(false)
                resetForm()
              }}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl px-3 py-2 text-sm"
              disabled={isSubmitting || !selectedProduct}
              onClick={handleDeleteProduct}
              type="button"
              variant="destructive"
            >
              Delete product
            </Button>
          </div>
      </AppModal>
    </section>
  )
}
