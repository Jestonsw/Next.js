'use client'

import { MapPin, Star, Clock, Phone, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { memo } from 'react'

interface VenueCardProps {
  venue: {
    id: number
    name: string
    description: string | null
    address: string
    phone: string | null
    phone2: string | null
    rating: number | null
    openingHours: string | null
    imageUrl: string | null
    imageUrl2: string | null
    imageUrl3: string | null
    isFeatured: boolean | null
    amenities: string | null
    venues?: {
      categoryName?: string | null
      categoryDisplayName?: string | null
      categoryColor?: string | null
    }
    venue_categories?: {
      name?: string | null
      displayName?: string | null
      color?: string | null
    }
  }
  onClick: () => void
}

const VenueCard = memo(function VenueCard({ venue, onClick }: VenueCardProps) {
  const categoryData = venue.venues || venue.venue_categories
  
  // Extract category information safely
  const categoryName = (categoryData as any)?.categoryDisplayName || 
                      (categoryData as any)?.displayName || 
                      (categoryData as any)?.categoryName || 
                      (categoryData as any)?.name || 'Mekan'
  
  const categoryColor = (categoryData as any)?.categoryColor || 
                       (categoryData as any)?.color || '#6B7280'

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-3 h-3">
          <Star className="w-3 h-3 text-gray-300 absolute" />
          <div className="overflow-hidden w-1.5">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      )
    }

    const remainingStars = 5 - Math.ceil(rating)
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />)
    }

    return stars
  }

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden group"
    >
      {/* Featured Badge */}
      {venue.isFeatured && (
        <div className="absolute top-3 left-3 z-10">
          <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
            ⭐ Öne Çıkan
          </span>
        </div>
      )}

      {/* Image Gallery */}
      <div className="relative h-48 overflow-hidden">
        {venue.imageUrl || venue.imageUrl2 || venue.imageUrl3 ? (
          <div className="flex h-full">
            {/* Main image */}
            {venue.imageUrl && (
              <div className="relative flex-1">
                <Image
                  src={venue.imageUrl}
                  alt={venue.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            )}
            
            {/* Side images */}
            {(venue.imageUrl2 || venue.imageUrl3) && (
              <div className="flex flex-col w-1/3 gap-1">
                {venue.imageUrl2 && (
                  <div className="relative flex-1">
                    <Image
                      src={venue.imageUrl2}
                      alt={`${venue.name} - 2`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  </div>
                )}
                {venue.imageUrl3 && (
                  <div className="relative flex-1">
                    <Image
                      src={venue.imageUrl3}
                      alt={`${venue.name} - 3`}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <span 
            className="text-white text-xs font-medium px-2 py-1 rounded-full shadow-md"
            style={{ backgroundColor: categoryColor }}
          >
            {categoryName}
          </span>
        </div>
      </div>
            {/* Content */}
      <div className="p-4">
        {/* Title and Rating */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1 flex-1 mr-2">
            {venue.name}
          </h3>
          {venue.rating && venue.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <div className="flex items-center">
                {renderStars(venue.rating)}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {venue.rating.toFixed(1)}
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        {venue.description && (
          <p className="text-gray-600 text-sm line-clamp-2 mb-3">
            {venue.description}
          </p>
        )}

        {/* Address */}
        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
          <span className="text-gray-600 text-sm line-clamp-1">
            {venue.address}
          </span>
        </div>

        {/* Info Row */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            {/* Opening Hours */}
            {venue.openingHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span className="truncate">{venue.openingHours}</span>
              </div>
            )}
            
            {/* Phone Numbers */}
            {(venue.phone || venue.phone2) && (
              <div className="flex items-center gap-1">
                <Phone className="w-4 h-4" />
                <div className="flex flex-col">
                  {venue.phone && <span>{venue.phone}</span>}
                  {venue.phone2 && <span className="text-xs">{venue.phone2}</span>}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
})

export default VenueCard
