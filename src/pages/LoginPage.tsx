import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register' | 'forgot' | 'new-password'

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const { isRecovery } = useAuth()
  const [mode, setMode] = useState<Mode>(searchParams.get('code') ? 'register' : 'login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [inviteCode, setInviteCode] = useState(searchParams.get('code') ?? '')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) { setInviteCode(code); setMode('register') }
  }, [searchParams])

  useEffect(() => {
    if (isRecovery) { setMode('new-password'); setError(null); setInfo(null) }
  }, [isRecovery])

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    } else if (mode === 'forgot') {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/login',
      })
      if (error) setError(error.message)
      else setInfo('E-Mail gesendet! Klicke auf den Link darin, um dein Passwort zurückzusetzen.')
    } else if (mode === 'new-password') {
      if (password.length < 6) {
        setError('Passwort muss mindestens 6 Zeichen lang sein.')
        setLoading(false)
        return
      }
      const { error } = await supabase.auth.updateUser({ password })
      if (error) setError(error.message)
      else {
        await supabase.auth.signOut()
        setPassword('')
        setMode('login')
        setInfo('Passwort gespeichert! Bitte jetzt neu anmelden.')
      }
    } else {
      if (username.trim().length < 3) {
        setError('Benutzername muss mindestens 3 Zeichen lang sein.')
        setLoading(false)
        return
      }

      const { data: valid, error: codeError } = await supabase.rpc('verify_invite_code', {
        p_code: inviteCode.trim(),
      })
      if (codeError || !valid) {
        setError('Ungültiger Einladungscode.')
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username.trim() } },
      })
      if (error) {
        if (error.message.toLowerCase().includes('duplicate key') || error.message.toLowerCase().includes('unique')) {
          setError('Dieser Benutzername ist bereits vergeben. Bitte wähle einen anderen.')
        } else {
          setError(error.message)
        }
      } else {
        setInfo('Willkommen! 🎉 Konto erstellt – du wirst gleich weitergeleitet.')
      }
    }

    setLoading(false)
  }

  const inputClass = 'w-full bg-slate-700 text-white rounded-lg px-4 py-2.5 text-sm placeholder:text-slate-500 border border-slate-600 focus:outline-none focus:border-blue-500'

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚽</div>
          <h1 className="text-2xl font-bold text-white">WM 2026 Tippspiel</h1>
          <p className="text-slate-400 text-sm mt-1">USA · Kanada · Mexiko</p>
        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-xl">
          {(mode === 'login' || mode === 'register') && (
            <div className="flex rounded-lg bg-slate-700 p-1 mb-6">
              {(['login', 'register'] as Mode[]).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setMode(m); setError(null); setInfo(null); setShowPassword(false) }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    mode === m ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Anmelden' : 'Registrieren'}
                </button>
              ))}
            </div>
          )}

          {mode === 'forgot' && (
            <p className="text-slate-300 text-sm font-semibold mb-4">Passwort zurücksetzen</p>
          )}
          {mode === 'new-password' && (
            <p className="text-slate-300 text-sm font-semibold mb-4">Neues Passwort setzen</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Benutzername</label>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    placeholder="DeinName" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Einladungscode</label>
                  <input type="text" value={inviteCode} onChange={e => setInviteCode(e.target.value)}
                    placeholder="z.B. AB12CD34" required className={inputClass}
                    style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                </div>
              </>
            )}

            {mode !== 'new-password' && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">E-Mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="du@beispiel.de" required className={inputClass} />
              </div>
            )}

            {(mode === 'login' || mode === 'register' || mode === 'new-password') && (
              <div>
                <label className="block text-sm text-slate-300 mb-1">
                  {mode === 'new-password' ? 'Neues Passwort' : 'Passwort'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required minLength={6}
                    className={inputClass + ' pr-20'} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                  >
                    {showPassword ? 'verbergen' : 'anzeigen'}
                  </button>
                </div>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setInfo(null) }}
                    className="mt-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Passwort vergessen?
                  </button>
                )}
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            {info && (
              <p className="text-green-400 text-sm bg-green-950/40 border border-green-800 rounded-lg px-3 py-2">
                {info}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors">
              {loading ? 'Bitte warten…'
                : mode === 'login' ? 'Anmelden'
                : mode === 'forgot' ? 'Reset-Link senden'
                : mode === 'new-password' ? 'Passwort speichern'
                : 'Konto erstellen'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); setInfo(null) }}
                className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Zurück zur Anmeldung
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
