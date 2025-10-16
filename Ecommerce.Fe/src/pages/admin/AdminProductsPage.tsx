import { useEffect, useMemo, useState } from 'react'
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from '../../hooks/useProducts'
import { toast } from 'react-hot-toast'
import { ProductForm } from '../../components/products/ProductForm'
import { Modal } from '../../components/common'
import type { Product } from '../../types'

type SortKey =
  | 'createdAt:desc'
  | 'createdAt:asc'
  | 'price:asc'
  | 'price:desc'
  | 'name:asc'
  | 'name:desc'
type ViewMode = 'table' | 'grid'

/** ====== Brand palette (xanh biển / navy) ====== */
const brand = {
  pageBg: 'from-sky-50 via-blue-50 to-indigo-50',
  headerGrad: 'from-sky-600 via-blue-600 to-indigo-700',
  cardBg: 'bg-white/70 backdrop-blur-lg border border-white/20',
  gradText: 'from-sky-600 to-indigo-700',
  primaryBtn: 'from-sky-600 to-indigo-600',
  primaryBtnHover: 'hover:shadow-lg hover:scale-105',
  neutralBtn: 'bg-white/80 text-gray-700 border border-white/20 hover:bg-white hover:shadow',
  outlineBtn: 'bg-white text-gray-700 border border-gray-200 hover:shadow',
  blob1: 'bg-sky-300',
  blob2: 'bg-indigo-300',
  blob3: 'bg-blue-300',
}

/** Helper: luôn trả về Date hợp lệ, tránh TS2769 khi new Date(undefined) */
const safeDate = (a?: string | number | Date, b?: string | number | Date) => {
  const v = a ?? b
  return v ? new Date(v) : new Date(0)
}

