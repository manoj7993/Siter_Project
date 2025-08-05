import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Package, MapPin, Clock, CheckCircle, XCircle, Truck, ArrowLeft } from 'lucide-react'
// import { shipmentsAPI } from '@/services/api'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'

const TrackingPage = () => {
  const { trackingNumber } = useParams()
  const [shipment, setShipment] = useState(null)
  const [trackingHistory, setTrackingHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (trackingNumber) {
      loadTrackingInfo()
    }
  }, [trackingNumber])

  const loadTrackingInfo = async () => {
    try {
      // Temporarily commented out for debugging
      // const response = await shipmentsAPI.getTrackingHistory(trackingNumber)
      // setShipment(response.data.shipment)
      // setTrackingHistory(response.data.history)
      
      // Dummy data for testing
      setShipment({
        id: trackingNumber,
        trackingNumber: trackingNumber,
        status: 'INTRANSIT',
        sender: { name: 'Test Sender' },
        recipient: { name: 'Test Recipient' }
      })
      setTrackingHistory([
        { status: 'CREATED', timestamp: new Date(), location: 'Origin' },
        { status: 'INTRANSIT', timestamp: new Date(), location: 'Transit Hub' }
      ])
    } catch (error) {
      console.error('Error loading tracking info:', error)
      setError('Shipment not found or tracking number is invalid')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CREATED':
        return <Package className="w-6 h-6 text-blue-500" />
      case 'RECIEVED':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'INTRANSIT':
        return <Truck className="w-6 h-6 text-orange-500" />
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-500" />
      default:
        return <Package className="w-6 h-6 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'CREATED':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'RECIEVED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'INTRANSIT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusDescription = (status) => {
    switch (status) {
      case 'CREATED':
        return 'Your shipment has been created and is awaiting pickup'
      case 'RECIEVED':
        return 'Package has been received at our facility'
      case 'INTRANSIT':
        return 'Your package is on its way to the destination'
      case 'COMPLETED':
        return 'Package has been successfully delivered'
      case 'CANCELLED':
        return 'Shipment has been cancelled'
      default:
        return 'Status unknown'
    }
  }

  const getProgressPercentage = (status) => {
    switch (status) {
      case 'CREATED':
        return 25
      case 'RECIEVED':
        return 50
      case 'INTRANSIT':
        return 75
      case 'COMPLETED':
        return 100
      case 'CANCELLED':
        return 0
      default:
        return 0
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full" />
          <p className="text-gray-600 mt-2">Loading tracking information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="p-8 text-center max-w-md w-full">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Tracking Not Found
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/">
            <Button icon={ArrowLeft}>
              Go to Homepage
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 text-sm font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Homepage
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Track Your Package
          </h1>
          <p className="text-gray-600 mt-2">
            Tracking Number: <span className="font-mono font-medium">{trackingNumber}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipment Details */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Shipment Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Receiver</p>
                  <p className="text-gray-900">{shipment?.receiverName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Destination</p>
                  <p className="text-gray-900">{shipment?.destinationCountry}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-gray-900">{shipment?.weight} kg</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Box Color</p>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-6 h-6 rounded border-2 border-gray-300 mr-2"
                      style={{ backgroundColor: shipment?.boxColor }}
                    />
                    <span className="text-gray-900 font-mono text-sm">
                      {shipment?.boxColor}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Cost</p>
                  <p className="text-gray-900 font-semibold">{shipment?.totalCost} Kr</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-gray-900">
                    {new Date(shipment?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Tracking Progress */}
          <div className="lg:col-span-2">
            {/* Current Status */}
            <Card className="p-6 mb-6">
              <div className="flex items-center mb-4">
                {getStatusIcon(shipment?.status)}
                <div className="ml-3">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {shipment?.status?.replace('_', ' ')}
                  </h2>
                  <p className="text-gray-600">
                    {getStatusDescription(shipment?.status)}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              {shipment?.status !== 'CANCELLED' && (
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{getProgressPercentage(shipment?.status)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage(shipment?.status)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Status Badge */}
              <div className="inline-flex">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(shipment?.status)}`}>
                  {shipment?.status}
                </span>
              </div>
            </Card>

            {/* Tracking History */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Tracking History
              </h3>
              
              <div className="space-y-6">
                {trackingHistory.length > 0 ? (
                  trackingHistory.map((event, index) => (
                    <div key={event.id} className="flex">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          index === 0 ? 'bg-primary-100' : 'bg-gray-100'
                        }`}>
                          {getStatusIcon(event.status)}
                        </div>
                      </div>
                      
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {event.status?.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.createdAt).toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="mt-1">
                          <p className="text-sm text-gray-600">
                            {event.description}
                          </p>
                          {event.location && (
                            <div className="flex items-center mt-1">
                              <MapPin className="w-4 h-4 text-gray-400 mr-1" />
                              <p className="text-sm text-gray-500">
                                {event.location}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No tracking history yet
                    </h4>
                    <p className="text-gray-600">
                      Tracking updates will appear here as your package moves through our system.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TrackingPage
