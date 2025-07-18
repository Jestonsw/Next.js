'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Edit, Trash2, Save, X, Upload, Users, ArrowUp, ArrowDown, MapPin } from 'lucide-react'
import InteractiveMap from '@/components/InteractiveMap'
import FeedbackTab from '@/components/FeedbackTab'
import AdminAnalytics from '@/components/AdminAnalytics'

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
  latitude?: number
  longitude?: number
  organizerName?: string
  organizerContact?: string
  categoryId: number
  capacity?: number
  imageUrl?: string
  imageUrl2?: string
  imageUrl3?: string
  websiteUrl?: string
  ticketUrl?: string
  tags?: string | string[]
  participantType: string
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
  sortOrder?: number
}

interface User {
  id: number
  name: string
  email: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  city: string
  district?: string
  interests?: string
  isActive: boolean
  emailVerified: boolean
  profileImageUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

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

interface Feedback {
  id: number
  type: string
  email?: string
  message: string
  isRead: boolean
  createdAt: string
}

interface Announcement {
  id: number
  title: string
  message: string
  imageUrl?: string
  buttonText?: string
  buttonUrl?: string
  isActive: boolean
  showOnce: boolean
  startDate?: string
  endDate?: string
  createdAt: string
  updatedAt: string
}

interface Venue {
  id: number
  name: string
  description?: string
  categoryId: number
  address: string
  phone?: string
  phone2?: string
  email?: string
  website?: string
  capacity?: number
  amenities?: string
  imageUrl?: string
  imageUrl2?: string
  imageUrl3?: string
  latitude?: number
  longitude?: number
  openingHours?: string
  rating: number
  isActive: boolean
  isFeatured: boolean
}

export default function AdminPanel() {
  const [events, setEvents] = useState<Event[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueCategories, setVenueCategories] = useState<VenueCategory[]>([])
  const [pendingEvents, setPendingEvents] = useState<Event[]>([])
  const [pendingVenues, setPendingVenues] = useState<Venue[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false)
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [showVenueForm, setShowVenueForm] = useState(false)
  const [showVenueCategoryForm, setShowVenueCategoryForm] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [editingVenueCategory, setEditingVenueCategory] = useState<VenueCategory | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [authError, setAuthError] = useState('')
  const [authStep, setAuthStep] = useState<'password' | 'verification'>('password')
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [activeTab, setActiveTab] = useState<'events' | 'categories' | 'venues' | 'venue-categories' | 'users' | 'pending-approvals' | 'feedback' | 'announcements' | 'analytics'>('events')
  const [reviewingItem, setReviewingItem] = useState<Event | Venue | null>(null)
  const [reviewType, setReviewType] = useState<'event' | 'venue'>('event')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    address: '',
    latitude: '',
    longitude: '',
    organizerName: '',
    organizerContact: '',
    categoryIds: [] as number[],
    capacity: '',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    websiteUrl: '',
    ticketUrl: '',
    tags: '',
    participantType: 'Herkes',
    isActive: true,
    isFeatured: false
  })
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingImage2, setUploadingImage2] = useState(false)
  const [uploadingImage3, setUploadingImage3] = useState(false)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    displayName: '',
    color: '#3B82F6',
    icon: 'calendar'
  })

  const [venueFormData, setVenueFormData] = useState({
    name: '',
    description: '',
    categoryId: 1,
    address: '',
    phone: '',
    phone2: '',
    email: '',
    website: '',
    capacity: '',
    amenities: '',
    imageUrl: '',
    imageUrl2: '',
    imageUrl3: '',
    latitude: '',
    longitude: '',
    openingHours: '',
    rating: 4.0,
    isActive: true,
    isFeatured: false
  })

  const [uploadingVenueImage, setUploadingVenueImage] = useState(false)
  const [uploadingVenueImage2, setUploadingVenueImage2] = useState(false)
  const [uploadingVenueImage3, setUploadingVenueImage3] = useState(false)

  const [venueCategoryFormData, setVenueCategoryFormData] = useState({
    name: '',
    displayName: '',
    color: '#3B82F6',
    icon: 'building',
    description: '',
    isActive: true
  })

  const [announcementFormData, setAnnouncementFormData] = useState({
    title: '',
    message: '',
    imageUrl: '',
    imageAspectRatio: 'square',
    buttonText: '',
    buttonUrl: '',
    isActive: true,
    showOnce: false,
    startDate: '',
    endDate: ''
  })
  const [uploadingAnnouncementImage, setUploadingAnnouncementImage] = useState(false)

  // Function to auto-deactivate expired events
  const autoDeactivateExpiredEvents = async () => {
    try {
      const now = new Date()
      let deactivatedCount = 0
      
      // Check each event for expiration
      for (const event of events) {
        let isExpired = false
        
        if (event.endDate) {
          // If event has end date, check if it has passed
          const endDateTime = new Date(event.endDate)
          if (event.endTime) {
            const [hours, minutes] = event.endTime.split(':')
            endDateTime.setHours(parseInt(hours), parseInt(minutes))
          }
          isExpired = endDateTime < now
        } else {
          // If no end date, check if start date was more than 1 day ago
          const startDateTime = new Date(event.startDate)
          if (event.startTime) {
            const [hours, minutes] = event.startTime.split(':')
            startDateTime.setHours(parseInt(hours), parseInt(minutes))
          }
          const oneDayLater = new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000)
          isExpired = oneDayLater < now
        }
        
        // Deactivate if expired and currently active
        if (isExpired && event.isActive) {
          const response = await fetch(`/api/events?id=${event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isActive: false })
          })
          
          if (response.ok) {
            deactivatedCount++
          }
        }
      }
      
      if (deactivatedCount > 0) {

      }
    } catch (error) {

    }
  }

  // Function to manually check and deactivate expired events
  const handleExpiredEventsCheck = async () => {
    try {
      const response = await fetch('/api/admin/expired-events', {
        method: 'POST'
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`${result.deactivatedCount} süresi dolan etkinlik pasif hale getirildi.`)
        loadData() // Refresh the data
      } else {
        alert('Süresi dolan etkinlikler kontrol edilirken hata oluştu.')
      }
    } catch (error) {
      alert('Süresi dolan etkinlikler kontrol edilirken hata oluştu.')
    }
  }

  useEffect(() => {
    // Check if already authenticated in session
    const authStatus = sessionStorage.getItem('admin_authenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      loadData()
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadData = async () => {
    try {
      // Auto-deactivate expired events before loading data
      await autoDeactivateExpiredEvents()
      
      const [eventsRes, categoriesRes, venuesRes, venueCategoriesRes, usersRes, pendingEventsRes, pendingVenuesRes, feedbackRes, announcementsRes] = await Promise.all([
        fetch('/api/events?admin=true'),
        fetch('/api/categories'),
        fetch('/api/admin/venues'),
        fetch('/api/venue-categories'),
        fetch('/api/admin/users'),
        fetch('/api/admin/pending-events'),
        fetch('/api/admin/pending-venues'),
        fetch('/api/feedback'),
        fetch('/api/announcements')
      ])
      
      if (eventsRes.ok && categoriesRes.ok) {
        setEvents(await eventsRes.json())
        setCategories(await categoriesRes.json())
      }

      if (venuesRes.ok) {
        setVenues(await venuesRes.json())
      }

      if (venueCategoriesRes.ok) {
        const venueCategoriesData = await venueCategoriesRes.json()
        // Venue categories loaded successfully
        // Handle different response formats
        const categories = venueCategoriesData.categories || venueCategoriesData || []
        setVenueCategories(Array.isArray(categories) ? categories : [])
      }

      if (usersRes.ok) {
        setUsers(await usersRes.json())
      }

      if (pendingEventsRes.ok) {
        setPendingEvents(await pendingEventsRes.json())
      }

      if (pendingVenuesRes.ok) {
        setPendingVenues(await pendingVenuesRes.json())
      }

      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json()

        setFeedback(feedbackData)
      } else {

      }

      if (announcementsRes.ok) {
        setAnnouncements(await announcementsRes.json())
      }
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingEvent ? 'PUT' : 'POST'
      const url = editingEvent ? `/api/events?id=${editingEvent.id}` : '/api/events'
      
      // Validate 1-3 categories
      if (formData.categoryIds.length < 1 || formData.categoryIds.length > 3) {
        alert('En az 1, en fazla 3 kategori seçmelisiniz.')
        return
      }

      const requestData = {
        ...formData,
        categoryIds: formData.categoryIds,
        capacity: formData.capacity ? Number(formData.capacity) : null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : null,
        // Admin tarafından oluşturulan etkinlikler için gerekli alanlar
        submitterName: 'Admin',
        submitterEmail: 'edirne.events@gmail.com',
        submitterPhone: ''
      }
      
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })

      if (response.ok) {
        await loadData()
        resetForm()
      } else {
        const errorData = await response.json()
        alert('Kaydetme başarısız: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('Kaydetme sırasında hata oluştu: ' + error)
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/events/${id}`, {
          method: 'DELETE'
        })
        
        if (response.ok) {
          await loadData()
          alert('Etkinlik başarıyla silindi!')
        } else {
          const error = await response.json()
          alert('Etkinlik silinemedi: ' + (error.error || 'Bilinmeyen hata'))
        }
      } catch (error) {
        alert('Etkinlik silinirken hata oluştu')
      }
    }
  }

  const handleEdit = async (event: Event) => {
    setEditingEvent(event)
    
    // Fetch categories for this event
    let eventCategoryIds = []
    try {
      const response = await fetch(`/api/events/${event.id}/categories`)
      if (response.ok) {
        const categories = await response.json()
        eventCategoryIds = categories.map((cat: { categoryId: number }) => cat.categoryId)
      }
    } catch (error) {
      // Fallback to single category if junction table lookup fails
      eventCategoryIds = event.categoryId ? [event.categoryId] : []
    }
    
    setFormData({
      title: event.title,
      description: event.description,
      startDate: event.startDate.split('T')[0],
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      startTime: event.startTime,
      endTime: event.endTime || '',
      location: event.location,
      address: event.address || '',
      latitude: event.latitude?.toString() || '',
      longitude: event.longitude?.toString() || '',
      organizerName: event.organizerName || '',
      organizerContact: event.organizerContact || '',
      categoryIds: eventCategoryIds,
      capacity: event.capacity?.toString() || '',
      imageUrl: event.imageUrl || '',
      imageUrl2: event.imageUrl2 || '',
      imageUrl3: event.imageUrl3 || '',
      websiteUrl: event.websiteUrl || '',
      ticketUrl: event.ticketUrl || '',
      tags: Array.isArray(event.tags) ? event.tags.join(', ') : event.tags || '',
      participantType: event.participantType,
      isActive: event.isActive,
      isFeatured: event.isFeatured
    })
    setShowEventForm(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    
    try {
      // Create base64 preview immediately
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target && event.target.result) {
          setFormData(prev => ({ ...prev, imagePreview: event.target!.result as string }))
        }
      }
      reader.readAsDataURL(file)

      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl: data.imageUrl }))
        alert('Resim başarıyla yüklendi!')
      } else {
        const errorData = await response.json()
        alert('Resim yükleme başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('Resim yükleme sırasında hata oluştu: ' + error)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleImageUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage2(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl2: data.imageUrl }))
        alert('İkinci resim başarıyla yüklendi!')
      } else {
        const errorData = await response.json()
        alert('İkinci resim yükleme başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('İkinci resim yükleme sırasında hata oluştu: ' + error)
    } finally {
      setUploadingImage2(false)
    }
  }

  const handleImageUpload3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage3(true)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        setFormData(prev => ({ ...prev, imageUrl3: data.imageUrl }))
        alert('Üçüncü resim başarıyla yüklendi!')
      } else {
        const errorData = await response.json()
        alert('Üçüncü resim yükleme başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('Üçüncü resim yükleme sırasında hata oluştu: ' + error)
    } finally {
      setUploadingImage3(false)
    }
  }

  const handleReviewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Update the reviewing item with the new image URL
        if (imageIndex === 1) {
          setReviewingItem(prev => ({ ...prev, imageUrl: data.imageUrl } as Event))
        } else if (imageIndex === 2) {
          setReviewingItem(prev => ({ ...prev, imageUrl2: data.imageUrl } as Event))
        } else if (imageIndex === 3) {
          setReviewingItem(prev => ({ ...prev, imageUrl3: data.imageUrl } as Event))
        }
        
        alert(`Görsel ${imageIndex} başarıyla yüklendi!`)
      } else {
        const errorData = await response.json()
        alert('Resim yükleme başarısız oldu: ' + (errorData.error || 'Bilinmeyen hata'))
      }
    } catch (error) {
      alert('Resim yükleme sırasında hata oluştu: ' + error)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setAuthError('Email ve şifre gereklidir')
      return
    }
    
    try {
      const response = await fetch('/api/admin/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsCodeSent(true)
        setAuthStep('verification')
        setAuthError('')
        
        if (data.developmentMode && data.verificationCode) {
          alert(`Geliştirme Modu: Doğrulama kodu ${data.verificationCode}`)
        } else {
          alert('Doğrulama kodu email adresinize gönderildi')
        }
      } else {
        setAuthError(data.error || 'Giriş başarısız')
      }
    } catch (error) {
      setAuthError('Bağlantı hatası. Lütfen tekrar deneyin.')
    }
  }

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    
    try {
      const response = await fetch('/api/admin/send-verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: verificationCode })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setIsAuthenticated(true)
        sessionStorage.setItem('admin_authenticated', 'true')
        setAuthError('')
        loadData()
      } else {
        setAuthError(data.error || 'Doğrulama başarısız')
      }
    } catch (error) {
      setAuthError('Doğrulama sırasında hata oluştu')
    } finally {
      setIsVerifying(false)
    }
  }

  const resetAuthForm = () => {
    setAuthStep('password')
    setIsCodeSent(false)
    setPassword('')
    setEmail('')
    setVerificationCode('')
    setAuthError('')
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('admin_authenticated')
    setPassword('')
    setAuthError('')
  }



  // Splash screen functionality removed

  const resetForm = () => {
    setShowEventForm(false)
    setEditingEvent(null)
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: '',
      address: '',
      latitude: '',
      longitude: '',
      organizerName: '',
      organizerContact: '',
      categoryIds: [],
      capacity: '',
      imageUrl: '',
      imageUrl2: '',
      imageUrl3: '',
      websiteUrl: '',
      ticketUrl: '',
      tags: '',
      participantType: 'Herkes',
      isActive: true,
      isFeatured: false
    })
  }

  const resetCategoryForm = () => {
    setShowCategoryForm(false)
    setEditingCategory(null)
    setCategoryFormData({
      name: '',
      displayName: '',
      color: '#3B82F6',
      icon: 'calendar'
    })
  }

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingCategory ? 'PUT' : 'POST'
      const body = editingCategory 
        ? { ...categoryFormData, id: editingCategory.id }
        : categoryFormData

      const response = await fetch('/api/categories', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (response.ok) {
        loadData()
        resetCategoryForm()
        alert(editingCategory ? 'Kategori güncellendi!' : 'Kategori eklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Kategori kaydedilemedi')
      }
    } catch (error) {
      alert('Kategori kaydedilirken hata oluştu')
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      displayName: category.displayName,
      color: category.color,
      icon: category.icon
    })
    setShowCategoryForm(true)
  }

  const handleDeleteCategory = async (id: number) => {
    if (!confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/categories?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
        alert('Kategori silindi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Kategori silinemedi')
      }
    } catch (error) {
      alert('Kategori silinirken hata oluştu')
    }
  }

  // Venue management handlers
  const handleCreateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...venueFormData,
          capacity: venueFormData.capacity ? parseInt(venueFormData.capacity) : null,
          latitude: venueFormData.latitude ? parseFloat(venueFormData.latitude) : null,
          longitude: venueFormData.longitude ? parseFloat(venueFormData.longitude) : null
        })
      })

      if (response.ok) {
        loadData()
        setShowVenueForm(false)
        setVenueFormData({
          name: '',
          description: '',
          categoryId: 1,
          address: '',
          phone: '',
          phone2: '',
          email: '',
          website: '',
          capacity: '',
          amenities: '',
          imageUrl: '',
          imageUrl2: '',
          imageUrl3: '',
          latitude: '',
          longitude: '',
          openingHours: '',
          rating: 4.0,
          isActive: true,
          isFeatured: false
        })
        alert('Mekan başarıyla eklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan eklenemedi')
      }
    } catch (error) {
      alert('Mekan eklenirken hata oluştu')
    }
  }

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue)
    setVenueFormData({
      name: venue.name,
      description: venue.description || '',
      categoryId: venue.categoryId,
      address: venue.address,
      phone: venue.phone || '',
      phone2: '',
      email: venue.email || '',
      website: venue.website || '',
      capacity: venue.capacity ? venue.capacity.toString() : '',
      amenities: venue.amenities || '',
      imageUrl: venue.imageUrl || '',
      imageUrl2: venue.imageUrl2 || '',
      imageUrl3: venue.imageUrl3 || '',
      latitude: venue.latitude ? venue.latitude.toString() : '',
      longitude: venue.longitude ? venue.longitude.toString() : '',
      openingHours: venue.openingHours || '',
      rating: venue.rating,
      isActive: venue.isActive,
      isFeatured: venue.isFeatured
    })
    setShowVenueForm(true)
  }

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingVenue) return

    try {
      const response = await fetch(`/api/venues?id=${editingVenue.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...venueFormData,
          capacity: venueFormData.capacity ? parseInt(venueFormData.capacity) : null,
          latitude: venueFormData.latitude ? parseFloat(venueFormData.latitude) : null,
          longitude: venueFormData.longitude ? parseFloat(venueFormData.longitude) : null
        })
      })

      if (response.ok) {
        loadData()
        setShowVenueForm(false)
        setEditingVenue(null)
        alert('Mekan başarıyla güncellendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan güncellenemedi')
      }
    } catch (error) {
      alert('Mekan güncellenirken hata oluştu')
    }
  }

  const handleEventStatusToggle = async (eventId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/events?id=${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadData()
        alert(`Etkinlik ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`)
      } else {
        alert('Etkinlik durumu güncellenemedi')
      }
    } catch (error) {
      alert('Etkinlik durumu güncellenirken hata oluştu')
    }
  }

  const handleVenueStatusToggle = async (venueId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/venues?id=${venueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadData()
        alert(`Mekan ${!currentStatus ? 'aktif' : 'pasif'} hale getirildi!`)
      } else {
        alert('Mekan durumu güncellenemedi')
      }
    } catch (error) {
      alert('Mekan durumu güncellenirken hata oluştu')
    }
  }

  const handleUserStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          isActive: !currentStatus
        })
      })

      if (response.ok) {
        loadData() // Refresh users list
        alert(!currentStatus ? 'Kullanıcı aktifleştirildi' : 'Kullanıcı pasifleştirildi')
      } else {
        alert('Kullanıcı durumu güncellenirken hata oluştu')
      }
    } catch (error) {
      alert('Kullanıcı durumu güncellenirken hata oluştu')
    }
  }

  const handleUserDelete = async (userId: number, userName: string) => {
    if (confirm(`${userName} kullanıcısını kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
      try {
        const response = await fetch(`/api/admin/users?userId=${userId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          loadData() // Refresh users list
          alert('Kullanıcı başarıyla silindi')
        } else {
          alert('Kullanıcı silinirken hata oluştu')
        }
      } catch (error) {
        alert('Kullanıcı silinirken hata oluştu')
      }
    }
  }

  const handleFeedbackDelete = async (feedbackId: number) => {
    if (confirm('Bu geri bildirimi kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      try {
        const response = await fetch(`/api/feedback?id=${feedbackId}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          loadData() // Refresh feedback list
          alert('Geri bildirim başarıyla silindi')
        } else {
          alert('Geri bildirim silinirken hata oluştu')
        }
      } catch (error) {
        alert('Geri bildirim silinirken hata oluştu')
      }
    }
  }

  const handleDeleteVenue = async (id: number) => {
    if (!confirm('Bu mekanı silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/venues?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
        alert('Mekan silindi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan silinemedi')
      }
    } catch (error) {
      alert('Mekan silinirken hata oluştu')
    }
  }

  const handleVenueImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVenueImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setVenueFormData({ ...venueFormData, imageUrl: data.imageUrl })
        alert('Resim başarıyla yüklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Resim yüklenemedi')
      }
    } catch (error) {
      alert('Resim yüklenirken hata oluştu')
    } finally {
      setUploadingVenueImage(false)
    }
  }

  const handleVenueImageUpload2 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVenueImage2(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setVenueFormData({ ...venueFormData, imageUrl2: data.imageUrl })
        alert('İkinci resim başarıyla yüklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'İkinci resim yüklenemedi')
      }
    } catch (error) {
      alert('İkinci resim yüklenirken hata oluştu')
    } finally {
      setUploadingVenueImage2(false)
    }
  }

  const handleVenueImageUpload3 = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVenueImage3(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setVenueFormData({ ...venueFormData, imageUrl3: data.imageUrl })
        alert('Üçüncü resim başarıyla yüklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Üçüncü resim yüklenemedi')
      }
    } catch (error) {
      alert('Üçüncü resim yüklenirken hata oluştu')
    } finally {
      setUploadingVenueImage3(false)
    }
  }

  // Venue category management handlers
  const handleCreateVenueCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/venue-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(venueCategoryFormData)
      })

      if (response.ok) {
        loadData()
        setShowVenueCategoryForm(false)
        setVenueCategoryFormData({
          name: '',
          displayName: '',
          color: '#3B82F6',
          icon: 'building',
          description: '',
          isActive: true
        })
        alert('Mekan kategorisi başarıyla eklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan kategorisi eklenemedi')
      }
    } catch (error) {
      alert('Mekan kategorisi eklenirken hata oluştu')
    }
  }

  // Announcement management handlers
  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const method = editingAnnouncement ? 'PUT' : 'POST'
      const url = editingAnnouncement ? `/api/announcements?id=${editingAnnouncement.id}` : '/api/announcements'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(announcementFormData)
      })

      if (response.ok) {
        loadData()
        setShowAnnouncementForm(false)
        setEditingAnnouncement(null)
        setAnnouncementFormData({
          title: '',
          message: '',
          imageUrl: '',
          imageAspectRatio: 'square',
          buttonText: '',
          buttonUrl: '',
          isActive: true,
          showOnce: false,
          startDate: '',
          endDate: ''
        })
        alert(editingAnnouncement ? 'Duyuru başarıyla güncellendi!' : 'Duyuru başarıyla eklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Duyuru kaydedilemedi')
      }
    } catch (error) {
      alert('Duyuru kaydedilirken hata oluştu')
    }
  }

  const handleEditAnnouncement = (announcement: Announcement) => {
    setEditingAnnouncement(announcement)
    setAnnouncementFormData({
      title: announcement.title,
      message: announcement.message,
      imageUrl: announcement.imageUrl || '',
      imageAspectRatio: 'square',
      buttonText: announcement.buttonText || '',
      buttonUrl: announcement.buttonUrl || '',
      isActive: announcement.isActive,
      showOnce: announcement.showOnce,
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : ''
    })
    setShowAnnouncementForm(true)
  }

  const handleDeleteAnnouncement = async (id: number) => {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`/api/announcements?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          loadData()
          alert('Duyuru başarıyla silindi!')
        } else {
          const error = await response.json()
          alert(error.error || 'Duyuru silinemedi')
        }
      } catch (error) {
        alert('Duyuru silinirken hata oluştu')
      }
    }
  }

  const handleAnnouncementImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAnnouncementImage(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setAnnouncementFormData({ ...announcementFormData, imageUrl: data.imageUrl })
        alert('Duyuru görseli başarıyla yüklendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Duyuru görseli yüklenemedi')
      }
    } catch (error) {
      alert('Duyuru görseli yüklenirken hata oluştu')
    } finally {
      setUploadingAnnouncementImage(false)
    }
  }

  const handleEditVenueCategory = (category: VenueCategory) => {
    setEditingVenueCategory(category)
    setVenueCategoryFormData({
      name: category.name,
      displayName: category.displayName,
      color: category.color,
      icon: category.icon,
      description: category.description || '',
      isActive: category.isActive
    })
    setShowVenueCategoryForm(true)
  }

  const handleUpdateVenueCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingVenueCategory) return

    try {
      const response = await fetch(`/api/venue-categories?id=${editingVenueCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(venueCategoryFormData)
      })

      if (response.ok) {
        loadData()
        setShowVenueCategoryForm(false)
        setEditingVenueCategory(null)
        alert('Mekan kategorisi başarıyla güncellendi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan kategorisi güncellenemedi')
      }
    } catch (error) {
      alert('Mekan kategorisi güncellenirken hata oluştu')
    }
  }

  const handleDeleteVenueCategory = async (id: number) => {
    if (!confirm('Bu mekan kategorisini silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const response = await fetch(`/api/venue-categories?id=${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
        alert('Mekan kategorisi silindi!')
      } else {
        const error = await response.json()
        alert(error.error || 'Mekan kategorisi silinemedi')
      }
    } catch (error) {
      alert('Mekan kategorisi silinirken hata oluştu')
    }
  }

  // Category reordering functions
  const moveCategoryUp = async (categoryIndex: number) => {
    if (categoryIndex === 0) return
    
    const newCategories = [...categories]
    const category = newCategories[categoryIndex]
    const prevCategory = newCategories[categoryIndex - 1]
    
    // Swap sort orders
    const tempOrder = category.sortOrder || categoryIndex + 1
    category.sortOrder = prevCategory.sortOrder || categoryIndex
    prevCategory.sortOrder = tempOrder
    
    // Swap positions in array
    newCategories[categoryIndex] = prevCategory
    newCategories[categoryIndex - 1] = category
    
    await updateCategoryOrder(newCategories)
  }

  const moveCategoryDown = async (categoryIndex: number) => {
    if (categoryIndex === categories.length - 1) return
    
    const newCategories = [...categories]
    const category = newCategories[categoryIndex]
    const nextCategory = newCategories[categoryIndex + 1]
    
    // Swap sort orders
    const tempOrder = category.sortOrder || categoryIndex + 1
    category.sortOrder = nextCategory.sortOrder || categoryIndex + 2
    nextCategory.sortOrder = tempOrder
    
    // Swap positions in array
    newCategories[categoryIndex] = nextCategory
    newCategories[categoryIndex + 1] = category
    
    await updateCategoryOrder(newCategories)
  }

  const updateCategoryOrder = async (newCategories: Category[]) => {
    try {
      const categoryOrders = newCategories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index + 1
      }))

      const response = await fetch('/api/admin/categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryOrders })
      })

      if (response.ok) {
        setCategories(newCategories)
      } else {
        alert('Kategori sıralaması güncellenemedi')
      }
    } catch (error) {
      alert('Kategori sıralaması güncellenirken hata oluştu')
    }
  }

  // Venue category reordering functions
  const moveVenueCategoryUp = async (categoryIndex: number) => {
    if (categoryIndex === 0) return
    
    const newCategories = [...venueCategories]
    const category = newCategories[categoryIndex]
    const prevCategory = newCategories[categoryIndex - 1]
    
    // Swap sort orders
    const tempOrder = category.sortOrder || categoryIndex + 1
    category.sortOrder = prevCategory.sortOrder || categoryIndex
    prevCategory.sortOrder = tempOrder
    
    // Swap positions in array
    newCategories[categoryIndex] = prevCategory
    newCategories[categoryIndex - 1] = category
    
    await updateVenueCategoryOrder(newCategories)
  }

  const moveVenueCategoryDown = async (categoryIndex: number) => {
    if (categoryIndex === venueCategories.length - 1) return
    
    const newCategories = [...venueCategories]
    const category = newCategories[categoryIndex]
    const nextCategory = newCategories[categoryIndex + 1]
    
    // Swap sort orders
    const tempOrder = category.sortOrder || categoryIndex + 1
    category.sortOrder = nextCategory.sortOrder || categoryIndex + 2
    nextCategory.sortOrder = tempOrder
    
    // Swap positions in array
    newCategories[categoryIndex] = nextCategory
    newCategories[categoryIndex + 1] = category
    
    await updateVenueCategoryOrder(newCategories)
  }

  const updateVenueCategoryOrder = async (newCategories: VenueCategory[]) => {
    try {
      const categoryOrders = newCategories.map((cat, index) => ({
        id: cat.id,
        sortOrder: index + 1
      }))

      const response = await fetch('/api/admin/venue-categories/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryOrders })
      })

      if (response.ok) {
        setVenueCategories(newCategories)
      } else {
        alert('Mekan kategori sıralaması güncellenemedi')
      }
    } catch (error) {
      alert('Mekan kategori sıralaması güncellenirken hata oluştu')
    }
  }

  // Approval handlers
  const handleEventApproval = async (eventId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/pending-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventId, action })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        loadData() // Refresh data
      } else {
        const error = await response.json()
        alert(error.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('İşlem sırasında hata oluştu')
    }
  }

  const handleVenueApproval = async (venueId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/admin/pending-venues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ venueId, action })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
        loadData() // Refresh data
      } else {
        const error = await response.json()
        alert(error.error || 'İşlem başarısız')
      }
    } catch (error) {
      alert('İşlem sırasında hata oluştu')
    }
  }

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <Calendar className="w-12 h-12 text-edirne-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Yönetici Paneli</h1>
            <p className="text-gray-600">Giriş yapın</p>
          </div>
          
          {authStep === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Adresiniz
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="E-mail adresinizi girin"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yönetici Şifresi
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Şifrenizi girin"
                  required
                />
              </div>
              
              {authError && (
                <div className="text-red-600 text-sm text-center">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                className="w-full bg-edirne-500 text-white py-2 px-4 rounded-lg hover:bg-edirne-600 transition-colors"
              >
                Doğrulama Kodu Gönder
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Email adresinize gönderilen 6 haneli kodu girin:
                </p>
                <p className="font-medium text-sm text-edirne-600">{email}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doğrulama Kodu
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500 text-center text-lg tracking-widest"
                  placeholder="123456"
                  maxLength={6}
                  required
                />
              </div>
              
              {authError && (
                <div className="text-red-600 text-sm text-center">
                  {authError}
                </div>
              )}
              
              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-edirne-500 text-white py-2 px-4 rounded-lg hover:bg-edirne-600 transition-colors disabled:opacity-50"
              >
                {isVerifying ? 'Doğrulanıyor...' : 'Giriş Yap'}
              </button>
              
              <button
                type="button"
                onClick={resetAuthForm}
                className="w-full text-edirne-500 py-2 px-4 rounded-lg border border-edirne-500 hover:bg-edirne-50 transition-colors"
              >
                Geri Dön
              </button>
            </form>
          )}
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-edirne-500 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-8 h-8 text-edirne-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Etkinlik Yönetimi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEventForm(true)}
                className="bg-edirne-500 text-white px-4 py-2 rounded-lg hover:bg-edirne-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Yeni Etkinlik
              </button>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('events')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'events'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Etkinlikler
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Kategoriler
            </button>
            <button
              onClick={() => setActiveTab('venues')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'venues'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mekanlar
            </button>
            <button
              onClick={() => setActiveTab('venue-categories')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'venue-categories'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Mekan Kategorileri
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-1" />
              Üyeler ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('pending-approvals')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending-approvals'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Onay Bekleyenler {(pendingEvents.length + pendingVenues.length) > 0 && (
                <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {pendingEvents.length + pendingVenues.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'feedback'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Geri Bildirimler {feedback.length > 0 && (
                <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {feedback.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('announcements')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'announcements'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Duyurular {announcements.length > 0 && (
                <span className="ml-1 bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
                  {announcements.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-edirne-500 text-edirne-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>

          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* FEEDBACK TAB CONTENT */}
        {activeTab === 'feedback' && (
          <FeedbackTab 
            feedback={feedback} 
            onDelete={handleFeedbackDelete}
          />
        )}

        {/* ANALYTICS TAB CONTENT */}
        {activeTab === 'analytics' && <AdminAnalytics />}

        {/* OTHER TABS */}
        {activeTab === 'events' && (
          <div>
            {/* Events List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Etkinlikler ({events.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Etkinlik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Yer/Mekan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.map((event) => {
                      return (
                        <tr key={event.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.organizerName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(event.startDate).toLocaleDateString('tr-TR')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{event.location}</td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {event.categories && event.categories.length > 0 ? (
                                event.categories.map((cat: { categoryId: number; categoryColor: string; categoryDisplayName: string }) => (
                                  <span 
                                    key={cat.categoryId}
                                    className="px-2 py-1 rounded-full text-xs text-white font-medium"
                                    style={{ backgroundColor: cat.categoryColor }}
                                  >
                                    {cat.categoryDisplayName}
                                  </span>
                                ))
                              ) : (
                                // Fallback to old single category display
                                (() => {
                                  const category = categories.find(c => c.id === event.categoryId)
                                  return category && (
                                    <span 
                                      className="px-2 py-1 rounded-full text-xs text-white font-medium"
                                      style={{ backgroundColor: category.color }}
                                    >
                                      {category.displayName}
                                    </span>
                                  )
                                })()
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              event.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {event.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(event)}
                                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                title="Etkinliği düzenle"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEventStatusToggle(event.id, event.isActive)}
                                className={`p-1 rounded transition-colors ${
                                  event.isActive 
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                                title={event.isActive ? 'Etkinliği pasifleştir' : 'Etkinliği aktifleştir'}
                              >
                                {event.isActive ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleDelete(event.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Etkinliği sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'categories' && (
          <div>
            {/* Categories Management */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Kategoriler ({categories.length})</h2>
                  <p className="text-sm text-gray-600 mt-1">Etkinlik kategorilerini yönetin</p>
                </div>
                <button
                  onClick={() => setShowCategoryForm(true)}
                  className="bg-edirne-500 text-white px-4 py-2 rounded-lg hover:bg-edirne-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Kategori
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görünen Ad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İkon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıralama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {categories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.displayName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-600">{category.color}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.icon}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => moveCategoryUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              title="Yukarı taşı"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveCategoryDown(index)}
                              disabled={index === categories.length - 1}
                              className={`p-1 rounded ${
                                index === categories.length - 1
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              title="Aşağı taşı"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'venues' && (
          <div>
            {/* Venues List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Mekanlar ({venues.length})</h2>
                <button
                  onClick={() => setShowVenueForm(true)}
                  className="bg-edirne-500 text-white px-4 py-2 rounded-lg hover:bg-edirne-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Mekan
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mekan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adres</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {venues.map((venue) => {
                      const category = venueCategories.find(c => c.id === venue.categoryId)
                      return (
                        <tr key={venue.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                              <div className="text-sm text-gray-500">{venue.description?.substring(0, 50)}...</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {category && (
                              <span 
                                className="px-2 py-1 rounded-full text-xs text-white font-medium"
                                style={{ backgroundColor: category.color }}
                              >
                                {category.displayName}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{venue.address}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            ⭐ {venue.rating}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              venue.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {venue.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditVenue(venue)}
                                className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                                title="Mekanı düzenle"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleVenueStatusToggle(venue.id, venue.isActive)}
                                className={`p-1 rounded transition-colors ${
                                  venue.isActive 
                                    ? 'text-orange-600 hover:text-orange-800 hover:bg-orange-50' 
                                    : 'text-green-600 hover:text-green-800 hover:bg-green-50'
                                }`}
                                title={venue.isActive ? 'Mekanı pasifleştir' : 'Mekanı aktifleştir'}
                              >
                                {venue.isActive ? (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                  </svg>
                                ) : (
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteVenue(venue.id)}
                                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                title="Mekanı sil"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'venue-categories' && (
          <div>
            {/* Venue Categories List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Mekan Kategorileri ({venueCategories.length})</h2>
                <button
                  onClick={() => setShowVenueCategoryForm(true)}
                  className="bg-edirne-500 text-white px-4 py-2 rounded-lg hover:bg-edirne-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Kategori
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Görünen Ad</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Açıklama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renk</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İkon</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıralama</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {venueCategories.map((category, index) => (
                      <tr key={category.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{category.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.displayName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{category.description}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div 
                              className="w-4 h-4 rounded-full mr-2"
                              style={{ backgroundColor: category.color }}
                            ></div>
                            <span className="text-sm text-gray-600">{category.color}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{category.icon}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            category.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {category.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => moveVenueCategoryUp(index)}
                              disabled={index === 0}
                              className={`p-1 rounded ${
                                index === 0 
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              title="Yukarı taşı"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => moveVenueCategoryDown(index)}
                              disabled={index === venueCategories.length - 1}
                              className={`p-1 rounded ${
                                index === venueCategories.length - 1
                                  ? 'text-gray-300 cursor-not-allowed' 
                                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                              }`}
                              title="Aşağı taşı"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditVenueCategory(category)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteVenueCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'users' && (
          <div>
            {/* Users List */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Kayıtlı Üyeler ({users.length})</h2>
                <p className="text-sm text-gray-600 mt-1">Sisteme kayıt olmuş kullanıcıları görüntüleyebilirsiniz</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İletişim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Demografik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İlgi Alanları</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kayıt Tarihi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {user.profileImageUrl ? (
                              <img
                                src={user.profileImageUrl}
                                alt={user.name}
                                className="w-10 h-10 rounded-full object-cover mr-3"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                <Users className="w-5 h-5 text-gray-600" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">ID: {user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email}</div>
                          {user.phone && (
                            <div className="text-sm text-gray-500">{user.phone}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.city}{user.district && `, ${user.district}`}</div>
                          {user.dateOfBirth && (
                            <div className="text-sm text-gray-500">
                              {new Date(user.dateOfBirth).toLocaleDateString('tr-TR')}
                            </div>
                          )}
                          {user.gender && (
                            <div className="text-sm text-gray-500">{user.gender}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.interests ? (
                              <div className="flex flex-wrap gap-1">
                                {JSON.parse(user.interests).map((interest: string, index: number) => (
                                  <span
                                    key={index}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                                  >
                                    {interest}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400">Belirtilmemiş</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {user.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                            {user.emailVerified && (
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                E-posta Doğrulandı
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(user.createdAt).toLocaleTimeString('tr-TR')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUserStatusToggle(user.id, user.isActive)}
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                user.isActive 
                                  ? 'bg-orange-100 text-orange-800 hover:bg-orange-200' 
                                  : 'bg-green-100 text-green-800 hover:bg-green-200'
                              }`}
                              title={user.isActive ? 'Kullanıcıyı pasifleştir' : 'Kullanıcıyı aktifleştir'}
                            >
                              {user.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                            </button>
                            <button
                              onClick={() => handleUserDelete(user.id, user.name)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Kullanıcıyı sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Users className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Henüz kayıtlı üye yok</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Kullanıcılar sisteme kayıt olduğunda burada görünecekler.
                  </p>
                </div>
              )}
            </div>
          </div>

        )}
        
        {activeTab === 'analytics' && (
          <div>
            {/* Analytics Dashboard */}
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Toplam Etkinlik</dt>
                        <dd className="text-lg font-medium text-gray-900">{events.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-green-600 font-bold">✓</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Aktif Etkinlik</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {events.filter(e => e.isActive).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <span className="text-yellow-600 font-bold">⭐</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Öne Çıkan</dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {events.filter(e => e.isFeatured).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                        <span className="text-purple-600 font-bold">#</span>
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">Kategoriler</dt>
                        <dd className="text-lg font-medium text-gray-900">{categories.length}</dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Kategori Dağılımı</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {categories.map(category => {
                      const eventCount = events.filter(event => {
                        // Check if event has categories array (new multi-category system)
                        if (event.categories && event.categories.length > 0) {
                          return event.categories.some(cat => cat.categoryId === category.id)
                        }
                        // Fallback to old single category system
                        return event.categoryId === category.id
                      }).length
                      const percentage = events.length > 0 ? ((eventCount / events.length) * 100).toFixed(1) : 0
                      
                      return (
                        <div key={category.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            <span className="text-sm font-medium text-gray-900">{category.displayName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full"
                                style={{ 
                                  backgroundColor: category.color,
                                  width: `${percentage}%`
                                }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 w-12 text-right">{eventCount}</span>
                            <span className="text-xs text-gray-400 w-12 text-right">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Recent Events */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Son Eklenen Etkinlikler</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {events
                      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                      .slice(0, 5)
                      .map(event => (
                        <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(event.createdAt).toLocaleDateString('tr-TR')} - {event.organizerName}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {event.isFeatured && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                Öne Çıkan
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              event.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {event.isActive ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>

              {/* Monthly Distribution */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Aylık Etkinlik Dağılımı</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(() => {
                      const monthlyData: Record<string, number> = {}
                      events.forEach(event => {
                        const month = new Date(event.startDate).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })
                        monthlyData[month] = (monthlyData[month] || 0) + 1
                      })
                      
                      return Object.entries(monthlyData)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .slice(0, 6)
                        .map(([month, count]) => (
                          <div key={month} className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-lg font-semibold text-blue-900">{count}</div>
                            <div className="text-sm text-blue-600">{month}</div>
                          </div>
                        ))
                    })()}
                  </div>
                </div>
              </div>

              {/* Venue Analytics */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-gray-900">Mekan İstatistikleri</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{venues.length}</div>
                      <div className="text-sm text-gray-500">Toplam Mekan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{venues.filter(v => v.isActive).length}</div>
                      <div className="text-sm text-gray-500">Aktif Mekan</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-yellow-600">{venues.filter(v => v.isFeatured).length}</div>
                      <div className="text-sm text-gray-500">Öne Çıkan Mekan</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'pending-approvals' && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Onay Bekleyen İçerikler</h2>
              <p className="text-gray-600">Kullanıcılar tarafından önerilen etkinlik ve mekanları inceleyin ve onaylayın.</p>
            </div>

            {/* Pending Events Section */}
            <div className="bg-white rounded-lg shadow-sm mb-8">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Onay Bekleyen Etkinlikler ({pendingEvents.length})
                </h3>
              </div>
              {pendingEvents.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Onay bekleyen etkinlik bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingEvents.map((event) => (
                    <div key={event.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{event.title}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Onay Bekliyor
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{event.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                              <strong>Tarih:</strong> {new Date(event.startDate).toLocaleDateString('tr-TR')}
                              {event.startTime && ` - ${event.startTime}`}
                            </div>
                            <div>
                              <strong>Yer/Mekan:</strong> {event.location}
                            </div>

                          </div>
                          {event.categories && event.categories.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {event.categories.map((cat, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 text-xs font-medium rounded-full"
                                  style={{
                                    backgroundColor: cat.categoryColor + '20',
                                    color: cat.categoryColor
                                  }}
                                >
                                  {cat.categoryDisplayName}
                                </span>
                              ))}
                            </div>
                          )}
                          {event.imageUrl && (
                            <div className="mt-3">
                              <img
                                src={event.imageUrl}
                                alt={event.title}
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setReviewingItem(event)
                              setReviewType('event')
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            👁️ İncele ve Onayla
                          </button>
                          <button
                            onClick={() => handleEventApproval(event.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            ✗ Reddet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pending Venues Section */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Onay Bekleyen Mekanlar ({pendingVenues.length})
                </h3>
              </div>
              {pendingVenues.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p>Onay bekleyen mekan bulunmuyor.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pendingVenues.map((venue) => (
                    <div key={venue.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{venue.name}</h4>
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                              Onay Bekliyor
                            </span>
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                              Kategori: {venue.categoryId}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{venue.description}</p>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                            <div>
                              <strong>Adres:</strong> {venue.address}
                            </div>
                            <div>
                              <strong>Telefon:</strong> {venue.phone || 'Belirtilmemiş'}
                            </div>
                            <div>
                              <strong>Kapasite:</strong> {venue.capacity || 'Belirtilmemiş'}
                            </div>
                          </div>
                          {venue.website && (
                            <div className="mt-2 text-sm text-gray-500">
                              <strong>Website:</strong> {venue.website}
                            </div>
                          )}
                          {venue.amenities && (
                            <div className="mt-2 text-sm text-gray-500">
                              <strong>Özellikler:</strong> {venue.amenities}
                            </div>
                          )}
                          {venue.imageUrl && (
                            <div className="mt-3">
                              <img
                                src={venue.imageUrl}
                                alt={venue.name}
                                className="w-32 h-24 object-cover rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setReviewingItem(venue)
                              setReviewType('venue')
                            }}
                            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            👁️ İncele ve Onayla
                          </button>
                          <button
                            onClick={() => handleVenueApproval(venue.id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                          >
                            ✗ Reddet
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Review Modal */}
            {reviewingItem && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {reviewType === 'event' ? 'Etkinlik' : 'Mekan'} İnceleme ve Düzenleme
                      </h3>
                      <button
                        onClick={() => setReviewingItem(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {reviewType === 'event' ? (
                      /* Event Review Form - Matches EventSubmissionModal exactly */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Etkinlik Adı *
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.title || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, title: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Kategoriler (En az 1, en fazla 3 kategori seçiniz) *
                            </label>
                            <div className="relative">
                              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-edirne-500 flex flex-wrap gap-1 min-h-[40px] items-center">
                                {(() => {
                                  // Convert categoryId to array format for display
                                  const categoryIds = (reviewingItem as Event)?.categoryId ? [(reviewingItem as Event).categoryId] : [];
                                  return categoryIds.length === 0 ? (
                                    <span className="text-gray-500">Kategori seçiniz...</span>
                                  ) : (
                                    categoryIds.map((categoryId) => {
                                      const category = categories.find(c => c.id === categoryId)
                                      return category ? (
                                        <span key={categoryId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                          {category.displayName}
                                        </span>
                                      ) : null
                                    })
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Açıklama *
                          </label>
                          <textarea
                            rows={3}
                            value={(reviewingItem as Event)?.description || ''}
                            onChange={(e) => setReviewingItem(prev => ({ ...prev, description: e.target.value } as Event))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Başlangıç Tarihi *
                            </label>
                            <input
                              type="date"
                              value={(reviewingItem as Event)?.startDate?.split('T')[0] || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, startDate: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bitiş Tarihi
                            </label>
                            <input
                              type="date"
                              value={(reviewingItem as Event)?.endDate?.split('T')[0] || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, endDate: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Başlangıç Saati *
                            </label>
                            <input
                              type="time"
                              value={(reviewingItem as Event)?.startTime || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, startTime: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bitiş Saati
                            </label>
                            <input
                              type="time"
                              value={(reviewingItem as Event)?.endTime || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, endTime: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Yer/Mekan *
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.location || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, location: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="Etkinlik mekanı adı"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Adres
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.address || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, address: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="Tam adres bilgisi"
                            />
                          </div>
                        </div>

                        {/* Interactive Map for Location Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yer/Mekan Seçimi
                          </label>
                          <div className="border border-gray-300 rounded-lg overflow-hidden">
                            <InteractiveMap
                              center={(reviewingItem as Event)?.latitude && (reviewingItem as Event)?.longitude ? 
                                [(reviewingItem as Event).latitude!, (reviewingItem as Event).longitude!] : 
                                [41.6781, 26.5584]
                              }
                              zoom={13}
                              onLocationSelect={(lat: number, lng: number) => {
                                setReviewingItem(prev => ({ 
                                  ...prev, 
                                  latitude: lat, 
                                  longitude: lng 
                                } as Event))
                              }}
                              height="300px"
                            />
                          </div>
                          
                          {(reviewingItem as Event)?.latitude && (reviewingItem as Event)?.longitude && (
                            <div className="mt-2 text-xs text-gray-500">
                              Seçilen konum: {(reviewingItem as Event).latitude!.toFixed(4)}, {(reviewingItem as Event).longitude!.toFixed(4)}
                            </div>
                          )}
                        </div>



                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kimlere Yönelik
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.participantType || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, participantType: e.target.value } as Event))}
                              placeholder="Örn: Herkes, Çocuklar, Aileler, Öğrenciler..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Kapasite
                            </label>
                            <input
                              type="number"
                              value={(reviewingItem as Event)?.capacity || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, capacity: parseInt(e.target.value) || null } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Organizatör
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.organizerName || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, organizerName: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="Organizatör veya kurum adı"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Organizatör İletişim
                            </label>
                            <input
                              type="text"
                              value={(reviewingItem as Event)?.organizerContact || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, organizerContact: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="Telefon numarası veya e-posta adresi"
                            />
                          </div>
                        </div>

                        {/* Event Images */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Etkinlik Görseli
                          </label>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleReviewImageUpload(e, 1)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-edirne-50 file:text-edirne-700 hover:file:bg-edirne-100"
                            />
                            {(reviewingItem as Event)?.imageUrl && (
                              <div className="relative mt-3">
                                <img
                                  src={(reviewingItem as Event).imageUrl?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Event).imageUrl?.split('/').pop()}` : (reviewingItem as Event).imageUrl}
                                  alt="Önizleme"
                                  className="w-32 h-20 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => setReviewingItem(prev => ({ ...prev, imageUrl: '' } as Event))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            İkinci Etkinlik Görseli
                          </label>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleReviewImageUpload(e, 2)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-edirne-50 file:text-edirne-700 hover:file:bg-edirne-100"
                            />
                            {(reviewingItem as Event)?.imageUrl2 && (
                              <div className="relative mt-3">
                                <img
                                  src={(reviewingItem as Event).imageUrl2?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Event).imageUrl2?.split('/').pop()}` : (reviewingItem as Event).imageUrl2}
                                  alt="İkinci Görsel Önizleme"
                                  className="w-32 h-20 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => setReviewingItem(prev => ({ ...prev, imageUrl2: '' } as Event))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">
                            Üçüncü Etkinlik Görseli
                          </label>
                          <div className="space-y-3">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleReviewImageUpload(e, 3)}
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-edirne-50 file:text-edirne-700 hover:file:bg-edirne-100"
                            />
                            {(reviewingItem as Event)?.imageUrl3 && (
                              <div className="relative mt-3">
                                <img
                                  src={(reviewingItem as Event).imageUrl3?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Event).imageUrl3?.split('/').pop()}` : (reviewingItem as Event).imageUrl3}
                                  alt="Üçüncü Görsel Önizleme"
                                  className="w-32 h-20 object-cover rounded border"
                                />
                                <button
                                  type="button"
                                  onClick={() => setReviewingItem(prev => ({ ...prev, imageUrl3: '' } as Event))}
                                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Website URL
                            </label>
                            <input
                              type="url"
                              value={(reviewingItem as Event)?.websiteUrl || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, websiteUrl: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="https://"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Bilet URL
                            </label>
                            <input
                              type="url"
                              value={(reviewingItem as Event)?.ticketUrl || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, ticketUrl: e.target.value } as Event))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                              placeholder="https://"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setReviewingItem(null)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            İptal
                          </button>
                          <button
                            onClick={async () => {
                              // Save changes to pending event and approve
                              const updatedEvent = reviewingItem as Event
                              try {
                                console.log('Updating pending event:', updatedEvent.id, updatedEvent)
                                const response = await fetch(`/api/admin/pending-events/${updatedEvent.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updatedEvent)
                                })
                                
                                const responseData = await response.json()
                                console.log('Update response:', response.ok, responseData)
                                
                                if (response.ok) {
                                  // Approve the event
                                  console.log('Proceeding to approve event:', updatedEvent.id)
                                  await handleEventApproval(updatedEvent.id, 'approve')
                                  setReviewingItem(null)
                                  alert('Etkinlik başarıyla güncellendi ve onaylandı!')
                                } else {
                                  console.error('Update failed:', responseData)
                                  alert(`Güncelleme başarısız: ${responseData.error || 'Bilinmeyen hata'}`)
                                }
                              } catch (error) {
                                console.error('Update error:', error)
                                alert('Güncelleme sırasında hata oluştu: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'))
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Kaydet ve Onayla
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Venue Review Form */
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mekan Adı</label>
                            <input
                              type="text"
                              value={(reviewingItem as Venue)?.name || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, name: e.target.value } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                            <select
                              value={(reviewingItem as Venue)?.categoryId || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, categoryId: parseInt(e.target.value) } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            >
                              <option value="">Kategori Seçin</option>
                              {Array.isArray(venueCategories) && venueCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                  {category.displayName}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
                          <textarea
                            value={(reviewingItem as Venue)?.description || ''}
                            onChange={(e) => setReviewingItem(prev => ({ ...prev, description: e.target.value } as Venue))}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                          <input
                            type="text"
                            value={(reviewingItem as Venue)?.address || ''}
                            onChange={(e) => setReviewingItem(prev => ({ ...prev, address: e.target.value } as Venue))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                            <input
                              type="text"
                              value={(reviewingItem as Venue)?.phone || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, phone: e.target.value } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                              type="email"
                              value={(reviewingItem as Venue)?.email || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, email: e.target.value } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                            <input
                              type="text"
                              value={(reviewingItem as Venue)?.website || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, website: e.target.value } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Kapasite</label>
                            <input
                              type="number"
                              value={(reviewingItem as Venue)?.capacity || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, capacity: parseInt(e.target.value) || null } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Özellikler</label>
                          <textarea
                            value={(reviewingItem as Venue)?.amenities || ''}
                            onChange={(e) => setReviewingItem(prev => ({ ...prev, amenities: e.target.value } as Venue))}
                            rows={3}
                            placeholder="Klima, WiFi, Otopark vb."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Çalışma Saatleri</label>
                          <input
                            type="text"
                            value={(reviewingItem as Venue)?.openingHours || ''}
                            onChange={(e) => setReviewingItem(prev => ({ ...prev, openingHours: e.target.value } as Venue))}
                            placeholder="09:00-22:00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                          />
                        </div>

                        {/* Venue Images */}
                        <div className="space-y-4">
                          <label className="block text-sm font-medium text-gray-700">Mekan Fotoğrafları</label>
                          
                          {(reviewingItem as Venue)?.imageUrl && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={(reviewingItem as Venue).imageUrl?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Venue).imageUrl?.split('/').pop()}` : (reviewingItem as Venue).imageUrl}
                                alt="Venue Image 1"
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Fotoğraf 1 URL</label>
                                <input
                                  type="text"
                                  value={(reviewingItem as Venue)?.imageUrl || ''}
                                  onChange={(e) => setReviewingItem(prev => ({ ...prev, imageUrl: e.target.value } as Venue))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                                />
                              </div>
                            </div>
                          )}

                          {(reviewingItem as Venue)?.imageUrl2 && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={(reviewingItem as Venue).imageUrl2?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Venue).imageUrl2?.split('/').pop()}` : (reviewingItem as Venue).imageUrl2}
                                alt="Venue Image 2"
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Fotoğraf 2 URL</label>
                                <input
                                  type="text"
                                  value={(reviewingItem as Venue)?.imageUrl2 || ''}
                                  onChange={(e) => setReviewingItem(prev => ({ ...prev, imageUrl2: e.target.value } as Venue))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                                />
                              </div>
                            </div>
                          )}

                          {(reviewingItem as Venue)?.imageUrl3 && (
                            <div className="flex items-center space-x-4">
                              <img
                                src={(reviewingItem as Venue).imageUrl3?.startsWith('/uploads/') ? `/api/serve-image/${(reviewingItem as Venue).imageUrl3?.split('/').pop()}` : (reviewingItem as Venue).imageUrl3}
                                alt="Venue Image 3"
                                className="w-24 h-24 object-cover rounded-lg border"
                              />
                              <div className="flex-1">
                                <label className="block text-sm text-gray-600 mb-1">Fotoğraf 3 URL</label>
                                <input
                                  type="text"
                                  value={(reviewingItem as Venue)?.imageUrl3 || ''}
                                  onChange={(e) => setReviewingItem(prev => ({ ...prev, imageUrl3: e.target.value } as Venue))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Enlem (Latitude)</label>
                            <input
                              type="number"
                              step="any"
                              value={(reviewingItem as Venue)?.latitude || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, latitude: parseFloat(e.target.value) || null } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Boylam (Longitude)</label>
                            <input
                              type="number"
                              step="any"
                              value={(reviewingItem as Venue)?.longitude || ''}
                              onChange={(e) => setReviewingItem(prev => ({ ...prev, longitude: parseFloat(e.target.value) || null } as Venue))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-4">
                          <button
                            onClick={() => setReviewingItem(null)}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            İptal
                          </button>
                          <button
                            onClick={async () => {
                              // Save changes to pending venue and approve
                              const updatedVenue = reviewingItem as Venue
                              try {
                                const response = await fetch(`/api/admin/pending-venues/${updatedVenue.id}`, {
                                  method: 'PUT',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(updatedVenue)
                                })
                                if (response.ok) {
                                  // Approve the venue
                                  await handleVenueApproval(updatedVenue.id, 'approve')
                                  setReviewingItem(null)
                                  alert('Mekan başarıyla güncellendi ve onaylandı!')
                                }
                              } catch (error) {
                                alert('Güncelleme sırasında hata oluştu')
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Kaydet ve Onayla
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'announcements' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Duyuru Yönetimi</h3>
                <button
                  onClick={() => setShowAnnouncementForm(true)}
                  className="bg-edirne-500 text-white px-4 py-2 rounded-lg hover:bg-edirne-600 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Yeni Duyuru
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Başlık</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tek Gösterim</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih Aralığı</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {announcements.map((announcement) => (
                      <tr key={announcement.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{announcement.title}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {announcement.message.replace(/<[^>]*>/g, '').substring(0, 80)}...
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {announcement.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            announcement.showOnce 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {announcement.showOnce ? 'Tek Seferlik' : 'Her Zaman'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {announcement.startDate && announcement.endDate ? (
                            <div>
                              <div>{new Date(announcement.startDate).toLocaleDateString('tr-TR')}</div>
                              <div className="text-xs text-gray-500">
                                - {new Date(announcement.endDate).toLocaleDateString('tr-TR')}
                              </div>
                            </div>
                          ) : announcement.startDate ? (
                            <div>
                              <div>{new Date(announcement.startDate).toLocaleDateString('tr-TR')}</div>
                              <div className="text-xs text-gray-500">başlangıç</div>
                            </div>
                          ) : (
                            <span className="text-gray-400">Süresiz</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditAnnouncement(announcement)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Duyuruyu düzenle"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAnnouncement(announcement.id)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Duyuruyu sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {announcements.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Henüz duyuru bulunmuyor.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Event Form Modal */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingEvent ? 'Etkinlik Düzenle' : 'Yeni Etkinlik'}
              </h3>
              <button
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Etkinlik Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategoriler (En az 1, en fazla 3 kategori seçiniz) *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCategoryModal(true)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-left focus:outline-none focus:ring-2 focus:ring-edirne-500 flex items-center justify-between"
                    >
                      <span className="flex flex-wrap gap-1">
                        {formData.categoryIds.length === 0 ? (
                          <span className="text-gray-500">Kategori seçiniz...</span>
                        ) : (
                          formData.categoryIds.map((categoryId) => {
                            const category = categories.find(c => c.id === categoryId)
                            return category ? (
                              <span key={categoryId} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {category.displayName}
                              </span>
                            ) : null
                          })
                        )}
                      </span>
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  {(formData.categoryIds.length < 1 || formData.categoryIds.length > 3) && (
                    <p className="text-red-500 text-xs mt-1">En az 1, en fazla 3 kategori seçmelisiniz</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Saati *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Yer/Mekan *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="Etkinlik mekanı adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adres
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="Tam adres bilgisi"
                  />
                </div>
              </div>

              {/* Interactive Map for Location Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yer/Mekan Seçimi
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden">
                  <InteractiveMap
                    center={formData.latitude && formData.longitude ? 
                      [parseFloat(formData.latitude), parseFloat(formData.longitude)] : 
                      [41.6781, 26.5584]
                    }
                    zoom={13}
                    onLocationSelect={(lat, lng) => {
                      setFormData({
                        ...formData,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6)
                      })
                    }}
                    height="300px"
                  />
                </div>
                
                {formData.latitude && formData.longitude && (
                  <div className="mt-2 text-xs text-gray-500">
                    Seçilen konum: {parseFloat(formData.latitude).toFixed(4)}, {parseFloat(formData.longitude).toFixed(4)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kimlere Yönelik
                  </label>
                  <input
                    type="text"
                    value={formData.participantType}
                    onChange={(e) => setFormData({ ...formData, participantType: e.target.value })}
                    placeholder="Örn: Herkes, Çocuklar, Aileler, Öğrenciler..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizatör
                  </label>
                  <input
                    type="text"
                    value={formData.organizerName}
                    onChange={(e) => setFormData({ ...formData, organizerName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="Organizatör veya kurum adı"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organizatör İletişim
                  </label>
                  <input
                    type="text"
                    value={formData.organizerContact}
                    onChange={(e) => setFormData({ ...formData, organizerContact: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="Telefon numarası veya e-posta adresi"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etkinlik Görseli
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                  {uploadingImage && (
                    <p className="text-sm text-blue-600">Yükleniyor...</p>
                  )}
                  {formData.imageUrl && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Resim Önizleme: {formData.imageUrl}</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.imageUrl.startsWith('/uploads/') ? `/api/serve-image/${formData.imageUrl.split('/').pop()}` : formData.imageUrl}
                          alt="Önizleme"
                          className="w-64 h-40 object-cover rounded border shadow-md"
                          style={{ display: 'block', minHeight: '160px', backgroundColor: '#f3f4f6' }}
                          onLoad={() => {/* Image loaded successfully */}}
                          onError={(e) => {

                            e.currentTarget.src = formData.imageUrl;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">✓ Resim yüklendi</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkinci Etkinlik Görseli
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload2}
                    disabled={uploadingImage2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                  {uploadingImage2 && (
                    <p className="text-sm text-blue-600">Yükleniyor...</p>
                  )}
                  {formData.imageUrl2 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">İkinci Resim Önizleme:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.imageUrl2.startsWith('/uploads/') ? `/api/serve-image/${formData.imageUrl2.split('/').pop()}` : formData.imageUrl2}
                          alt="İkinci Görsel Önizleme"
                          className="w-64 h-40 object-cover rounded border shadow-md"
                          onLoad={() => {/* Image 2 loaded successfully */}}
                          onError={(e) => {

                            e.currentTarget.src = formData.imageUrl2;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl2: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">✓ İkinci resim yüklendi</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üçüncü Etkinlik Görseli
                </label>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload3}
                    disabled={uploadingImage3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                  {uploadingImage3 && (
                    <p className="text-sm text-blue-600">Yükleniyor...</p>
                  )}
                  {formData.imageUrl3 && (
                    <div className="mt-3 p-2 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">Üçüncü Resim Önizleme:</p>
                      <div className="relative inline-block">
                        <img
                          src={formData.imageUrl3.startsWith('/uploads/') ? `/api/serve-image/${formData.imageUrl3.split('/').pop()}` : formData.imageUrl3}
                          alt="Üçüncü Görsel Önizleme"
                          className="w-64 h-40 object-cover rounded border shadow-md"
                          onLoad={() => {/* Image 3 loaded successfully */}}
                          onError={(e) => {

                            e.currentTarget.src = formData.imageUrl3;
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, imageUrl3: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                      <p className="text-xs text-green-600 mt-1">✓ Üçüncü resim yüklendi</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bilet URL
                  </label>
                  <input
                    type="url"
                    value={formData.ticketUrl}
                    onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
                    placeholder="https://bilet.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Öne Çıkan</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingEvent ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
              </h3>
              <button
                onClick={resetCategoryForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı (İngilizce) *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  placeholder="concert, theater, festival..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
                <p className="text-xs text-gray-500 mt-1">URL'de görünecek isim (boşluksuz, küçük harf)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görünen Ad *
                </label>
                <input
                  type="text"
                  required
                  value={categoryFormData.displayName}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, displayName: e.target.value })}
                  placeholder="Konser/Festival, Tiyatro/Sinema..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
                <p className="text-xs text-gray-500 mt-1">Kullanıcılara görünecek isim (/ ile ayırarak alt alta gösterilir)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renk *
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon
                </label>
                <select
                  value={categoryFormData.icon}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                >
                  <option value="calendar">📅 Takvim</option>
                  <option value="music">🎵 Müzik</option>
                  <option value="theater">🎭 Tiyatro</option>
                  <option value="art">🎨 Sanat</option>
                  <option value="sports">⚽ Spor</option>
                  <option value="food">🍽️ Yemek</option>
                  <option value="kids">👶 Çocuk</option>
                  <option value="education">📚 Eğitim</option>
                  <option value="business">💼 İş</option>
                  <option value="tech">💻 Teknoloji</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetCategoryForm}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingCategory ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Venue Form Modal */}
      {showVenueForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingVenue ? 'Mekan Düzenle' : 'Yeni Mekan'}
              </h3>
              <button
                onClick={() => {
                  setShowVenueForm(false)
                  setEditingVenue(null)
                  setVenueFormData({
                    name: '',
                    description: '',
                    categoryId: 1,
                    address: '',
                    phone: '',
                    phone2: '',
                    email: '',
                    website: '',
                    capacity: '',
                    amenities: '',
                    imageUrl: '',
                    imageUrl2: '',
                    imageUrl3: '',
                    latitude: '',
                    longitude: '',
                    openingHours: '',
                    rating: 4.0,
                    isActive: true,
                    isFeatured: false
                  })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={editingVenue ? handleUpdateVenue : handleCreateVenue} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mekan Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={venueFormData.name}
                    onChange={(e) => setVenueFormData({ ...venueFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    required
                    value={venueFormData.categoryId}
                    onChange={(e) => setVenueFormData({ ...venueFormData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  >
                    {venueCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={venueFormData.description}
                  onChange={(e) => setVenueFormData({ ...venueFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adres *
                </label>
                <input
                  type="text"
                  required
                  value={venueFormData.address}
                  onChange={(e) => setVenueFormData({ ...venueFormData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon 1
                  </label>
                  <input
                    type="tel"
                    value={venueFormData.phone}
                    onChange={(e) => setVenueFormData({ ...venueFormData, phone: e.target.value })}
                    placeholder="0XXX XXX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon 2
                  </label>
                  <input
                    type="tel"
                    value={venueFormData.phone2}
                    onChange={(e) => setVenueFormData({ ...venueFormData, phone2: e.target.value })}
                    placeholder="0XXX XXX XX XX"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={venueFormData.email}
                    onChange={(e) => setVenueFormData({ ...venueFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Web Sitesi
                  </label>
                  <input
                    type="url"
                    value={venueFormData.website}
                    onChange={(e) => setVenueFormData({ ...venueFormData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kapasite
                </label>
                <input
                  type="number"
                  value={venueFormData.capacity}
                  onChange={(e) => setVenueFormData({ ...venueFormData, capacity: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Çalışma Saatleri
                </label>
                <input
                  type="text"
                  value={venueFormData.openingHours}
                  onChange={(e) => setVenueFormData({ ...venueFormData, openingHours: e.target.value })}
                  placeholder="Örn: 09:00-22:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Özellikler
                </label>
                <input
                  type="text"
                  value={venueFormData.amenities}
                  onChange={(e) => setVenueFormData({ ...venueFormData, amenities: e.target.value })}
                  placeholder="WiFi, Otopark, Klima, Açık Hava"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mekan Resmi
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVenueImageUpload}
                      disabled={uploadingVenueImage}
                      className="hidden"
                      id="venue-image-upload"
                    />
                    <label
                      htmlFor="venue-image-upload"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Resim Yükle
                    </label>
                    {uploadingVenueImage && (
                      <span className="text-sm text-blue-600">Yükleniyor...</span>
                    )}
                    {venueFormData.imageUrl && (
                      <span className="text-sm text-green-600">✓ Resim yüklendi</span>
                    )}
                  </div>
                  
                  {venueFormData.imageUrl && (
                    <div className="relative w-32 h-32">
                      <img
                        src={venueFormData.imageUrl}
                        alt="Venue preview"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setVenueFormData({ ...venueFormData, imageUrl: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkinci Mekan Resmi
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVenueImageUpload2}
                      disabled={uploadingVenueImage2}
                      className="hidden"
                      id="venue-image-upload-2"
                    />
                    <label
                      htmlFor="venue-image-upload-2"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      İkinci Resim Yükle
                    </label>
                    {uploadingVenueImage2 && (
                      <span className="text-sm text-blue-600">Yükleniyor...</span>
                    )}
                    {venueFormData.imageUrl2 && (
                      <span className="text-sm text-green-600">✓ İkinci resim yüklendi</span>
                    )}
                  </div>
                  
                  {venueFormData.imageUrl2 && (
                    <div className="relative w-32 h-32">
                      <img
                        src={venueFormData.imageUrl2}
                        alt="İkinci resim önizleme"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setVenueFormData({ ...venueFormData, imageUrl2: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Üçüncü Mekan Resmi
                </label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVenueImageUpload3}
                      disabled={uploadingVenueImage3}
                      className="hidden"
                      id="venue-image-upload-3"
                    />
                    <label
                      htmlFor="venue-image-upload-3"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Üçüncü Resim Yükle
                    </label>
                    {uploadingVenueImage3 && (
                      <span className="text-sm text-blue-600">Yükleniyor...</span>
                    )}
                    {venueFormData.imageUrl3 && (
                      <span className="text-sm text-green-600">✓ Üçüncü resim yüklendi</span>
                    )}
                  </div>
                  
                  {venueFormData.imageUrl3 && (
                    <div className="relative w-32 h-32">
                      <img
                        src={venueFormData.imageUrl3}
                        alt="Üçüncü resim önizleme"
                        className="w-full h-full object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => setVenueFormData({ ...venueFormData, imageUrl3: '' })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yer/Mekan Seçimi
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setVenueFormData({ 
                        ...venueFormData, 
                        latitude: '41.6771', 
                        longitude: '26.5557' 
                      })
                    }}
                    className="text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📍 Edirne Merkezi
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(
                          (position) => {
                            setVenueFormData({
                              ...venueFormData,
                              latitude: position.coords.latitude.toFixed(6),
                              longitude: position.coords.longitude.toFixed(6)
                            })
                          },
                          (error) => {
                            alert('Yer/Mekan alınamadı: ' + error.message)
                          }
                        )
                      } else {
                        alert('Bu tarayıcı konum servisini desteklemiyor')
                      }
                    }}
                    className="text-sm bg-green-100 hover:bg-green-200 text-green-700 px-3 py-2 rounded-lg border transition-colors"
                  >
                    📱 Mevcut Yer/Mekan
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Harita üzerinde bir noktaya tıklayın veya kırmızı işareti sürükleyin
                </p>
                
                {/* Interactive Map for Location Selection */}
                <div>
                  <InteractiveMap
                    latitude={parseFloat(venueFormData.latitude) || 41.6771}
                    longitude={parseFloat(venueFormData.longitude) || 26.5557}
                    onLocationSelect={(lat, lng) => {
                      setVenueFormData({
                        ...venueFormData,
                        latitude: lat.toFixed(6),
                        longitude: lng.toFixed(6)
                      })
                    }}
                    height="300px"
                  />
                </div>
                
                {/* Hidden coordinate values for form submission */}
                <input type="hidden" name="latitude" value={venueFormData.latitude} />
                <input type="hidden" name="longitude" value={venueFormData.longitude} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Puan (1-5)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={venueFormData.rating}
                    onChange={(e) => setVenueFormData({ ...venueFormData, rating: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                </div>

              </div>

              <div className="flex items-center space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={venueFormData.isActive}
                    onChange={(e) => setVenueFormData({ ...venueFormData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Aktif</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={venueFormData.isFeatured}
                    onChange={(e) => setVenueFormData({ ...venueFormData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Öne Çıkan</span>
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVenueForm(false)
                    setEditingVenue(null)
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingVenue ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Announcement Form Modal */}
      {showAnnouncementForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingAnnouncement ? 'Duyuru Düzenle' : 'Yeni Duyuru'}
              </h3>
              <button
                onClick={() => {
                  setShowAnnouncementForm(false)
                  setEditingAnnouncement(null)
                  setAnnouncementFormData({
                    title: '',
                    message: '',
                    imageUrl: '',
                    imageAspectRatio: 'square',
                    buttonText: '',
                    buttonUrl: '',
                    isActive: true,
                    showOnce: false,
                    startDate: '',
                    endDate: ''
                  })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateAnnouncement} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duyuru Başlığı *
                </label>
                <input
                  type="text"
                  required
                  value={announcementFormData.title}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Duyuru başlığını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duyuru İçeriği *
                </label>
                <textarea
                  required
                  value={announcementFormData.message}
                  onChange={(e) => setAnnouncementFormData({ ...announcementFormData, message: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Duyuru içeriğini girin. HTML etiketleri kullanabilirsiniz."
                />
                <p className="text-xs text-gray-500 mt-1">HTML formatında yazabilirsiniz (örn: &lt;b&gt;kalın&lt;/b&gt;, &lt;br&gt; için satır sonu)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duyuru Görseli
                </label>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    {announcementFormData.imageUrl && (
                      <div className={`rounded-lg overflow-hidden shadow-lg ${
                        announcementFormData.imageAspectRatio === 'square' ? 'w-20 h-20' :
                        announcementFormData.imageAspectRatio === 'wide' ? 'w-32 h-20' :
                        announcementFormData.imageAspectRatio === 'tall' ? 'w-16 h-24' :
                        'w-20 h-20'
                      }`}>
                        <img 
                          src={announcementFormData.imageUrl} 
                          alt="Duyuru Görseli" 
                          className={`w-full h-full ${
                            announcementFormData.imageAspectRatio === 'original' ? 'object-contain' : 'object-cover'
                          }`}
                        />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAnnouncementImageUpload}
                        disabled={uploadingAnnouncementImage}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-edirne-50 file:text-edirne-700 hover:file:bg-edirne-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG veya GIF formatında (opsiyonel)</p>
                    </div>
                  </div>
                  
                  {announcementFormData.imageUrl && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resim En-Boy Oranı
                      </label>
                      <select
                        value={announcementFormData.imageAspectRatio || 'square'}
                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, imageAspectRatio: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                      >
                        <option value="square">Kare (1:1)</option>
                        <option value="wide">Geniş (16:9)</option>
                        <option value="tall">Uzun (9:16)</option>
                        <option value="original">Orijinal Boyut</option>
                      </select>
                      <p className="text-xs text-gray-500 mt-1">Resmin önizlemede görüntüleneceği en-boy oranını seçin</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buton Metni
                  </label>
                  <input
                    type="text"
                    value={announcementFormData.buttonText}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, buttonText: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="Daha Fazla Bilgi"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buton URL'si
                  </label>
                  <input
                    type="url"
                    value={announcementFormData.buttonUrl}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, buttonUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="date"
                    value={announcementFormData.startDate}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız hemen gösterilir</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Tarihi
                  </label>
                  <input
                    type="date"
                    value={announcementFormData.endDate}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Boş bırakırsanız süresiz gösterilir</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="announcement-active"
                    checked={announcementFormData.isActive}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, isActive: e.target.checked })}
                    className="w-4 h-4 text-edirne-600 focus:ring-edirne-500 border-gray-300 rounded"
                  />
                  <label htmlFor="announcement-active" className="ml-2 text-sm font-medium text-gray-900">
                    Aktif
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="announcement-show-once"
                    checked={announcementFormData.showOnce}
                    onChange={(e) => setAnnouncementFormData({ ...announcementFormData, showOnce: e.target.checked })}
                    className="w-4 h-4 text-edirne-600 focus:ring-edirne-500 border-gray-300 rounded"
                  />
                  <label htmlFor="announcement-show-once" className="ml-2 text-sm font-medium text-gray-900">
                    Tek seferlik göster
                  </label>
                  <p className="text-xs text-gray-500 ml-2">(Kullanıcı bir kez gördükten sonra tekrar gösterilmez)</p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAnnouncementForm(false)
                    setEditingAnnouncement(null)
                    setAnnouncementFormData({
                      title: '',
                      message: '',
                      imageUrl: '',
                      imageAspectRatio: 'square',
                      buttonText: '',
                      buttonUrl: '',
                      isActive: true,
                      showOnce: false,
                      startDate: '',
                      endDate: ''
                    })
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={uploadingAnnouncementImage}
                  className="px-4 py-2 bg-edirne-600 text-white rounded-lg hover:bg-edirne-700 transition-colors disabled:opacity-50"
                >
                  {editingAnnouncement ? 'Güncelle' : 'Oluştur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Venue Category Form Modal */}
      {showVenueCategoryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingVenueCategory ? 'Mekan Kategorisi Düzenle' : 'Yeni Mekan Kategorisi'}
              </h3>
              <button
                onClick={() => {
                  setShowVenueCategoryForm(false)
                  setEditingVenueCategory(null)
                  setVenueCategoryFormData({
                    name: '',
                    displayName: '',
                    color: '#3B82F6',
                    icon: 'building',
                    description: '',
                    isActive: true
                  })
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={editingVenueCategory ? handleUpdateVenueCategory : handleCreateVenueCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Adı *
                </label>
                <input
                  type="text"
                  required
                  value={venueCategoryFormData.name}
                  onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="tarihi_yerler"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Görünen Ad *
                </label>
                <input
                  type="text"
                  required
                  value={venueCategoryFormData.displayName}
                  onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, displayName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Tarihi Yerler"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={venueCategoryFormData.description}
                  onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                  placeholder="Bu kategorinin açıklaması"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renk *
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={venueCategoryFormData.color}
                    onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={venueCategoryFormData.color}
                    onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                    placeholder="#3B82F6"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon
                </label>
                <select
                  value={venueCategoryFormData.icon}
                  onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-edirne-500"
                >
                  <option value="building">🏢 Bina</option>
                  <option value="landmark">🏛️ Tarihi Mekan</option>
                  <option value="wine">🍷 Bar</option>
                  <option value="coffee">☕ Kafe</option>
                  <option value="shopping-bag">🛍️ Alışveriş</option>
                  <option value="utensils">🍽️ Restoran</option>
                  <option value="trees">🌳 Park</option>
                  <option value="museum">🏛️ Müze</option>
                  <option value="theater">🎭 Tiyatro</option>
                  <option value="cinema">🎬 Sinema</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="venue-category-active"
                  checked={venueCategoryFormData.isActive}
                  onChange={(e) => setVenueCategoryFormData({ ...venueCategoryFormData, isActive: e.target.checked })}
                  className="w-4 h-4 text-edirne-600 focus:ring-edirne-500 border-gray-300 rounded"
                />
                <label htmlFor="venue-category-active" className="ml-2 text-sm font-medium text-gray-900">
                  Aktif
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowVenueCategoryForm(false)
                    setEditingVenueCategory(null)
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-edirne-500 text-white rounded-lg hover:bg-edirne-600 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingVenueCategory ? 'Güncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Selection Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-96 overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Kategori Seçimi</h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto">
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category.id} className="flex items-center text-sm space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.categoryIds.includes(category.id)}
                      onChange={(e) => {
                        if (e.target.checked && formData.categoryIds.length < 3) {
                          setFormData({
                            ...formData, 
                            categoryIds: [...formData.categoryIds, category.id]
                          })
                        } else if (!e.target.checked) {
                          setFormData({
                            ...formData, 
                            categoryIds: formData.categoryIds.filter(id => id !== category.id)
                          })
                        }
                      }}
                      disabled={!formData.categoryIds.includes(category.id) && formData.categoryIds.length >= 3}
                      className="text-blue-600 focus:ring-blue-500 rounded"
                    />
                    <span className="flex-1">{category.displayName}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600 mb-3">
                Seçili: {formData.categoryIds.length}/3 kategori
              </p>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="w-full px-4 py-2 bg-edirne-600 text-white rounded-lg hover:bg-edirne-700"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}