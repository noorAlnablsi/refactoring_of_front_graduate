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

      updateUser: (user) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
        })),

      updateMembershipWorkspace: (workspaceId, patch) =>
        set((state) => ({
          memberships: state.memberships.map((membership) =>
            membership.workspace?.id === workspaceId
              ? { ...membership, workspace: { ...membership.workspace, ...patch } }
              : membership,
          ),
        })),

      setSelectedMembership: (selected_membership_id) =>
        set({
          selected_membership_id,
          requires_workspace_selection: false,
        }),

      exitCurrentSession: () =>
        set((state) => ({
          selected_membership_id: null,
          requires_workspace_selection: state.memberships.length > 0,
        })),

      appendMembership: (membership) =>
        set((state) => {
          const exists = state.memberships.some(
            (item) => item.membership_id === membership.membership_id,
          )
          const memberships = exists
            ? state.memberships.map((item) =>
                item.membership_id === membership.membership_id ? { ...item, ...membership } : item,
              )
            : [...state.memberships, membership]

          const hasMultipleMemberships = memberships.length > 1

          return {
            memberships,
            selected_membership_id: hasMultipleMemberships
              ? null
              : membership.membership_id,
            requires_workspace_selection: hasMultipleMemberships,
          }
        }),

      setMemberships: (memberships = []) =>
        set((state) => {
          const next = Array.isArray(memberships) ? memberships : []
          const selectedStillExists = next.some(
            (item) => item.membership_id === state.selected_membership_id,
          )

          if (next.length === 0) {
            return {
              memberships: [],
              selected_membership_id: null,
              requires_workspace_selection: false,
            }
          }

          if (next.length === 1) {
            return {
              memberships: next,
              selected_membership_id: next[0].membership_id,
              requires_workspace_selection: false,
            }
          }

          return {
            memberships: next,
            selected_membership_id: selectedStillExists ? state.selected_membership_id : null,
            requires_workspace_selection: !selectedStillExists,
          }
        }),

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
