import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import Avatar from '../components/Avatar'
import type { Profile } from '../types/database'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('profiles')
      .select('*, champion_team:champion_team_id(id,name,flag,code)')
      .order('total_points', { ascending: false })
      .then(({ data }) => {
        if (data) setProfiles(data as Profile[])
        setLoading(false)
      })
  }, [])

  const medalFor = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
  }

  return (
    <div className="px-4 py-4">
      <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
        Rangliste
      </h2>

      {loading ? (
        <p className="text-slate-500 text-center py-8">Lade…</p>
      ) : profiles.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Noch keine Teilnehmer.</p>
      ) : (
        <div className="space-y-2">
          {profiles.map((p, i) => {
            const rank = i + 1
            const isMe = p.id === user?.id
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 ${
                  isMe ? 'bg-blue-900/40 border border-blue-700' : 'bg-slate-800'
                }`}
              >
                <span className="w-7 text-center font-bold text-slate-400 shrink-0">
                  {medalFor(rank) ?? rank}
                </span>
                <Avatar url={p.avatar_url} username={p.username} size="sm" />
                <span className={`flex-1 font-medium truncate ${isMe ? 'text-blue-300' : 'text-white'}`}>
                  {p.username}
                  {isMe && <span className="text-blue-500 text-xs ml-1">(du)</span>}
                </span>
                {p.champion_team && (
                  <span className="text-lg shrink-0" title={`Weltmeister-Tipp: ${p.champion_team.name}`}>
                    {p.champion_team.flag}
                  </span>
                )}
                <span className="text-white font-bold shrink-0">{p.total_points} Pkt</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
