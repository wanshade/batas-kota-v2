import { create } from 'zustand'

interface BookingState {
  selectedSlotsByDate: Record<string, string[]>
  formData: {
    date: string
    paymentType: string
    namaTim: string
    noWhatsapp: string
  }

  // Actions
  setSelectedSlotsByDate: (slots: Record<string, string[]>) => void
  addSlotToDate: (date: string, slot: string) => void
  removeSlotFromDate: (date: string, slot: string) => void
  clearAllSlots: () => void
  clearSlotsForDate: (date: string) => void
  setFormData: (data: Partial<BookingState['formData']>) => void
  getCurrentDateSlots: (date: string) => string[]
  getAllSelectedSlots: () => Array<{date: string, slots: string[]}>
  getTotalSlotCount: () => number
}

export const useBookingStore = create<BookingState>((set, get) => ({
  selectedSlotsByDate: {},
  formData: {
    date: '',
    paymentType: 'FULL',
    namaTim: '',
    noWhatsapp: ''
  },

  setSelectedSlotsByDate: (slots) => set({ selectedSlotsByDate: slots }),

  addSlotToDate: (date, slot) => set((state) => {
    const currentSlots = state.selectedSlotsByDate[date] || []
    const updatedSlots = currentSlots.includes(slot)
      ? currentSlots.filter(s => s !== slot)
      : [...currentSlots, slot]

    return {
      selectedSlotsByDate: {
        ...state.selectedSlotsByDate,
        [date]: updatedSlots
      }
    }
  }),

  removeSlotFromDate: (date, slot) => set((state) => {
    const currentSlots = state.selectedSlotsByDate[date] || []
    return {
      selectedSlotsByDate: {
        ...state.selectedSlotsByDate,
        [date]: currentSlots.filter(s => s !== slot)
      }
    }
  }),

  clearAllSlots: () => set({ selectedSlotsByDate: {} }),

  clearSlotsForDate: (date) => set((state) => {
    const newSlots = { ...state.selectedSlotsByDate }
    delete newSlots[date]
    return { selectedSlotsByDate: newSlots }
  }),

  setFormData: (data) => set((state) => ({
    formData: { ...state.formData, ...data }
  })),

  getCurrentDateSlots: (date) => {
    return get().selectedSlotsByDate[date] || []
  },

  getAllSelectedSlots: () => {
    return Object.entries(get().selectedSlotsByDate)
      .filter(([_, slots]) => slots.length > 0)
      .map(([date, slots]) => ({ date, slots }))
  },

  getTotalSlotCount: () => {
    return Object.values(get().selectedSlotsByDate)
      .reduce((total, slots) => total + slots.length, 0)
  }
}))