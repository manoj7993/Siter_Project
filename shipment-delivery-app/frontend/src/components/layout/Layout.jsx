import React from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { Package, Home, User, Settings, LogOut, Users, BarChart3 } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../ui/Button'

const Layout = ({ children }) => {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Shipments', href: '/shipments', icon: Package },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  const adminNavigation = [
    { name: 'Admin Dashboard', href: '/admin/dashboard', icon: BarChart3 },
    { name: 'Debug Console', href: '/admin/debug', icon: Settings },
  ]

  const currentNavigation = user?.role === 'ADMINISTRATOR' ? adminNavigation : navigation

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-xl font-bold text-gray-900">Boxinator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 flex flex-col">
            <nav className="flex-1 px-4 space-y-1">
              {currentNavigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(item.href)
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive(item.href)
                          ? 'text-primary-600'
                          : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>

            {/* User section */}
            <div className="flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-primary-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden">
          <div className="bg-white shadow-sm border-b border-gray-200">
            <div className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h1 className="ml-3 text-xl font-bold text-gray-900">Boxinator</h1>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={LogOut}
                  onClick={handleLogout}
                >
                  Sign out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  )
}

export default Layout