export default function AdminProductsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [view, setView] = useState<ViewMode>('table')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('createdAt:desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(12)

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  // Data hooks
  const { data: productsData, isLoading, isError, error, refetch, isRefetching } = useProducts({
    page,
    limit,
    search: debouncedSearch || undefined,
    sort,
  } as any)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const products = productsData?.items ?? []
  const total = productsData?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const formatVND = (n: number) =>
    n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })

  const skeletonArray = useMemo(() => Array.from({ length: view === 'grid' ? 8 : 6 }), [view])

  // Handlers
  const openCreate = () => {
    setSelectedProduct(null)
    setModalOpen(true)
  }
  const openEdit = (p: Product) => {
    setSelectedProduct(p)
    setModalOpen(true)
  }
  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct.id, ...data } as any)
        toast.success('Đã cập nhật sản phẩm!')
      } else {
        await createProduct.mutateAsync(data as any)
        toast.success('Đã tạo sản phẩm!')
      }
      setModalOpen(false)
      setSelectedProduct(null)
      refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Có lỗi xảy ra')
    }
  }
  const confirmDelete = (id: string) => {
    setDeletingId(id)
    setConfirmOpen(true)
  }
  const onConfirmDelete = async () => {
    if (!deletingId) return
    try {
      await deleteProduct.mutateAsync(deletingId)
      toast.success('Đã xoá sản phẩm!')
      setConfirmOpen(false)
      setDeletingId(null)
      if (products.length === 1 && page > 1) setPage((p) => p - 1)
      else refetch()
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || 'Xoá thất bại')
    }
  }
  const onCancelDelete = () => {
    setConfirmOpen(false)
    setDeletingId(null)
  }

  // Layout shell
  const ScreenShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className={`min-h-screen bg-gradient-to-br ${brand.pageBg} relative overflow-hidden`}>
      {/* Blue/Navy blobs */}
      <div
        className={`pointer-events-none absolute top-0 -left-4 w-72 h-72 ${brand.blob1} rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob`}
      />
      <div
        className={`pointer-events-none absolute top-0 -right-6 w-72 h-72 ${brand.blob2} rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-2000`}
      />
      <div
        className={`pointer-events-none absolute -bottom-10 left-24 w-72 h-72 ${brand.blob3} rounded-full mix-blend-multiply blur-3xl opacity-70 animate-blob animation-delay-4000`}
      />
      <div className="container mx-auto px-4 py-8 relative z-10">{children}</div>
    </div>
  )

  // Error UI
  if (isError) {
    return (
      <ScreenShell>
        <Header onAdd={openCreate} />
        <div className={`${brand.cardBg} rounded-3xl shadow-xl p-10 text-center`}>
          <div className="text-6xl mb-4">💥</div>
          <h2 className="text-2xl font-bold mb-2">Không tải được danh sách sản phẩm</h2>
          <p className="text-gray-600 mb-6">
            {(error as any)?.message || 'Vui lòng thử tải lại trang hoặc kiểm tra kết nối.'}
          </p>
          <button
            onClick={() => refetch()}
            className={`px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r ${brand.primaryBtn} ${brand.primaryBtnHover} transition`}
          >
            Thử lại
          </button>
        </div>
      </ScreenShell>
    )
  }

  return (
    <ScreenShell>
      {/* Header */}
      <Header onAdd={openCreate} />

      {/* Toolbar */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-5">
          <div
            className={`flex items-center gap-2 ${brand.cardBg} rounded-2xl px-4 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-sky-300`}
          >
            <span className="text-xl">🔎</span>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="Tìm theo tên/miêu tả…"
              className="w-full bg-transparent outline-none text-gray-800 placeholder:text-gray-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="text-gray-500 hover:text-gray-700 transition"
                aria-label="Clear search"
              >
                ✖️
              </button>
            )}
          </div>
        </div>

        {/* Sort */}
        <div className="md:col-span-3">
          <div className={`${brand.cardBg} rounded-2xl px-3 py-2.5 shadow-sm`}>
            <label htmlFor="sort" className="block text-xs font-semibold text-gray-500 mb-1">
              Sắp xếp
            </label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey)
                setPage(1)
              }}
              className="w-full bg-transparent outline-none text-gray-800"
            >
              <option value="createdAt:desc">Mới nhất</option>
              <option value="createdAt:asc">Cũ nhất</option>
              <option value="price:asc">Giá ↑</option>
              <option value="price:desc">Giá ↓</option>
              <option value="name:asc">Tên A → Z</option>
              <option value="name:desc">Tên Z → A</option>
            </select>
          </div>
        </div>

        {/* View & Limit */}
        <div className="md:col-span-4 flex gap-3">
          <div className={`${brand.cardBg} flex-1 rounded-2xl px-3 py-2.5 shadow-sm`}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Hiển thị</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value) || 12)
                setPage(1)
              }}
              className="w-full bg-transparent outline-none text-gray-800"
            >
              <option value={8}>8</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className={`${brand.cardBg} rounded-2xl px-3 py-2.5 shadow-sm`}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Chế độ xem</label>
            <div className="flex gap-2">
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  view === 'table'
                    ? `bg-gradient-to-r ${brand.primaryBtn} text-white`
                    : `${brand.outlineBtn}`
                }`}
              >
                Bảng
              </button>
              <button
                onClick={() => setView('grid')}
                className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition ${
                  view === 'grid'
                    ? `bg-gradient-to-r ${brand.primaryBtn} text-white`
                    : `${brand.outlineBtn}`
                }`}
              >
                Lưới
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`${brand.cardBg} rounded-3xl shadow-xl overflow-hidden`}>
        {isLoading || isRefetching ? (
          <div className="p-6">
            {view === 'table' ? (
              <TableSkeleton rows={skeletonArray.length} />
            ) : (
              <GridSkeleton cards={skeletonArray.length} />
            )}
          </div>
        ) : products.length === 0 ? (
          <EmptyState onCreate={openCreate} />
        ) : view === 'table' ? (
          <ProductsTable
            products={products}
            onEdit={openEdit}
            onDelete={(id) => confirmDelete(id)}
            priceFormat={formatVND}
            deletingId={deletingId}
          />
        ) : (
          <ProductsGrid
            products={products}
            onEdit={openEdit}
            onDelete={(id) => confirmDelete(id)}
            priceFormat={formatVND}
            deletingId={deletingId}
          />
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          Trang <span className="font-semibold">{page}</span> / {Math.max(1, totalPages)}{' '}
          <span className="mx-2">•</span> Tổng <span className="font-semibold">{total}</span> sản phẩm
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className={`px-4 py-2 rounded-xl font-semibold bg-white/70 border border-white/20 disabled:opacity-50 hover:shadow transition`}
          >
            ← Trước
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className={`px-4 py-2 rounded-xl font-semibold bg-white/70 border border-white/20 disabled:opacity-50 hover:shadow transition`}
          >
            Sau →
          </button>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={selectedProduct ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm'}
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
          isLoading={createProduct.isPending || updateProduct.isPending}
        />
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal isOpen={confirmOpen} onClose={onCancelDelete} title="🗑️ Xoá sản phẩm?">
        <div className="space-y-4">
          <p className="text-gray-700">Hành động này không thể hoàn tác. Bạn chắc chắn muốn xoá sản phẩm này?</p>
          <div className="flex justify-end gap-3">
            <button
              onClick={onCancelDelete}
              className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-semibold hover:shadow"
            >
              Huỷ
            </button>
            <button
              onClick={onConfirmDelete}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow-lg"
            >
              Xoá
            </button>
          </div>
        </div>
      </Modal>
    </ScreenShell>
  )
}

/* ===== Subcomponents ===== */

function Header({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-wrap justify-between items-start md:items-center mb-8 gap-4">
      <div>
        <h1 className="text-5xl font-extrabold leading-tight">
          <span className={`bg-gradient-to-r ${brand.headerGrad} bg-clip-text text-transparent`}>
            🛠️ Quản trị Sản phẩm
          </span>
        </h1>
        <p className="text-gray-600 text-lg mt-1">Tạo mới, chỉnh sửa và xoá sản phẩm của cửa hàng</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onAdd}
          className={`px-5 py-3 text-white rounded-xl font-bold bg-gradient-to-r ${brand.primaryBtn} ${brand.primaryBtnHover} transition`}
        >
          ➕ Thêm sản phẩm
        </button>
      </div>
    </div>
  )
}

