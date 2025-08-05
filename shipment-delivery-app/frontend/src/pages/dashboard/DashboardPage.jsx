import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Package, Eye, Truck, CheckCircle, XCircle } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'
import { shipmentsAPI } from '../../services/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Card from '../../components/ui/Card'
import Modal from '../../components/ui/Modal'
import ColorPicker from '../../components/ui/ColorPicker'
import toast from 'react-hot-toast'

const DashboardPage = () => {
  const { user } = useAuthContext()
  const [shipments, setShipments] = useState([])
  const [countries, setCountries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
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

  // Load shipments and countries on component mount
  useEffect(() => {
    loadShipments()
    loadCountries()
  }, [])

  const loadShipments = async () => {
    try {
      const response = await shipmentsAPI.getUserShipments()
      setShipments(response.data)
    } catch (error) {
      console.error('Error loading shipments:', error)
    } finally {
      setIsLoading(false)
    }
  }

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
    }
  }

  const onCreateShipment = async (data) => {
    setIsCreating(true)
    try {
      const shipmentData = {
        receiverName: data.receiverName,
        receiverEmail: data.receiverEmail,
        destinationCountry: data.destinationCountry,
        weight: parseFloat(data.weight),
        boxColor: data.boxColor,
      }

      await shipmentsAPI.createShipment(shipmentData)
      toast.success('Shipment created successfully!')
      setShowCreateModal(false)
      reset()
      loadShipments()
    } catch (error) {
      console.error('Error creating shipment:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'RECEIVED':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'INTRANSIT':
        return <Truck className="w-4 h-4 text-orange-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800'
      case 'RECEIVED':
        return 'bg-green-100 text-green-800'
      case 'INTRANSIT':
        return 'bg-orange-100 text-orange-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Separate active and completed shipments
  const activeShipments = shipments.filter(s => !['COMPLETED', 'CANCELLED'].includes(s.status))
  const completedShipments = shipments.filter(s => ['COMPLETED', 'CANCELLED'].includes(s.status))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your shipments and track deliveries
        </p>
      </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{activeShipments.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedShipments.filter(s => s.status === 'COMPLETED').length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Truck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeShipments.filter(s => s.status === 'INTRANSIT').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Active Shipments */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Active Shipments</h2>
            <Button
              onClick={() => setShowCreateModal(true)}
              icon={Plus}
            >
              New Shipment
            </Button>
          </div>

          {isLoading ? (
            <Card className="p-8 text-center">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
              <p className="text-gray-600 mt-2">Loading shipments...</p>
            </Card>
          ) : activeShipments.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No active shipments</h3>
              <p className="text-gray-600 mb-4">Create your first shipment to get started</p>
              <Button onClick={() => setShowCreateModal(true)} icon={Plus}>
                Create Shipment
              </Button>
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tracking Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Color
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activeShipments.map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.receiverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.destinationCountry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.weight}kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div
                            className="w-6 h-6 rounded border-2 border-gray-300"
                            style={{ backgroundColor: shipment.boxColor }}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1">{shipment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.totalCost} Kr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>

        {/* Recently Completed Shipments */}
        {completedShipments.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Completed</h2>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tracking Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receiver
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cost
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {completedShipments.slice(0, 5).map((shipment) => (
                      <tr key={shipment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.receiverName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.destinationCountry}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(shipment.status)}`}>
                            {getStatusIcon(shipment.status)}
                            <span className="ml-1">{shipment.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {shipment.totalCost} Kr
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={Eye}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Create Shipment Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Shipment"
        >
          <form onSubmit={handleSubmit(onCreateShipment)} className="space-y-6">
            <Input
              label="Receiver Name"
              placeholder="Enter receiver's full name"
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
              error={errors.receiverEmail?.message}
              {...register('receiverEmail', {
                required: 'Receiver email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />

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
                onChange={(color) => setValue('boxColor', color)}
                error={errors.boxColor?.message}
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

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating}
              >
                {isCreating ? 'Creating...' : 'Create Shipment'}
              </Button>
            </div>
          </form>
        </Modal>
    </div>
  )
}

export default DashboardPage
