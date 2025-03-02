import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import Link from 'next/link'
import { PlusIcon } from '@heroicons/react/24/outline'
import ProductList from './components/ProductList'

async function getProducts(userId: string) {
  const stores = await prisma.store.findMany({
    where: { userId },
    include: {
      products: {
        include: {
          categories: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  })

  return stores.flatMap((store) => 
    store.products.map((product) => ({
      ...product,
      storeName: store.name,
      categories: product.categories.map((pc) => pc.category),
    }))
  )
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const products = await getProducts(session.user.id)

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all products across your stores.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            href="/dashboard/products/new"
            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <span className="flex items-center gap-x-2">
              <PlusIcon className="h-5 w-5" />
              Add product
            </span>
          </Link>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <ProductList products={products} />
          </div>
        </div>
      </div>
    </div>
  )
} 