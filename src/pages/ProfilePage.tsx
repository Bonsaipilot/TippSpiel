import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import { AVATARS } from '../lib/avatars'
import type { Profile } from '../types/database'

const SCORING_EXAMPLES = [
  {
    pts: 3,
    color: 'bg-green-600',
    label: 'Richtiges Ergebnis',
    desc: 'Exakt den richtigen Spielstand getippt.',
    example: 'Spiel endet 2:1 · Tipp war 2:1',
  },
  {
    pts: 2,
    color: 'bg-blue-600',
    label: 'Richtige Tordifferenz',
    desc: 'Tendenz und Tordifferenz stimmen, aber nicht der genaue Stand.',
    example: 'Spiel endet 3:1 · Tipp war 2:0 (beide Heimsieg mit +2)',
  },
  {
    pts: 1,
    color: 'bg-yellow-600',
    label: 'Richtige Tendenz',
    desc: 'Nur der Sieger (oder Unentschieden) wurde richtig getippt.',
    example: 'Spiel endet 2:0 · Tipp war 1:0 (beide Heimsieg)',
  },
  {
    pts: 0,
    color: 'bg-slate-600',
    label: 'Falsch getippt',
    desc: 'Tendenz war falsch.',
    example: 'Spiel endet 2:1 · Tipp war 1:2 (falscher Sieger)',
  },
]

function ScoringDialog({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-24"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70" />
      <div
        className="relative bg-slate-800 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <p className="text-white font-bold text-base">Wie werden Punkte vergeben?</p>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none">✕</button>
        </div>
        {SCORING_EXAMPLES.map(({ pts, color, label, desc, example }) => (
          <div key={pts} className="flex gap-3">
            <span className={`${color} text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5`}>
              {pts}
            </span>
            <div>
              <p className="text-white text-sm font-semibold">{label}</p>
              <p className="text-slate-400 text-xs mt-0.5">{desc}</p>
              <p className="text-slate-500 text-xs mt-1 italic">{example}</p>
            </div>
          </div>
        ))}
        <p className="text-slate-600 text-xs pt-1 border-t border-slate-700">
          Pro Spiel gibt es maximal 3 Punkte. Punkte werden nach dem Abpfiff automatisch vergeben.
        </p>
      </div>
    </div>
  )
}

