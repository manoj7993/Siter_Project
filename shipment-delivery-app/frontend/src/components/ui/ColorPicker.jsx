import React, { useState } from 'react'
import { Palette } from 'lucide-react'

const ColorPicker = ({ value = '#3b82f6', onChange, error, ...props }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [customColor, setCustomColor] = useState(value)

  const presetColors = [
    '#3b82f6', // Blue
    '#ef4444', // Red
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#8b5cf6', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#84cc16', // Lime
    '#ec4899', // Pink
    '#6b7280', // Gray
    '#000000', // Black
    '#ffffff', // White
  ]

  const handleColorSelect = (color) => {
    setCustomColor(color)
    onChange(color)
    setIsOpen(false)
  }

  const handleCustomColorChange = (e) => {
    const color = e.target.value
    setCustomColor(color)
    onChange(color)
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* Color preview */}
        <div
          className="w-12 h-12 rounded border-2 border-gray-300 cursor-pointer flex items-center justify-center"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {value === '#ffffff' && <Palette className="w-6 h-6 text-gray-400" />}
        </div>
        
        {/* Color value input */}
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setCustomColor(e.target.value)
              onChange(e.target.value)
            }}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            placeholder="#3b82f6"
            {...props}
          />
        </div>
      </div>

      {/* Color picker dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preset Colors
            </label>
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded border-2 ${
                    value === color ? 'border-primary-500' : 'border-gray-300'
                  } hover:border-primary-400 transition-colors`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleColorSelect(color)}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Color
            </label>
            <input
              type="color"
              value={customColor}
              onChange={handleCustomColorChange}
              className="w-full h-10 rounded border border-gray-300 cursor-pointer"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default ColorPicker
