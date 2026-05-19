export interface Group {
  id: number
  name: string
}

export interface Team {
  id: number
  name: string
  code: string
  flag: string | null
  group_id: number | null
  group?: { id: number; name: string } | null
}

export interface Match {
  id: number
  home_team_id: number | null
  away_team_id: number | null
  home_score: number | null
  away_score: number | null
  kickoff: string
  stage: 'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'final'
  group_id: number | null
  venue: string | null
  is_finished: boolean
  home_team?: Team | null
  away_team?: Team | null
  group?: Group | null
}

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  total_points: number
  is_admin: boolean
  created_at: string
}

export interface Tip {
  id: number
  user_id: string
  match_id: number
  home_score: number
  away_score: number
  points: number | null
  created_at: string
  updated_at: string
}