const CATEGORIES = [
  { label: '😄 Smileys',    avatars: AVATARS.slice(0, 30) },
  { label: '🤖 Roboter',    avatars: AVATARS.slice(30, 40) },
  { label: '🧑 Menschen',   avatars: AVATARS.slice(40, 55) },
  { label: '🦑 Squid Game', avatars: AVATARS.slice(55, 60) },
]

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)
  const [showScoring, setShowScoring] = useState(false)
  const [showInstallHint] = useState(() => !isStandalone())
  const [copied, setCopied] = useState(false)

  const copyUrl = () => {
    navigator.clipboard.writeText('https://tippspiel-indol.vercel.app/login')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  useEffect(() => {
    if (!user) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => { if (data) setProfile(data as Profile) })
  }, [user])

  const selectAvatar = async (url: string) => {
    setSavingAvatar(true)
    const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user!.id)
    if (!error) setProfile(prev => prev ? { ...prev, avatar_url: url } : prev)
    setSavingAvatar(false)
    setShowPicker(false)
  }

  return (
    <div className="px-4 py-8 max-w-sm mx-auto space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <Avatar url={profile?.avatar_url} username={profile?.username} size="lg" />
        <div className="text-center">
          <p className="text-white font-bold text-lg">{profile?.username ?? '…'}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
        </div>
        <button
          onClick={() => setShowPicker(v => !v)}
          className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
        >
          {showPicker ? 'Schließen' : 'Profilbild anpassen'}
        </button>
      </div>

      {/* Avatar-Picker */}
      {showPicker && (
        <div className="bg-slate-800 rounded-xl p-4 space-y-4">
          {CATEGORIES.map(({ label, avatars }) => (
            <div key={label}>
              <p className="text-slate-500 text-xs font-semibold mb-2">{label}</p>
              <div className="grid grid-cols-5 gap-2">
                {avatars.map(a => {
                  const isSelected = profile?.avatar_url === a.url
                  return (
                    <button
                      key={a.id}
                      onClick={() => selectAvatar(a.url)}
                      disabled={savingAvatar}
                      className={`rounded-full overflow-hidden border-2 transition-all aspect-square ${
                        isSelected
                          ? 'border-blue-500 scale-110 shadow-lg shadow-blue-500/30'
                          : 'border-transparent hover:border-slate-500'
                      }`}
                    >
                      <img src={a.url} alt="" className="w-full h-full" />
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Punkte */}
      <div className="bg-slate-800 rounded-xl p-4 flex items-center justify-between">
        <span className="text-slate-400">Gesamtpunkte</span>
        <span className="text-white font-bold text-xl">{profile?.total_points ?? 0}</span>
      </div>

      {/* Punktewertung */}
      <div className="bg-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between mb-3">
          <p className="text-slate-400 text-sm font-semibold">Punktewertung</p>
          <button
            onClick={() => setShowScoring(true)}
            className="text-slate-500 hover:text-slate-300 transition-colors text-base leading-none"
            title="Erklärung anzeigen"
          >
            ℹ
          </button>
        </div>
        {[
          ['Richtiges Ergebnis', '3 Pkt'],
          ['Richtige Tordifferenz', '2 Pkt'],
          ['Richtige Tendenz', '1 Pkt'],
        ].map(([label, pts]) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-slate-300">{label}</span>
            <span className="text-white font-medium">{pts}</span>
          </div>
        ))}
      </div>
      {showScoring && <ScoringDialog onClose={() => setShowScoring(false)} />}

      {/* PWA install hint — only shown when not already installed */}
      {showInstallHint && (
        <div className="bg-slate-800 rounded-xl p-4 space-y-2">
          <p className="text-slate-300 text-sm font-semibold">📲 App auf dem Homescreen speichern</p>
          <p className="text-slate-400 text-xs leading-relaxed">So geht's auf dem iPhone:</p>
          <ol className="space-y-2 text-xs text-slate-400">
            <li>
              <span className="text-slate-300 font-medium">1.</span> Öffne diese Seite in <span className="text-slate-300 font-medium">Safari</span> (nicht Chrome)
              <div className="flex items-center gap-2 mt-1.5 bg-slate-700 rounded-lg px-2.5 py-1.5">
                <span className="text-slate-400 truncate flex-1 font-mono text-xs">tippspiel-indol.vercel.app/login</span>
                <button onClick={copyUrl} className="text-blue-400 hover:text-blue-300 font-medium shrink-0 transition-colors">
                  {copied ? '✓ Kopiert' : 'Kopieren'}
                </button>
              </div>
            </li>
            <li><span className="text-slate-300 font-medium">2.</span> Tippe in der Adressleiste auf den runden Button <span className="text-slate-300 font-medium">( ··· )</span></li>
            <li><span className="text-slate-300 font-medium">3.</span> Tippe auf das <span className="text-slate-300 font-medium">Teilen-Symbol</span> (Kästchen mit Pfeil ↑)</li>
            <li><span className="text-slate-300 font-medium">4.</span> Scrolle im Popup leicht nach unten und tippe auf <span className="text-slate-300 font-medium">„Zum Home-Bildschirm hinzufügen"</span></li>
            <li><span className="text-slate-300 font-medium">5.</span> Tippe auf <span className="text-slate-300 font-medium">„Hinzufügen"</span> – fertig! 🎉</li>
          </ol>
        </div>
      )}

      <button
        onClick={signOut}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition-colors"
      >
        Abmelden
      </button>
    </div>
  )
}
