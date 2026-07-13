export interface PlanetPosition {
  name: string;
  house: string | number;
  degree: number;
  angle: number; // degree on the wheel, 0-360
}

export interface ChartSvgData {
  planets: PlanetPosition[];
}

export interface Kundli {
  id: string;
  planetary_positions: Record<string, any>;
  dasha_periods: Record<string, any>;
  chart_svg_data: ChartSvgData | null;
  created_at: string;
}