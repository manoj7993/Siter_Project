import React, { useState, useEffect } from 'react'
import { Search, Play, RotateCcw, AlertTriangle } from 'lucide-react'
// import { useAuthContext } from '@/contexts/AuthContext'
// import { shipmentsAPI } from '@/services/api'
import Layout from '@/components/layout/Layout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Card from '@/components/ui/Card'
import toast from 'react-hot-toast'

const DebugPage = () => {
  // const { user } = useAuthContext()
  const user = { name: 'Admin User', role: 'admin' } // Mock user for testing
  const [shipments, setShipments] = useState([])
  const [filteredShipments, setFilteredShipments] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState({})

  const statusOptions = [
    { value: 'CREATED', label: 'Created', description: 'Package has been created and is awaiting pickup' },
    { value: 'RECIEVED', label: 'Received', description: 'Package has been physically collected for transport' },
    { value: 'INTRANSIT', label: 'In Transit', description: 'Package is being transported to destination' },
    { value: 'COMPLETED', label: 'Completed', description: 'Package has been delivered successfully' },
    { value: 'CANCELLED', label: 'Cancelled', description: 'Package shipment has been cancelled' },
  ]

  // Load shipments on component mount
  useEffect(() => {
    loadShipments()
  }, [])

  // Filter shipments based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredShipments(shipments)
    } else {
      const filtered = shipments.filter(shipment =>
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.destinationCountry.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredShipments(filtered)
    }
  }, [searchTerm, shipments])

  const loadShipments = async () => {
    try {
      const response = await shipmentsAPI.getAllShipments()
      setShipments(response.data)
    } catch (error) {
      console.error('Error loading shipments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateShipmentStatus = async (shipmentId, newStatus, currentStatus) => {
    // Prevent updating to the same status
    if (newStatus === currentStatus) {
      toast.error('Shipment is already in this status')
      return
    }

    setUpdatingStatus(prev => ({ ...prev, [shipmentId]: true }))

    try {
      await shipmentsAPI.updateShipmentStatus(shipmentId, {
        status: newStatus,
        location: 'Debug Console',
        description: `Status changed from ${currentStatus} to ${newStatus} via debug console`,
      })

      toast.success(`Status updated to ${newStatus}`)
      loadShipments() // Reload to get updated data
    } catch (error) {
      console.error('Error updating shipment status:', error)
      toast.error('Failed to update status')
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [shipmentId]: false }))
    }
  }

  const getStatusIcon = (status) => {
    const statusInfo = statusOptions.find(s => s.value === status)
    return statusInfo ? statusInfo.label : status
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

  // Redirect non-admin users
  if (user?.role !== 'ADMINISTRATOR') {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600">
              This debug page is only accessible to administrators.
            </p>
          </Card>
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
            Package Status Debug Console
          </h1>
          <p className="text-gray-600 mt-2">
            Debug tool to easily change package statuses for demonstration purposes
          </p>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Demo Purpose Only</h4>
                <p className="text-sm text-yellow-700">
                  This tool is for demonstration purposes. In a real system, package statuses 
                  would be updated automatically by warehouse and logistics systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by tracking number, receiver name, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={Search}
          />
        </div>

        {/* Status Legend */}
        <Card className="p-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">Status Definitions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {statusOptions.map((status) => (
              <div key={status.value} className="text-sm">
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-1 ${getStatusColor(status.value)}`}>
                  {status.label}
                </div>
                <p className="text-gray-600">{status.description}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Shipments Table */}
        {isLoading ? (
          <Card className="p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
            <p className="text-gray-600 mt-2">Loading shipments...</p>
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
                      Current Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {shipment.trackingNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          Created {new Date(shipment.createdAt).toLocaleDateString()}
                        </div>
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
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1">
                          {statusOptions.map((status) => (
                            <Button
                              key={status.value}
                              variant={shipment.status === status.value ? 'outline' : 'ghost'}
                              size="sm"
                              disabled={
                                shipment.status === status.value || 
                                updatingStatus[shipment.id]
                              }
                              onClick={() => updateShipmentStatus(
                                shipment.id, 
                                status.value, 
                                shipment.status
                              )}
                            >
                              {updatingStatus[shipment.id] ? (
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (
                                status.label
                              )}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredShipments.length === 0 && !isLoading && (
              <div className="text-center py-8">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No shipments found
                </h3>
                <p className="text-gray-600">
                  {searchTerm ? 'Try adjusting your search terms' : 'No shipments available'}
                </p>
              </div>
            )}
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex justify-end">
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={loadShipments}
          >
            Refresh Data
          </Button>
        </div>
      </div>
    </Layout>
  )
}

export default DebugPage
