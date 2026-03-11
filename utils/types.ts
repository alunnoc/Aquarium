export type AquariumType = 'dolce' | 'marino';

export interface Aquarium {
  id: string;
  name: string;
  liters?: number;
  type: AquariumType;
  coverImage?: string;
  createdAt: string;
  description?: string;
  extraPhoto?: string;
  dimensions?: string;
  filterType?: string;
  startDate?: string;
}

export type WaterTestParam = 'pH' | 'GH' | 'KH' | 'NO2' | 'NO3' | 'NH3' | 'temperatura' | 'altro';

export interface WaterAnalysis {
  id: string;
  aquariumId: string;
  param: WaterTestParam;
  value: number;
  date: string;
  customParamName?: string;
}

export type InhabitantCategory = 'pesce' | 'pianta' | 'invertebrato' | 'corallo';

export interface Inhabitant {
  id: string;
  aquariumId: string;
  name: string;
  category: InhabitantCategory;
  quantity: number;
  notes?: string;
  photo?: string;
  speciesId?: string;
}

export interface Note {
  id: string;
  aquariumId: string;
  title: string;
  content: string;
  date: string;
}
