import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const initialState = {
  access_token: null,
  refresh_token: null,
  user: null,
  memberships: [],
  selected_membership_id: null,
  requires_workspace_selection: false,
}

export const useAuthStore = create(
  persist(
    (set) => ({
      ...initialState,

      setAuth: (payload) =>
        set({
          access_token: payload.access_token || null,
          refresh_token: payload.refresh_token || null,
          user: payload.user || null,
          memberships: payload.memberships || [],
          requires_workspace_selection: Boolean(payload.requires_workspace_selection),
          selected_membership_id:
            payload.memberships?.length === 1 ? payload.memberships[0].membership_id : null,
        }),

      setTokens: ({ access_token, refresh_token, user }) =>
        set((state) => ({
          access_token: access_token ?? state.access_token,
          refresh_token: refresh_token ?? state.refresh_token,
          user: user ?? state.user,
        })),

      setSelectedMembership: (selected_membership_id) => set({ selected_membership_id }),

      clearAuth: () => set({ ...initialState }),
    }),
    {
      name: 'quizhub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        access_token: state.access_token,
        refresh_token: state.refresh_token,
        user: state.user,
        memberships: state.memberships,
        selected_membership_id: state.selected_membership_id,
        requires_workspace_selection: state.requires_workspace_selection,
      }),
    },
  ),
)
