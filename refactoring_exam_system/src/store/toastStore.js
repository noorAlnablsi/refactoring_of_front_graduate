import { create } from 'zustand'

let toastTimer = null

export const useToastStore = create((set) => ({
  message: '',
  type: 'success',
  visible: false,

  showToast: (message, type = 'success') => {
    const normalizedMessage =
      message instanceof Error
        ? message.message
        : typeof message === 'string'
          ? message
          : message == null
            ? ''
            : JSON.stringify(message)

    if (toastTimer) clearTimeout(toastTimer)
    set({ message: normalizedMessage, type, visible: true })
    toastTimer = setTimeout(() => {
      set({ visible: false, message: '' })
    }, 3500)
  },

  hideToast: () => set({ visible: false, message: '' }),
}))
