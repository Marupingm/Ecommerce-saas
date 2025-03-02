import { getServerSession } from 'next-auth/next'
import { authOptions } from '../api/auth/[...nextauth]/route'
import prisma from '@/lib/prisma'
import {
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'

async function getStats(userId: string) {
  const stores = await prisma.store.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
      orders: {
        select: {
          total: true,
        },
      },
    },
  })

  const totalProducts = stores.reduce((acc, store) => acc + store._count.products, 0)
  const totalOrders = stores.reduce((acc, store) => acc + store._count.orders, 0)
  const totalRevenue = stores.reduce(
    (acc, store) => acc + store.orders.reduce((sum, order) => sum + order.total, 0),
    0
  )
  const totalStores = stores.length

  return {
    totalProducts,
    totalOrders,
    totalRevenue,
    totalStores,
  }
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  const stats = await getStats(session.user.id)

  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShoppingBagIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Products</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalProducts}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/products"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                View all products
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CurrencyDollarIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Revenue</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    ${stats.totalRevenue.toFixed(2)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/analytics"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                View analytics
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UsersIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Total Orders</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalOrders}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/orders"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                View all orders
              </Link>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg bg-white shadow">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowTrendingUpIcon className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-gray-500">Active Stores</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalStores}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-5 py-3">
            <div className="text-sm">
              <Link
                href="/dashboard/stores"
                className="font-medium text-indigo-700 hover:text-indigo-900"
              >
                Manage stores
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-medium leading-6 text-gray-900">Recent Activity</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-medium text-gray-900">Latest Orders</h3>
                {/* Add latest orders list here */}
                <p className="mt-4 text-sm text-gray-500">No recent orders</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h3 className="text-base font-medium text-gray-900">Popular Products</h3>
                {/* Add popular products list here */}
                <p className="mt-4 text-sm text-gray-500">No popular products yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 