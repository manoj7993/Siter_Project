import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { User, Mail, Calendar, MapPin, Phone, Edit2, Save, X } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { authAPI } from '../../services/api'
import Layout from '../../components/layout/Layout'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import toast from 'react-hot-toast'

const ProfilePage = () => {
  const { user, updateUser } = useAuthContext()
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [countries, setCountries] = useState([])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  // Load countries and set initial form values
  useEffect(() => {
    loadCountries()
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dateOfBirth: user.dateOfBirth?.split('T')[0], // Convert to YYYY-MM-DD format
        country: user.country,
        postalCode: user.postalCode,
        contactNumber: user.contactNumber,
      })
    }
  }, [user, reset])

  const loadCountries = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all?fields=name,cca2')
      const data = await response.json()
      const sortedCountries = data
        .map(country => ({
          value: country.cca2,
          label: country.name.common,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))
      setCountries(sortedCountries)
    } catch (error) {
      console.error('Error loading countries:', error)
      // Fallback countries
      setCountries([
        { value: 'NO', label: 'Norway' },
        { value: 'SE', label: 'Sweden' },
        { value: 'DK', label: 'Denmark' },
        { value: 'DE', label: 'Germany' },
        { value: 'GB', label: 'United Kingdom' },
      ])
    }
  }

  const onSubmit = async (data) => {
    setIsUpdating(true)
    try {
      const response = await authAPI.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        dateOfBirth: data.dateOfBirth,
        country: data.country,
        postalCode: data.postalCode,
        contactNumber: data.contactNumber,
      })

      updateUser(response.data.user)
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    reset({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateOfBirth: user.dateOfBirth?.split('T')[0],
      country: user.country,
      postalCode: user.postalCode,
      contactNumber: user.contactNumber,
    })
    setIsEditing(false)
  }

  // Don't show profile page for guest users
  if (user?.role === 'GUEST') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Account Access Restricted
            </h2>
            <p className="text-gray-600 mb-6">
              Guest users don't have access to account management. To access your account features, 
              please create an account using the link from your shipment receipt email.
            </p>
            <Button onClick={() => window.location.href = '/login'}>
              Go to Login
            </Button>
          </Card>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your personal information and account preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="w-10 h-10 text-primary-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <div className="mt-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user?.role?.toLowerCase().replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Member Since</p>
                    <p className="text-sm text-gray-900">
                      {new Date(user?.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Account Status</p>
                    <p className="text-sm text-green-600 font-medium">Active</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Personal Information
                </h2>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    icon={Edit2}
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      icon={X}
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="profile-form"
                      icon={Save}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                )}
              </div>

              <form
                id="profile-form"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Personal Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="First Name"
                      type="text"
                      placeholder="Enter your first name"
                      icon={User}
                      disabled={!isEditing}
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
                      disabled={!isEditing}
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
                    disabled={!isEditing}
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
                    label="Date of Birth"
                    type="date"
                    icon={Calendar}
                    disabled={!isEditing}
                    error={errors.dateOfBirth?.message}
                    {...register('dateOfBirth', {
                      required: 'Date of birth is required',
                    })}
                  />
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Select
                        label="Country of Residence"
                        placeholder="Select your country"
                        options={countries}
                        disabled={!isEditing}
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
                        disabled={!isEditing}
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

                  <div className="mt-6">
                    <Input
                      label="Contact Number"
                      type="tel"
                      placeholder="Enter your phone number"
                      icon={Phone}
                      disabled={!isEditing}
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
                </div>
              </form>
            </Card>

            {/* Security Section */}
            <Card className="p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Security
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Password</p>
                    <p className="text-sm text-gray-500">
                      Last updated: Never (Sign in with social account)
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ProfilePage
