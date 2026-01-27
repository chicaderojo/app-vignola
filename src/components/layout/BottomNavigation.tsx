import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

interface BottomNavigationProps {
  notificationCount?: number
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  notificationCount = 0
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  // Determinar tab activa basada en URL
  const getActiveTab = () => {
    const path = location.pathname
    if (path === '/' || path === '/dashboard') return 'inicio'
    if (path.includes('buscar')) return 'buscar'
    if (path.includes('tareas') || path.includes('mantencion')) return 'tareas'
    if (path.includes('ajustes')) return 'ajustes'
    return 'inicio'
  }

  const activeTab = getActiveTab()

  const tabs = [
    { id: 'inicio', icon: 'dashboard', label: 'Inicio', path: '/' },
    { id: 'buscar', icon: 'search', label: 'Buscar', path: '/buscar' },
    { id: 'tareas', icon: 'assignment', label: 'Tareas', path: '/tareas', hasBadge: true },
    { id: 'ajustes', icon: 'settings', label: 'Ajustes', path: '/ajustes' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface-card/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 pb-safe z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16 px-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-1 flex-col items-center justify-center gap-1 transition-colors ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[24px]">
                {tab.icon}
              </span>
              {tab.hasBadge && notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
