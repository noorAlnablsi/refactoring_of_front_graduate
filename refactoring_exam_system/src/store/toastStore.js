import { create } from 'zustand'

let toastTimer = null

export const useToastStore = create((set) => ({
  message: '',
  type: 'success',
  visible: false,

  showToast: (message, type = 'success') => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ message, type, visible: true })
    toastTimer = setTimeout(() => {
      set({ visible: false, message: '' })
    }, 3500)
  },

  hideToast: () => set({ visible: false, message: '' }),
}))
