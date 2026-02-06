export interface SelectedChallenge {
  id: string;
  title: string;
  track: string;
  difficulty: string;
  estimated_minutes: number | null;
  estimated_time_unit: string;
  is_bonus: boolean;
  is_initial_active: boolean;
  predecessor_challenge_id: string | null;
}

export interface DailyChallenge {
  id: string;
  title: string;
  track: string;
  objective: string;
  difficulty: string;
  estimated_minutes: number | null;
  estimated_time_unit: string | null;
  is_bonus: boolean | null;
}
