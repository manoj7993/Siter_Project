import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Mail, Lock, LogIn, Package } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'

const LoginPage = () => {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'ADMINISTRATOR') {
          navigate('/admin/dashboard')
        } else {
          navigate('/dashboard')
        }
      }
    } catch (error) {
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Boxinator</h1>
          <p className="text-gray-600">Welcome back to your shipping solution</p>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 text-center">
              Access your account to manage shipments
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
            </div>

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                icon={Lock}
                error={errors.password?.message}
                {...register('password', {
                  required: 'Password is required',
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              icon={LogIn}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Want to send without an account?{' '}
              <Link
                to="/guest-shipment"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Send as guest
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage
