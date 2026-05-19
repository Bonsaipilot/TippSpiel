import { useAuth } from '../contexts/AuthContext'

export default function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚽</span>
          <span className="font-bold">WM 2026 Tippspiel</span>
        </div>
        <button
          onClick={signOut}
          className="text-sm text-slate-400 hover:text-white transition-colors"
        >
          Abmelden
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="text-5xl mb-4">🏆</div>
        <h2 className="text-2xl font-bold mb-2">Willkommen!</h2>
        <p className="text-slate-400">
          Angemeldet als <span className="text-white font-medium">{user?.email}</span>
        </p>
        <p className="text-slate-500 mt-6 text-sm">
          Tipps und Rangliste folgen im nächsten Schritt.
        </p>
      </main>
    </div>
  )
}
