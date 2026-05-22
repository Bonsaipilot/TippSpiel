import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { SearchProvider, useSearch } from './contexts/SearchContext'
import LoginPage from './pages/LoginPage'
import TipsPage from './pages/TipsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import StandingsPage from './pages/StandingsPage'
import BottomNav from './components/BottomNav'
import OnboardingTour from './components/OnboardingTour'

function AppShell() {
  const { user, isAdmin } = useAuth()
  const { query, setQuery } = useSearch()
  const location = useLocation()
  const [searchOpen, setSearchOpen] = useState(false)
  const onTipsPage = location.pathname === '/tipps'

  const toggleSearch = () => {
    if (searchOpen) { setQuery(''); setSearchOpen(false) }
    else setSearchOpen(true)
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚽</span>
          <span className="font-bold flex-1">WM 2026 Tippspiel</span>
          {onTipsPage && (
            <button onClick={toggleSearch}
              className={`p-1.5 rounded-lg transition-colors ${searchOpen ? 'text-blue-400 bg-slate-700' : 'text-slate-400 hover:text-white'}`}>
              🔍
            </button>
          )}
        </div>
        {onTipsPage && searchOpen && (
          <div className="mt-2">
            <input
              autoFocus
              type="text"
              placeholder="Team suchen… z.B. Deutschland"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-slate-700 text-white rounded-lg px-3 py-2 text-sm border border-slate-600 focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        )}
      </header>
      <main className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/tipps"     element={<TipsPage />} />
          <Route path="/tabelle"   element={<StandingsPage />} />
          <Route path="/rangliste" element={<LeaderboardPage />} />
          <Route path="/profil"    element={<ProfilePage />} />
          {isAdmin && <Route path="/admin" element={<AdminPage />} />}
          <Route path="*"          element={<Navigate to="/tipps" replace />} />
        </Routes>
      </main>
      <BottomNav />
      {user && (
        <OnboardingTour
          userId={user.id}
          numTabs={isAdmin ? 5 : 4}
        />
      )}
    </div>
  )
}

function AppRoutes() {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-slate-500">Laden…</p>
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={session ? <Navigate to="/tipps" replace /> : <LoginPage />}
      />
      <Route
        path="/*"
        element={session ? <AppShell /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <AppRoutes />
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
