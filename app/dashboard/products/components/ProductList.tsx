'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  comparePrice: number | null
  inventory: number
  images: string[]
  active: boolean
  storeName: string
  categories: Category[]
}

interface ProductListProps {
  products: Product[]
}

export default function ProductList({ products }: ProductListProps) {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map((product) => product.id))
    }
  }

  const toggleSelect = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId))
    } else {
      setSelectedProducts([...selectedProducts, productId])
    }
  }

  const handleDelete = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      // Refresh the page to update the product list
      window.location.reload()
    } catch (error) {
      alert('Failed to delete product. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="relative px-7 sm:w-12 sm:px-6">
              <input
                type="checkbox"
                className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                checked={selectedProducts.length === products.length}
                onChange={toggleSelectAll}
              />
            </th>
            <th scope="col" className="min-w-[12rem] py-3.5 pr-3 text-left text-sm font-semibold text-gray-900">
              Product
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Store
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Categories
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Price
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Inventory
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {products.map((product) => (
            <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-gray-50' : undefined}>
              <td className="relative px-7 sm:w-12 sm:px-6">
                <input
                  type="checkbox"
                  className="absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  checked={selectedProducts.includes(product.id)}
                  onChange={() => toggleSelect(product.id)}
                />
              </td>
              <td className="whitespace-nowrap py-4 pr-3 text-sm">
                <div className="flex items-center">
                  <div className="h-10 w-10 flex-shrink-0">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        className="h-10 w-10 rounded-full object-cover"
                        width={40}
                        height={40}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gray-200" />
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    {product.description && (
                      <div className="text-gray-500">{product.description}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {product.storeName}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {product.categories.map((category) => category.name).join(', ')}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">${product.price.toFixed(2)}</span>
                  {product.comparePrice && (
                    <span className="text-gray-500 line-through">
                      ${product.comparePrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {product.inventory}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <span
                  className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                    product.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {product.active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-3">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={`/dashboard/products/${product.id}/edit`}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    <PencilIcon className="h-5 w-5" />
                    <span className="sr-only">Edit {product.name}</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={isDeleting}
                    className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <TrashIcon className="h-5 w-5" />
                    <span className="sr-only">Delete {product.name}</span>
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