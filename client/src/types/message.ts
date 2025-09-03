export interface Message {
  id: string;
  content: string;
  user_id: string;
  room_id: string;
  created_at: string;
  updated_at: string;
  word_count?: number;
  has_mentions?: boolean;
}