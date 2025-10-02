import { create } from 'zustand'
import type { AdminMetrics, User, Notification } from '../../types/admin'

interface AdminState {
  metrics: AdminMetrics | null
  users: User[]
  notifications: Notification[]
  sidebarCollapsed: boolean
  
  setMetrics: (metrics: AdminMetrics) => void
  setUsers: (users: User[]) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAdminStore = create<AdminState>((set) => ({
  metrics: null,
  users: [],
  notifications: [],
  sidebarCollapsed: false,

  setMetrics: (metrics) => set({ metrics }),
  
  setUsers: (users) => set({ users }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications]
    })),
  
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    })),
  
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  setSidebarCollapsed: (collapsed) =>
    set({ sidebarCollapsed: collapsed })
}))
