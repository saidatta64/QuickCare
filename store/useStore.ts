import { create } from 'zustand'

interface AppStore {
  isLoading: boolean
  setLoading: (loading: boolean) => void
  
  selectedDate: Date | null
  setSelectedDate: (date: Date | null) => void
  
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  selectedCity: string
  setSelectedCity: (city: string) => void
  
  selectedSpecialization: string
  setSelectedSpecialization: (specialization: string) => void
}

export const useStore = create<AppStore>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),
  
  selectedDate: null,
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  selectedCity: '',
  setSelectedCity: (city) => set({ selectedCity: city }),
  
  selectedSpecialization: '',
  setSelectedSpecialization: (specialization) => set({ selectedSpecialization: specialization }),
}))