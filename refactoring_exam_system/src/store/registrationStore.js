import { create } from 'zustand'
import { resolveWorkspaceName } from '../lib/workspaceName'

const initialState = {
  registration_flow: null,
  welcome_selection: null,
  workspace_kind: null,
  full_name: '',
  email: '',
  phone_number: '',
  workspace_name: '',
  password: '',
  confirm_password: '',
  join_code: '',
  student_api_completed: false,
  dev_otp: '',
  verifyResult: null,
  otpAttemptsRemaining: null,
}

export const useRegistrationStore = create((set) => ({
  ...initialState,

  setRegistrationFlow: (registration_flow) => set({ registration_flow }),

  setWelcomeSelection: (welcome_selection) => set({ welcome_selection }),

  setWorkspaceKind: (workspace_kind) => set({ workspace_kind }),

  updateFields: (fields) => set((state) => ({ ...state, ...fields })),

  setVerifyResult: (verifyResult) => set({ verifyResult }),

  setOtpAttemptsRemaining: (otpAttemptsRemaining) => set({ otpAttemptsRemaining }),

  reset: () => set({ ...initialState }),
}))

export function getWorkspaceNameForRegister(state) {
  return resolveWorkspaceName({
    kind: state.workspace_kind,
    fullName: state.full_name,
    workspaceName: state.workspace_name,
  })
}
