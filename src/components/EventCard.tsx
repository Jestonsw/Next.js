'use client'

import { Calendar, MapPin, Heart, ExternalLink, Star } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { memo, useState, useCallback, useEffect } from 'react'
import Image from 'next/image'

interface Event {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  startTime: string
  endTime?: string
  location: string
  address?: string
  organizerName?: string
  organizerContact?: string
  categoryId: number
  capacity?: number
  imageUrl?: string
  websiteUrl?: string
  ticketUrl?: string
  tags?: string | string[]
  participantType: string
  rating?: number
  reviewCount?: number
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
  categories?: Array<{
    categoryId: number
    categoryName: string
    categoryDisplayName: string
    categoryColor: string
    categoryIcon: string
  }>
}

interface Category {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
}

interface EventCardProps {
  event: Event
  category?: Category
  isFavorite: boolean
  onFavoriteToggle: () => void
  onEventClick: () => void
}

// Image cache to prevent repeated loading
const imageCache = new Map<string, string>()

// Clear cache when component reloads (for development)
if (typeof window !== 'undefined') {
  imageCache.clear()
  console.log('🔄 Image cache cleared')
}

const EventCard = memo(function EventCard({ event, category, isFavorite, onFavoriteToggle, onEventClick }: EventCardProps) {
  const { t, translateText } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const [cachedImageSrc, setCachedImageSrc] = useState<string | null>(null)
  
  // Check if running on custom domain and get proper image source
  const [isCustomDomain, setIsCustomDomain] = useState(false)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      setIsCustomDomain(hostname.includes('edirne-events.com'))
    }
  }, [])
  
  const getImageSrc = useCallback((imageUrl: string) => {
    // Check cache first
    const cacheKey = `${imageUrl}_${event.id}`
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey)!
    }
    
    // Use local serve-image API for uploads
    if (imageUrl.startsWith('/uploads/')) {
      const filename = imageUrl.split('/').pop()
      const localUrl = `/api/serve-image/${filename}?t=${Date.now()}`
      imageCache.set(cacheKey, localUrl)
      console.log(`🎯 CACHED: Event ${event.id} - ${localUrl}`)
      return localUrl
    }
    
    const finalUrl = `${imageUrl}?v=${Date.now()}`
    imageCache.set(cacheKey, finalUrl)
    return finalUrl
  }, [event.id])
  
  // Set cached image source once
  useEffect(() => {
    if (event.imageUrl && !cachedImageSrc) {
      const src = getImageSrc(event.imageUrl)
      setCachedImageSrc(src)
    }
  }, [event.imageUrl, cachedImageSrc, getImageSrc])
  
  const handleImageError = useCallback(() => {
    console.log(`❌ FINAL ERROR: Event ${event.id} - ${event.imageUrl}`)
    setImageError(true)
  }, [event.id, event.imageUrl])

  const handleImageLoad = useCallback(() => {
    console.log(`✅ FINAL SUCCESS: Event ${event.id} - ${event.imageUrl}`)
    setImageError(false)
  }, [event.id, event.imageUrl])



  // Safe date parsing with fallbacks
  let startDate: Date
  let endDate: Date | null = null
  let formattedDate = ''
  
  try {
    startDate = new Date(event.startDate)
    if (isNaN(startDate.getTime())) {
      startDate = new Date()
    }
    
    if (event.endDate) {
      endDate = new Date(event.endDate)
      if (isNaN(endDate.getTime())) {
        endDate = null
      }
    }
    
    // Format date range safely
    if (endDate && startDate.getTime() !== endDate.getTime()) {
      if (startDate.getMonth() === endDate.getMonth()) {
        formattedDate = `${format(startDate, 'd', { locale: tr })} - ${format(endDate, 'd MMM', { locale: tr })}`
      } else {
        formattedDate = `${format(startDate, 'd MMM', { locale: tr })} - ${format(endDate, 'd MMM', { locale: tr })}`
      }
    } else {
      formattedDate = format(startDate, 'd MMM', { locale: tr })
    }
  } catch (error) {
    formattedDate = 'Tarih belirtilmemiş'
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer select-none" 
      onClick={onEventClick}
    >
      <div className="flex">
        <div className="relative w-28 sm:w-32 h-28 sm:h-28 flex-shrink-0 p-1.5">
          {event.imageUrl && !imageError && cachedImageSrc ? (
            <img
              key={`cached-${event.id}`}
              src={cachedImageSrc}
              alt={event.title}
              className="w-full h-full object-cover rounded-lg"
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center text-white text-xl rounded-lg"
              style={{ backgroundColor: category?.color || '#C41E3A' }}
            >
              🎭
            </div>
          )}
          
          {event.isFeatured && (
            <div className="absolute top-3 left-3">
              <div className="bg-yellow-400 text-black px-1 py-0.5 rounded text-xs font-bold">
                ⭐
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 p-3 flex flex-col justify-between min-h-[112px] sm:min-h-[96px]">
          <div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight">
                {translateText(event.title, true)}
              </h3>
              <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onFavoriteToggle()
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title={t('events.favorite')}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>
              </div>
            </div>

            <div className="flex items-center text-xs text-blue-600 mb-1">
              <Calendar className="w-3 h-3 mr-1" />
              <span className="text-sm">{formattedDate}</span>
              {event.startTime && (
                <>
                  <span className="mx-1 text-xs">•</span>
                  <span className="text-xs">{event.startTime.slice(0, 5)}</span>
                </>
              )}
            </div>

            {/* Rating display */}
            {event.rating && event.rating > 0 && (
              <div className="flex items-center text-xs text-amber-600 mb-1">
                <Star className="w-3 h-3 mr-1 fill-amber-400 text-amber-400" />
                <span className="font-medium text-sm">{event.rating.toFixed(1)}</span>
                {event.reviewCount && event.reviewCount > 0 && (
                  <span className="text-gray-500 ml-1 text-xs">({event.reviewCount})</span>
                )}
              </div>
            )}

            <div className="flex items-center text-xs text-gray-600 mb-1">
              <MapPin className="w-3 h-3 mr-1" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (event.websiteUrl) {
                    window.open(event.websiteUrl, '_blank')
                  }
                }}
                className="text-xs text-gray-600 hover:text-blue-600 transition-colors line-clamp-1 text-left"
              >
                {translateText(event.location, true)}
              </button>
            </div>


          </div>

          {/* External link button */}
          {event.websiteUrl && (
            <div className="flex justify-end pt-1">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(event.websiteUrl, '_blank')
                }}
                className="text-blue-600 hover:text-blue-800 transition-colors"
                title="Dış bağlantıya git"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
})

export default EventCard