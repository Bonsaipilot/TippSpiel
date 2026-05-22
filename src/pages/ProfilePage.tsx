import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import { AVATARS } from '../lib/avatars'
import type { Profile } from '../types/database'

const CATEGORIES = [
  { label: '😄 Smileys',    avatars: AVATARS.slice(0, 30) },
  { label: '🤖 Roboter',    avatars: AVATARS.slice(30, 40) },
  { label: '🧑 Menschen',   avatars: AVATARS.slice(40, 55) },
  { label: '🦑 Squid Game', avatars: AVATARS.slice(55, 60) },
]

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [savingAvatar, setSavingAvatar] = useState(false)

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
        <p className="text-slate-400 text-sm font-semibold mb-3">Punktewertung</p>
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

      <button
        onClick={signOut}
        className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium py-3 rounded-xl transition-colors"
      >
        Abmelden
      </button>
    </div>
  )
}
