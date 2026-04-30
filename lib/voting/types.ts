// Tipos del feature de votación grupal
export type VoteType = "up" | "down" | "meh";

export interface Vote {
  id: string;
  trip_id: string;
  activity_id: string;
  voter_session_id: string;
  voter_name: string;
  voter_user_id: string | null;
  vote: VoteType;
  created_at: string;
}

export interface TripInvitee {
  id: string;
  trip_id: string;
  voter_session_id: string;
  voter_name: string;
  voter_email: string | null;
  voter_user_id: string | null;
  first_visited_at: string;
  last_active_at: string;
  vote_count: number;
}

export interface VoteSummary {
  activity_id: string;
  up: number;
  down: number;
  meh: number;
  total: number;
  voters_up: string[]; // nombres de quienes votaron up
  voters_down: string[];
  voters_meh: string[];
}

export interface TripVotingSummary {
  trip_id: string;
  invitees_count: number;
  total_votes: number;
  by_activity: VoteSummary[];
  invitees: Array<{
    name: string;
    vote_count: number;
    last_active_at: string;
  }>;
}
