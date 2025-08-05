import React, { useState, useEffect } from "react";
import { Package, Users, TrendingUp, Settings, Eye, Edit } from "lucide-react";
// import { useAuthContext } from "@/contexts/AuthContext";
// import { shipmentsAPI, usersAPI, countriesAPI } from "@/services/api";
import Layout from "@/components/layout/Layout";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import toast from 'react-hot-toast'

const AdminDashboardPage = () => {
  // const { user } = useAuthContext()
  const user = { name: 'Admin User', role: 'admin' } // Mock user for testing
  const [stats, setStats] = useState({
    totalShipments: 0,
    activeShipments: 0,
    completedShipments: 0,
    totalUsers: 0,
  })
  const [shipments, setShipments] = useState([])
  const [countries, setCountries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [showCountryModal, setShowCountryModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [newStatus, setNewStatus] = useState('')
  const [newMultiplier, setNewMultiplier] = useState('')

  const statusOptions = [
    { value: 'CREATED', label: 'Created' },
    { value: 'RECIEVED', label: 'Received' },
    { value: 'INTRANSIT', label: 'In Transit' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELLED', label: 'Cancelled' },
  ]

  // Load data on component mount
  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [shipmentsRes, statsRes, countriesRes] = await Promise.all([
        shipmentsAPI.getAllShipments(),
        shipmentsAPI.getStats(),
        countriesAPI.getCountries(),
      ])

      setShipments(shipmentsRes.data)
      setStats(statsRes.data)
      setCountries(countriesRes.data)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async () => {
    if (!selectedShipment || !newStatus) return

    try {
      await shipmentsAPI.updateShipmentStatus(selectedShipment.id, {
        status: newStatus,
        location: 'Admin Update',
        description: `Status changed to ${newStatus} by administrator`,
      })

      toast.success('Shipment status updated successfully!')
      setShowStatusModal(false)
      setSelectedShipment(null)
      setNewStatus('')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating shipment status:', error)
    }
  }

  const handleCountryMultiplierUpdate = async () => {
    if (!selectedCountry || !newMultiplier) return

    try {
      await countriesAPI.updateCountryMultiplier(selectedCountry.id, {
        multiplier: parseFloat(newMultiplier),
      })

      toast.success('Country multiplier updated successfully!')
      setShowCountryModal(false)
      setSelectedCountry(null)
      setNewMultiplier('')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating country multiplier:', error)
    }
  }

  const openStatusModal = (shipment) => {
    setSelectedShipment(shipment)
    setNewStatus(shipment.status)
    setShowStatusModal(true)
  }

  const openCountryModal = (country) => {
    setSelectedCountry(country)
    setNewMultiplier(country.multiplier.toString())
    setShowCountryModal(true)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED':
        return <Package className="w-4 h-4 text-blue-500" />
      case 'RECIEVED':
        return <Package className="w-4 h-4 text-green-500" />
      case 'INTRANSIT':
        return <Package className="w-4 h-4 text-orange-500" />
      case 'COMPLETED':
        return <Package className="w-4 h-4 text-green-600" />
      case 'CANCELLED':
        return <Package className="w-4 h-4 text-red-500" />
      default:
        return <Package className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800'
      case 'RECIEVED':
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

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administrator Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage shipments, users, and system settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedShipments}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* All Shipments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Shipments</h2>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tracking Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sender
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
                  {shipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {shipment.trackingNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {shipment.sender?.firstName} {shipment.sender?.lastName || 'Guest User'}
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Eye}
                        >
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => openStatusModal(shipment)}
                        >
                          Update Status
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Country Multipliers */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Country Multipliers</h2>
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Country
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Multiplier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {countries.map((country) => (
                    <tr key={country.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {country.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {country.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {country.multiplier}x
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={Edit}
                          onClick={() => openCountryModal(country)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Update Status Modal */}
        <Modal
          isOpen={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          title="Update Shipment Status"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Tracking Number: <span className="font-medium">{selectedShipment?.trackingNumber}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Current Status: <span className="font-medium">{selectedShipment?.status}</span>
              </p>
            </div>

            <Select
              label="New Status"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              options={statusOptions}
            />

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowStatusModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleStatusChange}
                disabled={!newStatus}
              >
                Update Status
              </Button>
            </div>
          </div>
        </Modal>

        {/* Update Country Multiplier Modal */}
        <Modal
          isOpen={showCountryModal}
          onClose={() => setShowCountryModal(false)}
          title="Update Country Multiplier"
        >
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Country: <span className="font-medium">{selectedCountry?.name}</span>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Current Multiplier: <span className="font-medium">{selectedCountry?.multiplier}x</span>
              </p>
            </div>

            <Input
              label="New Multiplier"
              type="number"
              step="0.1"
              min="0"
              value={newMultiplier}
              onChange={(e) => setNewMultiplier(e.target.value)}
              placeholder="Enter multiplier value"
            />

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                The multiplier is used to calculate shipping costs: Total cost = 200Kr + (weight × multiplier)
              </p>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCountryModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCountryMultiplierUpdate}
                disabled={!newMultiplier}
              >
                Update Multiplier
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

export default AdminDashboardPage
