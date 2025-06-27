'use client'

import { Calendar, MapPin, Heart, ExternalLink, Star } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useLanguage } from '@/contexts/LanguageContext'
import { memo, useState, useCallback, useEffect } from 'react'
import { imageCache } from '@/utils/imageCache'

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

const EventCard = memo(function EventCard({ event, category, isFavorite, onFavoriteToggle, onEventClick }: EventCardProps) {
  const { t, translateText } = useLanguage()
  const [imageError, setImageError] = useState(false)
  
  const handleImageError = useCallback(() => {
    setImageError(true)
  }, [])

  // Image preloading with proper loading state
  useEffect(() => {
    if (event.imageUrl && !imageError) {
      const src = event.imageUrl.startsWith('/uploads/') 
        ? `/api/serve-image/${event.imageUrl.replace('/uploads/', '')}`
        : event.imageUrl
      
      if (imageCache.isImageCached(src)) {
        // Image already cached, no need for loading state
        return
      }
      
      imageCache.preloadImage(src).catch(() => setImageError(true))
    }
  }, [event.imageUrl, imageError])
  
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
    if (!endDate || startDate.toDateString() === endDate.toDateString()) {
      formattedDate = format(startDate, 'dd MMM', { locale: tr })
    } else {
      const startFormatted = format(startDate, 'dd MMM', { locale: tr })
      const endFormatted = format(endDate, 'dd MMM', { locale: tr })
      formattedDate = `${startFormatted} - ${endFormatted}`
    }
  } catch (error) {
    formattedDate = 'Tarih belirtilmemiş'
  }

  return (
    <div 
      className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow cursor-pointer" 
      onClick={onEventClick}
    >
      <div className="flex">
                <div className="relative w-28 sm:w-32 h-20 sm:h-24 flex-shrink-0 p-1.5">
          {event.imageUrl && !imageError ? (
            <img
              key={`img-${event.id}-${event.imageUrl}`}
              src={event.imageUrl.startsWith('/uploads/') 
                ? `/api/serve-image/${event.imageUrl.replace('/uploads/', '')}`
                : event.imageUrl
              }
              alt={event.title}
              className="w-full h-full object-cover rounded-lg bg-gray-100"
              loading="eager"
              decoding="async"
              style={{ 
                imageRendering: 'auto',
                display: 'block',
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
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

        <div className="flex-1 p-3 flex flex-col justify-between min-h-[96px]">
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
                  const address = event.address || event.location
                  const encodedAddress = encodeURIComponent(`${address}, Edirne`)
                  
                  // Check if on mobile and prefer native maps app
                  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                  
                  if (isMobile) {
                    // Try to open native maps app first
                    window.location.href = `geo:0,0?q=${encodedAddress}`
                    // Fallback to Google Maps after a short delay
                    setTimeout(() => {
                      window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
                    }, 1000)
                  } else {
                    window.open(`https://maps.google.com/maps?q=${encodedAddress}`, '_blank')
                  }
                }}
                className="line-clamp-1 hover:text-blue-600 hover:underline transition-colors text-left"
                title="GPS ile yönlendir"
              >
                {event.location}
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}, (prevProps, nextProps) => {
  // Allow re-render only for essential changes
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.event.imageUrl === nextProps.event.imageUrl &&
    prevProps.isFavorite === nextProps.isFavorite
  )
})

export default EventCard
