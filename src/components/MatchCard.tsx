import React, { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Match, Tip } from '../types/database'

interface Props {
  match: Match
  tip: Tip | undefined
  userId: string
  onTipDeleted?: (matchId: number) => void
  onTipSaved?: (matchId: number, homeScore: number, awayScore: number) => void
  homeInputRef?: React.RefObject<HTMLInputElement | null>
  onAwayDone?: () => void
}

const stageLabel: Record<string, string> = {
  group: 'Gruppenphase',
  r32: 'Runde der 32',
  r16: 'Achtelfinale',
  qf: 'Viertelfinale',
  sf: 'Halbfinale',
  final: 'Finale',
}

function formatKickoff(iso: string) {
  return new Date(iso).toLocaleString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function pointsBadge(points: number) {
  if (points === 3) return 'bg-green-600'
  if (points === 2) return 'bg-blue-600'
  if (points === 1) return 'bg-yellow-600'
  return 'bg-slate-600'
}

export default function MatchCard({ match, tip, userId, onTipDeleted, onTipSaved, homeInputRef, onAwayDone }: Props) {
  const isLocked = new Date(match.kickoff) <= new Date() || match.is_finished

  const [home, setHome] = useState<string>(tip?.home_score?.toString() ?? '')
  const [away, setAway] = useState<string>(tip?.away_score?.toString() ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(tip != null)
  const [hasTip, setHasTip] = useState(tip != null)
  const [error, setError] = useState<string | null>(null)
  const awayRef = useRef<HTMLInputElement>(null)
  const isFirstRender = useRef(true)

  // Auto-save 700ms after last change (when both fields are valid)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    if (isLocked) return
    const h = parseInt(home)
    const a = parseInt(away)
    if (isNaN(h) || isNaN(a) || h < 0 || a < 0) return

    const timer = setTimeout(async () => {
      setSaving(true); setError(null)
      const { error } = await supabase.from('tips').upsert(
        { user_id: userId, match_id: match.id, home_score: h, away_score: a },
        { onConflict: 'user_id,match_id' }
      )
      setSaving(false)
      if (error) setError('Fehler beim Speichern.')
      else { setSaved(true); setHasTip(true); onTipSaved?.(match.id, h, a) }
    }, 700)

    return () => clearTimeout(timer)
  }, [home, away]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleHomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setHome(v)
    setSaved(false)
    if (v.length === 1 && awayRef.current) {
      awayRef.current.focus({ preventScroll: true })
    }
  }

  const handleAwayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setAway(v)
    setSaved(false)
    if (v.length === 1) onAwayDone?.()
  }

  const revertTip = async () => {
    setSaving(true)
    const { error } = await supabase.rpc('delete_my_tip', { p_match_id: match.id })
    setSaving(false)
    if (error) { setError('Fehler: ' + error.message); return }
    setHome(''); setAway(''); setSaved(false); setHasTip(false)
  onTipDeleted?.(match.id)
  }

  const homeTeam = match.home_team
  const awayTeam = match.away_team

  return (
    <div className="bg-slate-800 rounded-xl p-4 space-y-3">
      {/* Teams + Scores */}
      <div className="flex items-center gap-2">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-2xl">{homeTeam?.flag ?? '🏳️'}</span>
          <span className="text-xs text-slate-300 font-medium truncate w-full text-center">
            {homeTeam?.name ?? 'TBD'}
          </span>
        </div>

        {/* Score input or result */}
        <div className="flex items-center gap-2 shrink-0">
          {match.is_finished ? (
            <div className="flex items-center gap-2 text-xl font-bold">
              <span className="text-white">{match.home_score}</span>
              <span className="text-slate-500">:</span>
              <span className="text-white">{match.away_score}</span>
            </div>
          ) : isLocked ? (
            <div className="flex items-center gap-2 text-slate-400 font-semibold">
              <span>{tip?.home_score ?? '–'}</span>
              <span>:</span>
              <span>{tip?.away_score ?? '–'}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                ref={homeInputRef}
                type="number" min={0} max={99} value={home}
                onChange={handleHomeChange}
                className="w-10 text-center bg-slate-700 text-white rounded-lg py-1.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
              />
              <span className="text-slate-500 font-bold">:</span>
              <input
                ref={awayRef}
                type="number" min={0} max={99} value={away}
                onChange={handleAwayChange}
                className="w-10 text-center bg-slate-700 text-white rounded-lg py-1.5 text-sm border border-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
          <span className="text-2xl">{awayTeam?.flag ?? '🏳️'}</span>
          <span className="text-xs text-slate-300 font-medium truncate w-full text-center">
            {awayTeam?.name ?? 'TBD'}
          </span>
        </div>
      </div>

      {/* Mein Tipp bei laufendem/beendetem Spiel */}
      {(isLocked || match.is_finished) && tip && (
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
          <span>Mein Tipp: {tip.home_score}:{tip.away_score}</span>
          {match.is_finished && tip.points != null && (
            <span className={`px-2 py-0.5 rounded-full text-white font-semibold ${pointsBadge(tip.points)}`}>
              {tip.points} Pkt
            </span>
          )}
        </div>
      )}

      {/* Kickoff + Stage */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>{stageLabel[match.stage] ?? match.stage}</span>
        <span>{formatKickoff(match.kickoff)}</span>
      </div>

      {match.venue && (
        <p className="text-xs text-slate-600 text-center -mt-1">{match.venue}</p>
      )}

      {/* Status + Revert */}
      {!isLocked && (
        <div className="space-y-1">
          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
          <div className="flex items-center gap-2">
            <div className="flex-1 text-xs">
              {saving
                ? <span className="text-slate-400">Speichere…</span>
                : saved
                  ? <span className="text-green-400">✓ Gespeichert</span>
                  : (home !== '' || away !== '')
                    ? <span className="text-slate-500">Nicht gespeichert</span>
                    : null}
            </div>
            <button
              onClick={revertTip}
              disabled={saving || !hasTip}
              title="Tipp löschen"
              className="px-3 py-1.5 rounded-lg text-sm bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400 hover:enabled:bg-slate-600 hover:enabled:text-white transition-colors"
            >
              ↩
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
