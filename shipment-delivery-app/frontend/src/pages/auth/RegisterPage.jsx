import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { User, Mail, Lock, Calendar, MapPin, Phone, Package } from 'lucide-react'
import { authAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

const RegisterPage = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [countries, setCountries] = useState([])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm()

  const password = watch('password')

  // Load countries on component mount
  React.useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2', {
          timeout: 5000, // 5 second timeout
        })
        if (!response.ok) {
          throw new Error('Failed to fetch countries')
        }
        const data = await response.json()
        const sortedCountries = data
          .map(country => ({
            value: country.cca2,
            label: country.name.common,
          }))
          .sort((a, b) => a.label.localeCompare(b.label))
        setCountries(sortedCountries)
      } catch (error) {
        // Silently use fallback countries without logging error to console
        setCountries([
          { value: 'US', label: 'United States' },
          { value: 'CA', label: 'Canada' },
          { value: 'GB', label: 'United Kingdom' },
          { value: 'DE', label: 'Germany' },
          { value: 'FR', label: 'France' },
          { value: 'IT', label: 'Italy' },
          { value: 'ES', label: 'Spain' },
          { value: 'NO', label: 'Norway' },
          { value: 'SE', label: 'Sweden' },
          { value: 'DK', label: 'Denmark' },
          { value: 'AU', label: 'Australia' },
          { value: 'JP', label: 'Japan' },
        ])
      }
    }
    loadCountries()
  }, [])

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      await authAPI.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        dateOfBirth: data.dateOfBirth,
        countryId: data.country, // Fixed: use countryId instead of country
        zipCode: data.postalCode, // Fixed: use zipCode instead of postalCode
        contactNumber: data.contactNumber,
      })
      
      toast.success('Registration successful! Please check your email to activate your account.')
      navigate('/login')
    } catch (error) {
      console.error('Registration error:', error)
      if (error.response?.data?.errors) {
        // Display validation errors
        error.response.data.errors.forEach(err => {
          toast.error(err.msg || err.message)
        })
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Registration failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const validatePassword = (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(value)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(value)) {
      return 'Password must contain at least one number'
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      return 'Password must contain at least one special character'
    }
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Join Boxinator</h1>
          <p className="text-gray-600">Create your account to start shipping</p>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 text-center">
              Fill in your details to get started
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="First Name"
                  type="text"
                  placeholder="Enter your first name"
                  icon={User}
                  error={errors.firstName?.message}
                  {...register('firstName', {
                    required: 'First name is required',
                    minLength: {
                      value: 2,
                      message: 'First name must be at least 2 characters',
                    },
                  })}
                />
              </div>

              <div>
                <Input
                  label="Last Name"
                  type="text"
                  placeholder="Enter your last name"
                  icon={User}
                  error={errors.lastName?.message}
                  {...register('lastName', {
                    required: 'Last name is required',
                    minLength: {
                      value: 2,
                      message: 'Last name must be at least 2 characters',
                    },
                  })}
                />
              </div>
            </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  icon={Lock}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    validate: validatePassword,
                  })}
                />
              </div>

              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  icon={Lock}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                />
              </div>
            </div>

            <div>
              <Input
                label="Date of Birth"
                type="date"
                icon={Calendar}
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth', {
                  required: 'Date of birth is required',
                  validate: (value) => {
                    const today = new Date()
                    const birthDate = new Date(value)
                    const age = today.getFullYear() - birthDate.getFullYear()
                    return age >= 13 || 'You must be at least 13 years old'
                  },
                })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Select
                  label="Country of Residence"
                  placeholder="Select your country"
                  options={countries}
                  error={errors.country?.message}
                  {...register('country', {
                    required: 'Country is required',
                  })}
                />
              </div>

              <div>
                <Input
                  label="Postal Code"
                  type="text"
                  placeholder="Enter postal code"
                  icon={MapPin}
                  error={errors.postalCode?.message}
                  {...register('postalCode', {
                    required: 'Postal code is required',
                    pattern: {
                      value: /^[0-9A-Za-z\s-]{3,10}$/,
                      message: 'Please enter a valid postal code',
                    },
                  })}
                />
              </div>
            </div>

            <div>
              <Input
                label="Contact Number"
                type="tel"
                placeholder="Enter your phone number"
                icon={Phone}
                error={errors.contactNumber?.message}
                {...register('contactNumber', {
                  required: 'Contact number is required',
                  pattern: {
                    value: /^[\+]?[0-9\s\-\(\)]{8,15}$/,
                    message: 'Please enter a valid phone number',
                  },
                })}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage
