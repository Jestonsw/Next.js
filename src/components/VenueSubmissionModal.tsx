'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Upload } from 'lucide-react'

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
  console.log('🏢 VenueSubmissionModal rendered with:', {
    venueCategories: venueCategories,
    isArray: Array.isArray(venueCategories),
    length: venueCategories?.length || 0,
    firstCategory: venueCategories?.[0]?.displayName || 'none'
  })
  
  // Ensure venueCategories is always a valid array
  const safeVenueCategories = Array.isArray(venueCategories) 
    ? venueCategories.filter(cat => cat && cat.id && cat.displayName)
    : []
    
  console.log('✅ Safe venue categories:', safeVenueCategories.length, 'filtered items')
  
  // Show loading if no categories
  if (safeVenueCategories.length === 0) {
    console.log('⏳ No categories - showing loading state')
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-8 text-center max-w-sm w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 mb-4">Kategoriler yükleniyor...</p>
          <div className="text-xs text-gray-400 mb-4">
            Debug: {venueCategories?.length || 0} categories received
          </div>
          <button 
            onClick={onClose}
            className="mt-4 px-4 py-2 text-gray-500 hover:text-gray-700 border rounded"
          >
            İptal
          </button>
        </div>
      </div>
    )
  }
  
  // Phone number formatting function
  const formatPhoneDisplay = (digits: string) => {
    const paddedDigits = digits.padEnd(10, '_')
    
    return `${paddedDigits.slice(0, 4)} ${paddedDigits.slice(4, 7)} ${paddedDigits.slice(7, 9)} ${paddedDigits.slice(9, 11)}`
  }

  const [venueSubmission, setVenueSubmission] = useState({
    name: '', description: '', categoryId: '', address: '', phone: '', email: '',
    website: '', capacity: '', amenities: '', latitude: '', longitude: '',
    openingHours: '', submitterName: '', submitterEmail: '', submitterPhone: '',
    imageUrl: '', imageUrl2: '', imageUrl3: ''
  })

  const [uploadingImage1, setUploadingImage1] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [uploadingImage3, setUploadingImage3] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('venueSubmissionData')
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        setVenueSubmission(parsedData)
      } catch (error) {
        console.error('Error parsing saved venue data:', error)
      }
    }
  }, [])

  // Save to localStorage whenever form data changes
  useEffect(() => {
    localStorage.setItem('venueSubmissionData', JSON.stringify(venueSubmission))
  }, [venueSubmission])

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const value = e.target.value
    const digitsOnly = value.replace(/\D/g, '')
    
    if (digitsOnly.length <= 10) {
      const formattedPhone = digitsOnly.length > 0 ? `0${digitsOnly}` : ''
      const displayValue = formatPhoneDisplay(formattedPhone.slice(1))
      
      setVenueSubmission(prev => ({...prev, [field]: formattedPhone}))
      
      e.target.value = displayValue
    }
  }

  const handleImageUpload = async (file: File, imageIndex: number) => {
    if (!file) return

    const setUploading = imageIndex === 1 ? setUploadingImage1 : 
                        imageIndex === 2 ? setUploadingImage2 : setUploadingImage3

    try {
      setUploading(true)
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })
      
      if (response.ok) {
        const data = await response.json()
        const imageField = imageIndex === 1 ? 'imageUrl' : 
                          imageIndex === 2 ? 'imageUrl2' : 'imageUrl3'
        
        setVenueSubmission(prev => ({
          ...prev,
          [imageField]: data.imageUrl
        }))
        
        alert(`Görsel ${imageIndex} başarıyla yüklendi`)
      } else {
        alert('Görsel yükleme başarısız')
      }
    } catch (error) {
      alert('Görsel yükleme sırasında hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmitVenue = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(venueSubmission),
      })

      if (response.ok) {
        alert('Mekan öneriniz başarıyla gönderildi! Admin onayından sonra yayınlanacak.')
        
        const emptyForm = {
          name: '', description: '', categoryId: '', address: '', phone: '', email: '',
          website: '', capacity: '', amenities: '', latitude: '', longitude: '',
          openingHours: '', submitterName: '', submitterEmail: '', submitterPhone: '',
          imageUrl: '', imageUrl2: '', imageUrl3: ''
        }
        setVenueSubmission(emptyForm)
        localStorage.removeItem('venueSubmissionData')
        onClose()
      } else {
        const error = await response.json()
        alert('Hata: ' + (error.error || 'Gönderim başarısız'))
      }
    } catch (error) {
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
            <h4 className="text-lg font-medium">Yeni Mekan Önerisi</h4>
            <p className="text-gray-600">Mekanınızın bilgilerini paylaşın</p>
          </div>

          <form onSubmit={handleSubmitVenue} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
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
                  Adres *
                </label>
                <input 
                  type="text" 
                  value={venueSubmission.address}
                  onChange={(e) => setVenueSubmission({...venueSubmission, address: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="Tam adres bilgisi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input 
                  type="text" 
                  onChange={(e) => handlePhoneChange(e, 'phone')}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="0530 348 06 69"
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
                  placeholder="info@mekan.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Web Sitesi
                </label>
                <input 
                  type="url" 
                  value={venueSubmission.website}
                  onChange={(e) => setVenueSubmission({...venueSubmission, website: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  placeholder="https://www.mekan.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açılış Saatleri
                </label>
                <textarea 
                  value={venueSubmission.openingHours}
                  onChange={(e) => setVenueSubmission({...venueSubmission, openingHours: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20"
                  placeholder="Pazartesi-Cuma: 09:00-18:00, Hafta sonu: 10:00-16:00"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Özellikler/Imkanlar
                </label>
                <textarea 
                  value={venueSubmission.amenities}
                  onChange={(e) => setVenueSubmission({...venueSubmission, amenities: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg h-20"
                  placeholder="WiFi, Klima, Otopark, Engelli Erişimi, vs."
                />
              </div>
            </div>

            <div className="border-t pt-6">
              <h5 className="text-lg font-medium mb-4">Görseller</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((imageIndex) => {
                  const imageUrl = imageIndex === 1 ? venueSubmission.imageUrl : 
                                  imageIndex === 2 ? venueSubmission.imageUrl2 : venueSubmission.imageUrl3
                  const isUploading = imageIndex === 1 ? uploadingImage1 : 
                                    imageIndex === 2 ? uploadingImage2 : uploadingImage3
                  
                  return (
                    <div key={imageIndex}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Görsel {imageIndex} {imageIndex === 1 ? '(Ana görsel)' : '(İsteğe bağlı)'}
                      </label>
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                          <div className="flex flex-col items-center justify-center pt-3 pb-3">
                            {isUploading ? (
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-1 text-xs text-gray-500">Yükleniyor...</p>
                              </div>
                            ) : imageUrl ? (
                              <div className="text-center">
                                <div className="w-16 h-10 bg-gray-200 rounded shadow-sm mx-auto mb-1 overflow-hidden">
                                  <img src={`/uploads/${imageUrl}`} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <p className="text-xs text-green-600">Görsel yüklendi</p>
                              </div>
                            ) : (
                              <div className="text-center">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <p className="mt-1 text-xs text-gray-500">Görsel seçin</p>
                              </div>
                            )}
                          </div>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, imageIndex)
                            }}
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
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
                    type="text" 
                    onChange={(e) => handlePhoneChange(e, 'submitterPhone')}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    placeholder="0530 348 06 69"
                    required
                  />
                </div>
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