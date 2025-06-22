import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const timeSlots = [
  { value: '09:00-11:00', label: '9:00 AM - 11:00 AM' },
  { value: '12:00-14:00', label: '12:00 PM - 2:00 PM' },
  { value: '15:00-17:00', label: '3:00 PM - 5:00 PM' },
  { value: '18:00-20:00', label: '6:00 PM - 8:00 PM' },
]

export const specializations = [
  'Cardiac',
  'Orthopedic', 
  'ENT',
  'Dermatology',
  'Pediatrics',
  'General'
]

export const medicalQuotes = [
  "The best doctor gives the least medicines. - Benjamin Franklin",
  "Wherever the art of medicine is loved, there is also a love of humanity. - Hippocrates",
  "Medicine is not only a science; it is also an art. - Paracelsus",
  "The good physician treats the disease; the great physician treats the patient who has the disease. - William Osler",
  "Healing is a matter of time, but it is sometimes also a matter of opportunity. - Hippocrates",
  "Medicine heals doubts as well as diseases. - Karl Marx",
  "The greatest medicine of all is to love and be loved. - Unknown",
  "A good laugh and a long sleep are the best cures in the doctor's book. - Irish Proverb",
  "An apple a day keeps the doctor away. - Proverb",
  "Health is not valued till sickness comes. - Thomas Fuller",
  "Time is the great physician. - Benjamin Disraeli",
  "Prevention is better than cure. - Desiderius Erasmus",
  "A wise man should consider that health is the greatest of human blessings. - Hippocrates",
  "The doctor of the future will give no medicines, but will interest his patients in the care of the human frame, in diet, and in the cause and prevention of disease. - Thomas Edison"
]

export function getDailyQuote() {
  const today = new Date()
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24)
  return medicalQuotes[dayOfYear % medicalQuotes.length]
}

export function formatDate(date: Date) {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export function formatTime(timeSlot: string) {
  const slots = timeSlots.find(slot => slot.value === timeSlot)
  return slots?.label || timeSlot
}

export function isSlotAvailable(date: Date, timeSlot: string) {
  const now = new Date()
  const appointmentDateTime = new Date(date)
  const [startTime] = timeSlot.split('-')
  const [hours, minutes] = startTime.split(':').map(Number)
  appointmentDateTime.setHours(hours, minutes, 0, 0)
  
  return appointmentDateTime > now
}