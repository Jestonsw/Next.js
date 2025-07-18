'use client'

import React, { useState, useEffect } from 'react'
import { X, MapPin, Upload } from 'lucide-react'
import dynamic from 'next/dynamic'

// Lazy load InteractiveMap for better performance
const InteractiveMap = dynamic(() => import('./InteractiveMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">Harita yükleniyor...</div>
})

interface VenueCategory {
  id: number
  name: string
  displayName: string
  color: string
  icon: string
  description?: string
  isActive: boolean
  sortOrder?: number
}

interface VenueSubmissionModalProps {
  onClose: () => void
  venueCategories?: VenueCategory[]
}

export default function VenueSubmissionModal({ onClose, venueCategories = [] }: VenueSubmissionModalProps) {
  const [localVenueCategories, setLocalVenueCategories] = useState<VenueCategory[]>([])
  
  // Load venue categories when modal opens
  useEffect(() => {
    console.log('🚀 VenueSubmissionModal mounted!')
    console.log('📋 Received venueCategories prop:', venueCategories?.length || 0)
    
    const loadVenueCategories = async () => {
      try {
        console.log('📋 Loading venue categories for modal...')
        const response = await fetch('/api/venue-categories')
        const data = await response.json()
        console.log('📋 API response:', data)
        console.log('📋 Venue categories loaded:', data.categories?.length || 0)
        if (data.categories && Array.isArray(data.categories)) {
          setLocalVenueCategories(data.categories)
          console.log('✅ Local venue categories set:', data.categories.length)
        }
      } catch (error) {
        console.error('❌ Error loading venue categories:', error)
      }
    }
    
    loadVenueCategories()
  }, [])

  // Use local categories if available, fallback to props
  const safeVenueCategories = localVenueCategories.length > 0 
    ? localVenueCategories.filter(cat => cat && cat.id && cat.displayName)
    : Array.isArray(venueCategories) 
      ? venueCategories.filter(cat => cat && cat.id && cat.displayName)
      : []

  const [venueSubmission, setVenueSubmission] = useState({
    name: '', description: '', categoryId: '', address: '', phone: '', phone2: '', email: '',
    website: '', capacity: '', amenities: '', latitude: '', longitude: '',
    openingHours: '', submitterName: '', submitterEmail: '', submitterPhone: '',
    imageUrl: '', imageUrl2: '', imageUrl3: ''
  })

  const [uploadingImage1, setUploadingImage1] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [uploadingImage3, setUploadingImage3] = useState(false)

  // Phone formatting function
  const formatPhoneDisplay = (digits: string) => {
    const paddedDigits = digits.padEnd(10, '_')
    return `${paddedDigits.slice(0, 4)} ${paddedDigits.slice(4, 7)} ${paddedDigits.slice(7, 9)} ${paddedDigits.slice(9, 11)}`
  }

  // Handle phone change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, '')
    
    if (digitsOnly.length <= 10) {
      const formattedPhone = digitsOnly.length > 0 ? `0${digitsOnly}` : ''
      const displayValue = formatPhoneDisplay(formattedPhone.slice(1))
      
      setVenueSubmission({...venueSubmission, [field]: displayValue})
    }
  }

  // Handle image upload
  const handleImageUpload = async (file: File, imageIndex: number) => {
    if (!file) return

    const setUploading = imageIndex === 1 ? setUploadingImage1 : 
                        imageIndex === 2 ? setUploadingImage2 : setUploadingImage3

    try {
      setUploading(true)
      const uploadFormData = new FormData()
      uploadFormData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (response.ok) {
        const data = await response.json()
        const imageField = imageIndex === 1 ? 'imageUrl' : 
                          imageIndex === 2 ? 'imageUrl2' : 'imageUrl3'
        
        setVenueSubmission({...venueSubmission, [imageField]: data.imageUrl})
        console.log(`Image ${imageIndex} uploaded:`, data.imageUrl)
      } else {
        alert('Resim yükleme başarısız')
      }
    } catch (error) {
      alert('Resim yükleme sırasında hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  // Handle form submission
  const handleSubmitVenue = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('🏢 Submitting venue:', venueSubmission)

    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueSubmission),
      })

      console.log('🏢 API Response status:', response.status)

      if (response.ok) {
        // Modal'ı hemen kapat
        onClose()
        
        // Sonra alert göster
        alert('Mekan öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacak.')
        
        // Form'u temizle (modal kapalı olduğu için kullanıcı görmeyecek)
        const emptyForm = {
          name: '', description: '', categoryId: '', address: '', phone: '', phone2: '', email: '',
          website: '', capacity: '', amenities: '', latitude: '', longitude: '',
          openingHours: '', submitterName: '', submitterEmail: '', submitterPhone: '',
          imageUrl: '', imageUrl2: '', imageUrl3: ''
        }
        setVenueSubmission(emptyForm)
      } else {
        const error = await response.json()
        console.log('🏢 API Error:', error)
        alert('Hata: ' + (error.error || 'Gönderim başarısız'))
      }
    } catch (error) {
      console.error('🏢 Venue submission error:', error)
      alert('Gönderim sırasında hata oluştu')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Mekan Öner</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="text-center space-y-2 mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <MapPin className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-xl font-semibold text-gray-800">Mekan Önerinizi Gönderin</h4>
            <p className="text-gray-600">
              Edirne'de yeni keşfettiğiniz harika mekanları diğer kullanıcılarla paylaşın.
            </p>
          </div>

          <form onSubmit={handleSubmitVenue} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mekan Adı *
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.name}
                  onChange={(e) => setVenueSubmission({...venueSubmission, name: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Mekan adını girin"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori *
                </label>
                <select 
                  value={venueSubmission.categoryId}
                  onChange={(e) => setVenueSubmission({...venueSubmission, categoryId: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Kategori seçin</option>
                  {safeVenueCategories.length > 0 ? (
                    safeVenueCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))
                  ) : (
                    <option disabled>Kategoriler yükleniyor...</option>
                  )}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama *
                </label>
                <textarea 
                  value={venueSubmission.description}
                  onChange={(e) => setVenueSubmission({...venueSubmission, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-24"
                  placeholder="Mekan hakkında detaylı bilgi verin"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.address}
                  onChange={(e) => setVenueSubmission({...venueSubmission, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Mekan adresi"
                  required
                />
              </div>

              {/* Harita Bölümü */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konumu Harita Üzerinde Seçin
                </label>
                <div className="border border-gray-300 rounded-lg p-2">
                  <InteractiveMap
                    latitude={venueSubmission.latitude ? parseFloat(venueSubmission.latitude) : 41.6772}
                    longitude={venueSubmission.longitude ? parseFloat(venueSubmission.longitude) : 26.5598}
                    onLocationSelect={(lat: number, lng: number) => {
                      setVenueSubmission({
                        ...venueSubmission,
                        latitude: lat.toString(),
                        longitude: lng.toString()
                      })
                    }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-600">Enlem (Latitude)</label>
                    <input
                      type="text"
                      value={venueSubmission.latitude}
                      onChange={(e) => setVenueSubmission({...venueSubmission, latitude: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="41.6772"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600">Boylam (Longitude)</label>
                    <input
                      type="text"
                      value={venueSubmission.longitude}
                      onChange={(e) => setVenueSubmission({...venueSubmission, longitude: e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="26.5598"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input 
                  type="search" 
                  value={venueSubmission.phone}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    if (digits.length <= 11) {
                      setVenueSubmission({...venueSubmission, phone: digits})
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0XXX XXX XX XX"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  autoCorrect="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkinci Telefon
                </label>
                <input 
                  type="search" 
                  value={venueSubmission.phone2 || ''}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '')
                    if (digits.length <= 11) {
                      setVenueSubmission({...venueSubmission, phone2: digits})
                    }
                  }}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0XXX XXX XX XX"
                  autoComplete="new-password"
                  autoCapitalize="off"
                  spellCheck={false}
                  data-form-type="other"
                  data-lpignore="true"
                  autoCorrect="off"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-posta
                </label>
                <input 
                  type="email" 
                  value={venueSubmission.email}
                  onChange={(e) => setVenueSubmission({...venueSubmission, email: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Web Sitesi
                </label>
                <input 
                  type="url" 
                  value={venueSubmission.website}
                  onChange={(e) => setVenueSubmission({...venueSubmission, website: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://www.ornek.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input 
                  type="number" 
                  value={venueSubmission.capacity}
                  onChange={(e) => setVenueSubmission({...venueSubmission, capacity: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Kişi kapasitesi"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Olanaklar
                </label>
                <textarea 
                  value={venueSubmission.amenities}
                  onChange={(e) => setVenueSubmission({...venueSubmission, amenities: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20"
                  placeholder="Otopark, WiFi, Klima vb."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Saatleri
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.openingHours}
                  onChange={(e) => setVenueSubmission({...venueSubmission, openingHours: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Örn: Pazartesi-Cuma 09:00-18:00"
                />
              </div>
            </div>

            {/* Resim Yükleme Bölümü */}
            <div className="border-t pt-6">
              <h5 className="text-lg font-medium mb-4">Mekan Resimleri</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Resim 1 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resim 1
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {venueSubmission.imageUrl ? (
                      <div className="relative">
                        <img 
                          src={venueSubmission.imageUrl} 
                          alt="Venue preview 1" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setVenueSubmission({...venueSubmission, imageUrl: ''})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 1)
                          }}
                          className="w-full text-sm text-gray-500"
                          disabled={uploadingImage1}
                        />
                        {uploadingImage1 && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resim 2 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resim 2
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {venueSubmission.imageUrl2 ? (
                      <div className="relative">
                        <img 
                          src={venueSubmission.imageUrl2} 
                          alt="Venue preview 2" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setVenueSubmission({...venueSubmission, imageUrl2: ''})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 2)
                          }}
                          className="w-full text-sm text-gray-500"
                          disabled={uploadingImage2}
                        />
                        {uploadingImage2 && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resim 3 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resim 3
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                    {venueSubmission.imageUrl3 ? (
                      <div className="relative">
                        <img 
                          src={venueSubmission.imageUrl3} 
                          alt="Venue preview 3" 
                          className="w-full h-32 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => setVenueSubmission({...venueSubmission, imageUrl3: ''})}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(file, 3)
                          }}
                          className="w-full text-sm text-gray-500"
                          disabled={uploadingImage3}
                        />
                        {uploadingImage3 && <p className="text-sm text-blue-600 mt-1">Yükleniyor...</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h5 className="text-lg font-medium mb-4">İletişim Bilgileriniz</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adınız Soyadınız *
                  </label>
                  <input 
                    type="text" 
                    value={venueSubmission.submitterName}
                    onChange={(e) => setVenueSubmission({...venueSubmission, submitterName: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="Ad Soyad"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta Adresiniz *
                  </label>
                  <input 
                    type="email" 
                    value={venueSubmission.submitterEmail}
                    onChange={(e) => setVenueSubmission({...venueSubmission, submitterEmail: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="E-mail adresinizi girin"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon Numaranız *
                  </label>
                  <input 
                    type="search" 
                    value={venueSubmission.submitterPhone}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '')
                      if (digits.length <= 11) {
                        setVenueSubmission({...venueSubmission, submitterPhone: digits})
                      }
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0XXX XXX XX XX"
                    autoComplete="new-password"
                    autoCapitalize="off"
                    spellCheck={false}
                    data-form-type="other"
                    data-lpignore="true"
                    autoCorrect="off"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Uyarı Mesajı */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start space-x-3">
              <div className="text-yellow-600 text-lg">⚠️</div>
              <div>
                <p className="text-sm font-medium text-yellow-800">Önemli:</p>
                <p className="text-sm text-yellow-700">
                  Gönderdiğiniz mekan önerisi admin tarafından incelendikten sonra yayınlanacaktır.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                İptal
              </button>
              <button 
                type="submit"
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
              >
                Gönder
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}