function ProductsTable({
  products,
  onEdit,
  onDelete,
  priceFormat,
  deletingId,
}: {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  priceFormat: (n: number) => string
  deletingId: string | null
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className={`bg-gradient-to-r ${brand.headerGrad}`}>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Sản phẩm
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Giá
            </th>
            <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
              Cập nhật
            </th>
            <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-white/50 transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-4">
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/160?text=No+Image'}
                    alt={product.name}
                    className="w-16 h-16 rounded-xl object-cover shadow-md"
                    loading="lazy"
                  />
                  <div>
                    <p className="font-bold text-gray-900 text-lg line-clamp-1">{product.name}</p>
                    <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <span
                  className={`text-xl font-bold bg-gradient-to-r ${brand.gradText} bg-clip-text text-transparent`}
                >
                  {priceFormat(product.price)}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-700">
                {safeDate(product.updatedAt, product.createdAt).toLocaleString('vi-VN')}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => onEdit(product)}
                    className={`px-4 py-2 ${brand.neutralBtn} rounded-xl font-semibold transition`}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    onClick={() => onDelete(product.id)}
                    disabled={deletingId === product.id}
                    className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {deletingId === product.id ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Đang xoá…
                      </span>
                    ) : (
                      '🗑️ Xoá'
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ProductsGrid({
  products,
  onEdit,
  onDelete,
  priceFormat,
  deletingId,
}: {
  products: Product[]
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
  priceFormat: (n: number) => string
  deletingId: string | null
}) {
  return (
    <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <div
          key={p.id}
          className="group rounded-2xl overflow-hidden bg-white border border-white/40 shadow hover:shadow-xl transition"
        >
          <div className="relative">
            <img
              src={p.imageUrl || 'https://via.placeholder.com/600x400?text=No+Image'}
              alt={p.name}
              className="w-full h-44 object-cover"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs px-2 py-1 rounded">
              {safeDate(p.updatedAt, p.createdAt).toLocaleDateString('vi-VN')}
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1">{p.name}</h3>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{p.description}</p>
            <div className="flex items-center justify-between">
              <span
                className={`text-xl font-extrabold bg-gradient-to-r ${brand.gradText} bg-clip-text text-transparent`}
              >
                {priceFormat(p.price)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(p)}
                  className={`px-3 py-1.5 rounded-lg ${brand.outlineBtn} font-semibold`}
                >
                  ✏️ Sửa
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  disabled={deletingId === p.id}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold hover:shadow disabled:opacity-50"
                >
                  {deletingId === p.id ? 'Đang xoá…' : '🗑️ Xoá'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="text-7xl mb-4">📦</div>
      <h3 className="text-2xl font-bold text-gray-800">Chưa có sản phẩm nào</h3>
      <p className="text-gray-600 mt-2">
        Nhấn <span className="font-semibold">“Thêm sản phẩm”</span> để tạo sản phẩm đầu tiên.
      </p>
      <div className="mt-6">
        <button
          onClick={onCreate}
          className={`px-5 py-3 text-white rounded-xl font-bold bg-gradient-to-r ${brand.primaryBtn} ${brand.primaryBtnHover} transition`}
        >
          ➕ Thêm sản phẩm
        </button>
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse">
      <div
        className={`h-12 w-full bg-gradient-to-r from-sky-100 to-indigo-100 rounded-t-2xl mb-2`}
      />
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-12 gap-4 items-center py-4 border-b border-gray-100 px-6"
        >
          <div className="col-span-6 flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-200 rounded-xl" />
            <div className="space-y-2 w-2/3">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="col-span-2">
            <div className="h-6 bg-gray-200 rounded w-2/3" />
          </div>
          <div className="col-span-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
          <div className="col-span-2 flex justify-end">
            <div className="h-9 bg-gray-200 rounded w-28" />
          </div>
        </div>
      ))}
    </div>
  )
}

function GridSkeleton({ cards = 8 }: { cards?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(cards)].map((_, i) => (
        <div
          key={i}
          className="rounded-2xl overflow-hidden border border-white/40 bg-white animate-pulse"
        >
          <div className="h-44 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-8 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}
