import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Package, Mail, User, ArrowLeft } from 'lucide-react'
// import { shipmentsAPI } from '@/services/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import ColorPicker from '@/components/ui/ColorPicker'
import toast from 'react-hot-toast'

const GuestShipmentPage = () => {
  const navigate = useNavigate()
  const [countries, setCountries] = useState([])
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm()

  const selectedColor = watch('boxColor', '#3b82f6')

  // Box weight options
  const boxOptions = [
    { value: '1', label: 'Basic Tier - 1kg', weight: 1 },
    { value: '2', label: 'Humble Tier - 2kg', weight: 2 },
    { value: '5', label: 'Deluxe Tier - 5kg', weight: 5 },
    { value: '8', label: 'Premium Tier - 8kg', weight: 8 },
  ]

  // Load countries on component mount
  useEffect(() => {
    loadCountries()
  }, [])

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
      // Fallback list of common countries
      setCountries([
        { value: 'US', label: 'United States' },
        { value: 'CA', label: 'Canada' },
        { value: 'GB', label: 'United Kingdom' },
        { value: 'DE', label: 'Germany' },
        { value: 'FR', label: 'France' },
        { value: 'IT', label: 'Italy' },
        { value: 'ES', label: 'Spain' },
        { value: 'AU', label: 'Australia' },
        { value: 'JP', label: 'Japan' },
        { value: 'CN', label: 'China' },
        { value: 'IN', label: 'India' },
        { value: 'BR', label: 'Brazil' },
      ])
    }
  }

  const onSubmit = async (data) => {
    setIsCreating(true)
    try {
      const shipmentData = {
        receiverName: data.receiverName,
        receiverEmail: data.receiverEmail,
        guestEmail: data.guestEmail,
        destinationCountry: data.destinationCountry,
        weight: parseFloat(data.weight),
        boxColor: data.boxColor,
        isGuest: true,
      }

      // Temporarily commented out for debugging
      // const response = await shipmentsAPI.createGuestShipment(shipmentData)
      
      toast.success('Shipment created successfully! Check your email for the receipt and account creation link.')
      
      // Mock tracking number for testing
      const mockTrackingNumber = 'TEST' + Date.now()
      navigate(`/tracking/${mockTrackingNumber}`)
    } catch (error) {
      console.error('Error creating guest shipment:', error)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Send as Guest</h1>
          <p className="text-gray-600 mb-4">
            Create a shipment without registering an account
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Your email will only be used for receipt purposes and to send you a link to create an account later and claim this shipment.
            </p>
          </div>
        </div>

        <Card className="p-8">
          <div className="mb-6">
            <Link
              to="/login"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Login
            </Link>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              Create Guest Shipment
            </h2>
            <p className="text-gray-600 text-center">
              Fill in the shipment details below
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Guest Email */}
            <div>
              <Input
                label="Your Email (for receipt)"
                type="email"
                placeholder="Enter your email address"
                icon={Mail}
                error={errors.guestEmail?.message}
                {...register('guestEmail', {
                  required: 'Your email is required for receipt purposes',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
              />
              <p className="mt-1 text-xs text-gray-500">
                We'll send you a receipt and a link to create an account to claim this shipment
              </p>
            </div>

            {/* Receiver Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Receiver Information</h3>
              
              <div className="space-y-4">
                <Input
                  label="Receiver Name"
                  placeholder="Enter receiver's full name"
                  icon={User}
                  error={errors.receiverName?.message}
                  {...register('receiverName', {
                    required: 'Receiver name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                />

                <Input
                  label="Receiver Email"
                  type="email"
                  placeholder="Enter receiver's email"
                  icon={Mail}
                  error={errors.receiverEmail?.message}
                  {...register('receiverEmail', {
                    required: 'Receiver email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address',
                    },
                  })}
                />
              </div>
            </div>

            {/* Shipment Details */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipment Details</h3>
              
              <div className="space-y-4">
                <Select
                  label="Weight Option"
                  placeholder="Select box tier and weight"
                  options={boxOptions}
                  error={errors.weight?.message}
                  {...register('weight', {
                    required: 'Weight option is required',
                  })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Box Color
                  </label>
                  <ColorPicker
                    value={selectedColor}
                    onChange={(color) => {
                      setValue('boxColor', color)
                      setSelectedColor(color)
                    }}
                    error={errors.boxColor?.message}
                  />
                  <input
                    type="hidden"
                    {...register('boxColor', {
                      required: 'Box color is required',
                    })}
                  />
                </div>

                <Select
                  label="Destination Country"
                  placeholder="Select destination"
                  options={countries}
                  error={errors.destinationCountry?.message}
                  {...register('destinationCountry', {
                    required: 'Destination country is required',
                  })}
                />
              </div>
            </div>

            {/* Cost Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pricing Information</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Flat fee for shipments between Norway, Sweden, Denmark: 200 Kr</li>
                <li>• Additional fees apply for other countries based on weight and distance</li>
                <li>• Final cost will be calculated and shown after creating the shipment</li>
              </ul>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isCreating}
            >
              {isCreating ? 'Creating Shipment...' : 'Create Shipment'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Want to create an account now?{' '}
              <Link
                to="/register"
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Register here
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default GuestShipmentPage
