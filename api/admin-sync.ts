import type { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const FOOTBALL_API_BASE = 'https://api.football-data.org/v4'
const WC_START = new Date('2026-06-11')
const WC_END   = new Date('2026-07-20')

const CODE_MAP: Record<string, string> = {}

function toApiCode(dbCode: string): string {
  return CODE_MAP[dbCode] ?? dbCode
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  // Admin-Check via Supabase JWT
  const token = req.headers['authorization']?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const { data: { user }, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !user) return res.status(401).json({ error: 'Invalid token' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return res.status(403).json({ error: 'Kein Admin' })

  const now = new Date()
  if (now < WC_START || now > WC_END) {
    return res.status(200).json({ message: 'Außerhalb WM-Zeitraum' })
  }

  try {
    const apiRes = await fetch(
      `${FOOTBALL_API_BASE}/competitions/WC/matches?status=FINISHED`,
      { headers: { 'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY! } }
    )
    if (!apiRes.ok) throw new Error(`API ${apiRes.status}: ${await apiRes.text()}`)
    const { matches: apiMatches } = await apiRes.json()

    const { data: dbMatches, error: dbErr } = await supabase
      .from('matches')
      .select('id, kickoff, home_team:home_team_id(code), away_team:away_team_id(code)')
      .eq('is_finished', false)
      .not('home_team_id', 'is', null)

    if (dbErr) throw dbErr
    if (!dbMatches?.length) return res.status(200).json({ message: 'Keine offenen Spiele', updated: 0 })

    let updated = 0
    const unmatched: string[] = []
    const apiTotal = apiMatches.length

    for (const m of apiMatches) {
      const homeScore = m.score?.fullTime?.home
      const awayScore = m.score?.fullTime?.away
      if (homeScore == null || awayScore == null) continue

      const apiTime = new Date(m.utcDate).getTime()
      const homeTLA = (m.homeTeam?.tla ?? '').toUpperCase()
      const awayTLA = (m.awayTeam?.tla ?? '').toUpperCase()

      const dbMatch = dbMatches.find(db => {
        const timeDiff = Math.abs(new Date(db.kickoff).getTime() - apiTime)
        const sameSlot  = timeDiff < 2 * 60 * 60 * 1000
        const homeMatch = toApiCode((db.home_team as unknown as { code: string })?.code ?? '') === homeTLA
        const awayMatch = toApiCode((db.away_team as unknown as { code: string })?.code ?? '') === awayTLA
        return sameSlot && homeMatch && awayMatch
      })

      if (!dbMatch) { unmatched.push(`${homeTLA} vs ${awayTLA}`); continue }

      const { error } = await supabase.rpc('finish_match', {
        p_match_id:   dbMatch.id,
        p_home_score: homeScore,
        p_away_score: awayScore,
      })
      if (!error) updated++
    }

    // Champion auto-set
    const { data: setting } = await supabase
      .from('settings').select('value').eq('key', 'champion_team_id').single()
    if (!setting?.value || setting.value === '0') {
      const { data: finalMatch } = await supabase
        .from('matches')
        .select('home_score, away_score, home_team:home_team_id(id), away_team:away_team_id(id)')
        .eq('stage', 'final').eq('is_finished', true).single()

      if (finalMatch && finalMatch.home_score != null && finalMatch.away_score != null
          && finalMatch.home_score !== finalMatch.away_score) {
        const winner = finalMatch.home_score > finalMatch.away_score
          ? (finalMatch.home_team as unknown as { id: number } | null)
          : (finalMatch.away_team as unknown as { id: number } | null)
        if (winner?.id) await supabase.rpc('set_champion', { p_team_id: winner.id })
      }
    }

    return res.status(200).json({ updated, skipped: unmatched.length, unmatched, apiTotal, dbOpen: dbMatches.length })
  } catch (err) {
    console.error('[admin-sync]', err)
    return res.status(500).json({ error: String(err) })
  }
}
