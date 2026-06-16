import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeavingScheme, CraftArchive, Template, UIState, ViewMode } from '@/types';
import { defaultMonochromeColors, defaultMulticolorPalette } from '@/data/defaultData';

interface AppState {
  currentScheme: WeavingScheme | null;
  archives: CraftArchive[];
  templates: Template[];
  ui: UIState;
  setCurrentScheme: (scheme: WeavingScheme | null) => void;
  updateCurrentScheme: (updates: Partial<WeavingScheme>) => void;
  addArchive: (archive: CraftArchive) => void;
  updateArchive: (id: string, updates: Partial<CraftArchive>) => void;
  deleteArchive: (id: string) => void;
  addTemplate: (template: Template) => void;
  updateTemplate: (id: string, updates: Partial<Template>) => void;
  deleteTemplate: (id: string) => void;
  toggleTemplateFavorite: (id: string) => void;
  incrementTemplateUsage: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setZoomLevel: (zoom: number) => void;
  setShowDeviation: (show: boolean) => void;
  setShowGrid: (show: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentScheme: null,
      archives: [],
      templates: [],
      ui: {
        sidebarCollapsed: false,
        viewMode: 'far',
        zoomLevel: 1,
        showDeviation: false,
        showGrid: true,
      },
      setCurrentScheme: (scheme) => set({ currentScheme: scheme }),
      updateCurrentScheme: (updates) =>
        set((state) => ({
          currentScheme: state.currentScheme
            ? { ...state.currentScheme, ...updates, updatedAt: new Date().toISOString() }
            : null,
        })),
      addArchive: (archive) =>
        set((state) => ({ archives: [archive, ...state.archives] })),
      updateArchive: (id, updates) =>
        set((state) => ({
          archives: state.archives.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
          ),
        })),
      deleteArchive: (id) =>
        set((state) => ({
          archives: state.archives.filter((a) => a.id !== id),
        })),
      addTemplate: (template) =>
        set((state) => ({ templates: [template, ...state.templates] })),
      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        })),
      toggleTemplateFavorite: (id) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, isFavorite: !t.isFavorite } : t
          ),
        })),
      incrementTemplateUsage: (id) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, usageCount: t.usageCount + 1 } : t
          ),
        })),
      setViewMode: (mode) =>
        set((state) => ({ ui: { ...state.ui, viewMode: mode } })),
      setZoomLevel: (zoom) =>
        set((state) => ({ ui: { ...state.ui, zoomLevel: zoom } })),
      setShowDeviation: (show) =>
        set((state) => ({ ui: { ...state.ui, showDeviation: show } })),
      setShowGrid: (show) =>
        set((state) => ({ ui: { ...state.ui, showGrid: show } })),
      toggleSidebar: () =>
        set((state) => ({ ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed } })),
    }),
    {
      name: 'bamboo-weaving-storage',
      partialize: (state) => ({
        currentScheme: state.currentScheme,
        archives: state.archives,
        templates: state.templates,
        ui: state.ui,
      }),
    }
  )
);

export { defaultMonochromeColors, defaultMulticolorPalette };
