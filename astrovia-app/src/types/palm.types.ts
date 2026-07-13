export interface LinePoint {
  x: number;
  y: number;
}

export interface LineCoordinates {
  heart_line: LinePoint[];
  head_line: LinePoint[];
  life_line: LinePoint[];
  fate_line: LinePoint[] | null;
}

export interface Interpretation {
  heart_line: string;
  head_line: string;
  life_line: string;
  fate_line: string | null;
  summary: string;
}

export interface PalmReading {
  id: string;
  image_url: string | null;
  line_coordinates: LineCoordinates;
  matched_pattern_id: string | null;
  match_score: number | null;
  interpretation: Interpretation;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
}