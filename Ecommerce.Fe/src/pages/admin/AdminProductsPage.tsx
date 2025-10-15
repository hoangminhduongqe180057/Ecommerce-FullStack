import { useState } from 'react'
import { 
  useProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct 
} from '../../hooks/useProducts'
import { toast } from 'react-hot-toast'
import { ProductForm } from '../../components/products/ProductForm'
import { Modal } from '../../components/common'
import type { Product } from '../../types'

export default function AdminProductsPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const { data: productsData, isLoading } = useProducts({ page: 1, limit: 100 })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const deleteProduct = useDeleteProduct()

  const products = productsData?.items || []

  const handleSubmit = async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (selectedProduct) {
        await updateProduct.mutateAsync({ id: selectedProduct.id, ...data })
        toast.success('Product updated successfully!')
      } else {
        await createProduct.mutateAsync(data)
        toast.success('Product created successfully!')
      }
      setModalOpen(false)
      setSelectedProduct(null)
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await deleteProduct.mutateAsync(id)
      toast.success('Product deleted successfully!')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
        
        <div className="container mx-auto px-4 py-12 relative z-10">
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Loading products...
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />
      
      <div className="container mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <div>
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  🛠️ Manage Products
                </span>
              </h1>
              <p className="text-gray-600 text-lg">Create, edit, and delete products</p>
            </div>
            <button 
              onClick={() => { setSelectedProduct(null); setModalOpen(true) }}
              className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-105 transform transition-all duration-300"
            >
              ➕ Add Product
            </button>
          </div>

          {/* Products Table */}
          <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-white uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-white uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-white/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img 
                            src={product.imageUrl || 'https://via.placeholder.com/100'} 
                            alt={product.name} 
                            className="w-16 h-16 rounded-xl object-cover shadow-md"
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{product.name}</p>
                            <p className="text-sm text-gray-600 line-clamp-1">{product.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                          {product.price.toLocaleString()} VND
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-3">
                          <button 
                            onClick={() => { setSelectedProduct(product); setModalOpen(true) }}
                            className="px-4 py-2 bg-white/70 backdrop-blur-lg text-gray-700 rounded-xl font-semibold hover:bg-white hover:shadow-lg hover:scale-105 transform transition-all duration-300 border border-white/20"
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            disabled={deletingId === product.id}
                            className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                          >
                            {deletingId === product.id ? (
                              <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Deleting...
                              </span>
                            ) : (
                              '🗑️ Delete'
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <div className="text-6xl mb-4">📦</div>
                        <p className="text-xl font-bold text-gray-600">No products found</p>
                        <p className="text-gray-500 mt-2">Click "Add Product" to create your first product</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={selectedProduct ? '✏️ Edit Product' : '➕ Add Product'}>
          <ProductForm 
            product={selectedProduct} 
            onSubmit={handleSubmit} 
            onCancel={() => setModalOpen(false)} 
            isLoading={createProduct.isPending || updateProduct.isPending} 
          />
        </Modal>
      </div>
    )
}
