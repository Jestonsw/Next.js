'use client'

import { useEffect, useRef, useState } from 'react'
import type * as L from 'leaflet'

interface InteractiveMapProps {
  center?: [number, number]
  latitude?: number
  longitude?: number
  zoom?: number
  onLocationSelect: (lat: number, lng: number) => void
  height?: string
}

export default function InteractiveMap({ 
  center,
  latitude, 
  longitude, 
  zoom = 15,
  onLocationSelect, 
  height = '300px' 
}: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initMap = async () => {
      // Dynamically import Leaflet only on client side
      const L = (await import('leaflet')).default

      // Set up Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
        document.head.appendChild(link)
      }

      // Initialize map
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Determine map center coordinates
      const mapCenter: [number, number] = center || [latitude ?? 41.6781, longitude ?? 26.5584]
      const map = L.map(mapRef.current as HTMLElement).setView(mapCenter, zoom)

      // Define different tile layers
      const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      })

      const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      })

      const hybridLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: '© Esri, Maxar, Earthstar Geographics',
        maxZoom: 19
      })

      // Add labels overlay for satellite view
      const labelsLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
        attribution: '',
        maxZoom: 19
      })

      // Add default layer
      streetLayer.addTo(map)

      // Create layer control
      const baseMaps = {
        "Harita": streetLayer,
        "Uydu": satelliteLayer,
        "Hibrit": L.layerGroup([satelliteLayer, labelsLayer])
      }

      L.control.layers(baseMaps).addTo(map)

      // Add marker
      const customIcon = L.divIcon({
        html: `<div style="background: #dc2626; border: 2px solid white; border-radius: 50%; width: 20px; height: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'custom-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      const marker = L.marker(mapCenter, { 
        icon: customIcon,
        draggable: true 
      }).addTo(map)

      // Handle marker drag
      marker.on('dragend', function(e: any) {
        const position = e.target.getLatLng()
        onLocationSelect(position.lat, position.lng)
      })

      // Handle map click
      map.on('click', function(e: any) {
        const { lat, lng } = e.latlng
        marker.setLatLng([lat, lng])
        onLocationSelect(lat, lng)
      })

      mapInstanceRef.current = map
      markerRef.current = marker
    }

    // Small delay to ensure DOM is ready
    setTimeout(initMap, 100)

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [isClient, center, latitude, longitude, zoom])

  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const newCenter: [number, number] = center || [latitude ?? 41.6781, longitude ?? 26.5584]
      markerRef.current.setLatLng(newCenter)
      mapInstanceRef.current.setView(newCenter)
    }
  }, [center, latitude, longitude])

  if (!isClient) {
    return (
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <div style={{ height, width: '100%' }} className="bg-gray-100 flex items-center justify-center">
          <div className="text-gray-600">Harita yükleniyor...</div>
        </div>
        <div className="p-2 bg-gray-50 text-xs text-gray-600">
          Harita üzerinde bir noktaya tıklayın veya kırmızı işareti sürükleyin
        </div>
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div ref={mapRef} style={{ height, width: '100%' }} />
      <div className="p-2 bg-gray-50 text-xs text-gray-600">
        Harita üzerinde bir noktaya tıklayın veya kırmızı işareti sürükleyin
      </div>
    </div>
  )
}