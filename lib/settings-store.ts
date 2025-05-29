import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { AISettings } from "./openai-service"
import { defaultAISettings } from "./openai-service"

interface SettingsState {
  employeeSettings: Record<string, AISettings>
  getSettings: (employeeId: string) => AISettings
  updateSettings: (employeeId: string, settings: Partial<AISettings>) => void
  resetSettings: (employeeId: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      employeeSettings: {},

      getSettings: (employeeId: string) => {
        const { employeeSettings } = get()
        return employeeSettings[employeeId] || { ...defaultAISettings }
      },

      updateSettings: (employeeId: string, settings: Partial<AISettings>) => {
        set((state) => ({
          employeeSettings: {
            ...state.employeeSettings,
            [employeeId]: {
              ...get().getSettings(employeeId),
              ...settings,
            },
          },
        }))
      },

      resetSettings: (employeeId: string) => {
        set((state) => {
          const newSettings = { ...state.employeeSettings }
          delete newSettings[employeeId]
          return { employeeSettings: newSettings }
        })
      },
    }),
    {
      name: "org-chart-ai-settings",
    },
  ),
)
