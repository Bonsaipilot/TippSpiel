import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function BottomNav() {
  const { isAdmin } = useAuth()

  const tabs = [
    { to: '/tipps',     icon: '⚽', label: 'Tipps' },
    { to: '/tabelle',   icon: '📊', label: 'Tabelle' },
    { to: '/rangliste', icon: '🏆', label: 'Rangliste' },
    { to: '/profil',    icon: '👤', label: 'Profil' },
    ...(isAdmin ? [{ to: '/admin', icon: '⚙️', label: 'Admin' }] : []),
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 flex">
      {tabs.map(({ to, icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-3 text-xs font-medium transition-colors ${
              isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
            }`
          }
        >
          <span className="text-2xl leading-none">{icon}</span>
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
