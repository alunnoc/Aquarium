export interface SpeciesInfo {
  id: string;
  name: string;
  category: 'pesce' | 'pianta' | 'invertebrato' | 'corallo';
  waterType: 'dolce' | 'marino';
  pHMin?: number;
  pHMax?: number;
  tempMin?: number;
  tempMax?: number;
  ghMin?: number;
  ghMax?: number;
  minLiters?: number;
  difficulty?: 'facile' | 'medio' | 'difficile';
  description?: string;
}

export const SPECIES_CATALOG: SpeciesInfo[] = [
  // Pesci acqua dolce
  {
    id: 'neon-tetra',
    name: 'Neon tetra',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 7,
    tempMin: 21,
    tempMax: 26,
    ghMin: 1,
    ghMax: 10,
    minLiters: 40,
    difficulty: 'facile',
    description: 'Pesce piccolo e pacifico, ideale per acquari di comunità',
  },
  {
    id: 'guppy',
    name: 'Guppy',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6.8,
    pHMax: 7.8,
    tempMin: 22,
    tempMax: 28,
    ghMin: 8,
    ghMax: 12,
    minLiters: 40,
    difficulty: 'facile',
    description: 'Molto vivace, si riproduce facilmente',
  },
  {
    id: 'platy',
    name: 'Platy',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6.8,
    pHMax: 8,
    tempMin: 22,
    tempMax: 28,
    minLiters: 50,
    difficulty: 'facile',
    description: 'Pesce robusto e colorato, adatto ai principianti',
  },
  {
    id: 'molly',
    name: 'Molly',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 7,
    pHMax: 8.5,
    tempMin: 24,
    tempMax: 28,
    ghMin: 10,
    ghMax: 25,
    minLiters: 60,
    difficulty: 'facile',
    description: 'Preferisce acqua leggermente salmastra',
  },
  {
    id: 'pesce-betta',
    name: 'Pesce Betta',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 7.5,
    tempMin: 24,
    tempMax: 30,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Pesce solitario, maschi aggressivi tra loro',
  },
  {
    id: 'danio-zebrato',
    name: 'Danio zebrato',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6.5,
    pHMax: 7.2,
    tempMin: 18,
    tempMax: 26,
    minLiters: 60,
    difficulty: 'facile',
    description: 'Molto attivo, preferisce vivere in gruppo',
  },
  {
    id: 'rasbora-eteromorfa',
    name: 'Rasbora eteromorfa',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 5.5,
    pHMax: 7,
    tempMin: 23,
    tempMax: 28,
    ghMin: 1,
    ghMax: 10,
    minLiters: 60,
    difficulty: 'medio',
    description: 'Preferisce acqua acida e tenera',
  },
  {
    id: 'corydora',
    name: 'Corydora',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 8,
    tempMin: 22,
    tempMax: 28,
    minLiters: 60,
    difficulty: 'facile',
    description: 'Pesce da fondo, pacifico, vive in gruppo',
  },
  {
    id: 'ancistrus',
    name: 'Ancistrus',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 7.5,
    tempMin: 22,
    tempMax: 28,
    minLiters: 80,
    difficulty: 'facile',
    description: 'Pulitore di alghe, pesce da fondo',
  },
  {
    id: 'discus',
    name: 'Discus',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 5.5,
    pHMax: 7,
    tempMin: 26,
    tempMax: 30,
    ghMin: 1,
    ghMax: 8,
    minLiters: 200,
    difficulty: 'difficile',
    description: 'Re dell\'acquario, richiede acqua molto tenera',
  },
  {
    id: 'scalare',
    name: 'Scalare',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 7.5,
    tempMin: 24,
    tempMax: 30,
    minLiters: 100,
    difficulty: 'medio',
    description: 'Elegante, necessita di acquario alto',
  },
  {
    id: 'cardinale',
    name: 'Neon cardinale',
    category: 'pesce',
    waterType: 'dolce',
    pHMin: 5.5,
    pHMax: 7,
    tempMin: 23,
    tempMax: 27,
    ghMin: 1,
    ghMax: 10,
    minLiters: 60,
    difficulty: 'medio',
    description: 'Simile al neon tetra ma con striscia rossa più estesa',
  },
  // Piante
  {
    id: 'anubias',
    name: 'Anubias',
    category: 'pianta',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 8,
    tempMin: 22,
    tempMax: 28,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Pianta robusta, non va interrata nel substrato',
  },
  {
    id: 'java-fern',
    name: 'Felce di Java',
    category: 'pianta',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 8,
    tempMin: 20,
    tempMax: 28,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Pianta molto resistente, ideale per principianti',
  },
  {
    id: 'echinodorus',
    name: 'Echinodorus',
    category: 'pianta',
    waterType: 'dolce',
    pHMin: 6.5,
    pHMax: 7.5,
    tempMin: 22,
    tempMax: 28,
    minLiters: 60,
    difficulty: 'facile',
    description: 'Pianta a rosetta, molte varietà disponibili',
  },
  {
    id: 'cryptocoryne',
    name: 'Cryptocoryne',
    category: 'pianta',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 8,
    tempMin: 22,
    tempMax: 28,
    minLiters: 40,
    difficulty: 'facile',
    description: 'Pianta da fondo, adatta a varie condizioni',
  },
  {
    id: 'vesicularia',
    name: 'Muschio di Java',
    category: 'pianta',
    waterType: 'dolce',
    pHMin: 5.5,
    pHMax: 8,
    tempMin: 18,
    tempMax: 30,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Muschio versatile, usato per legni e rocce',
  },
  // Invertebrati
  {
    id: 'neocaridina',
    name: 'Gamberetto Neocaridina',
    category: 'invertebrato',
    waterType: 'dolce',
    pHMin: 6.5,
    pHMax: 8,
    tempMin: 18,
    tempMax: 28,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Gamberetti colorati, ottimi pulitori',
  },
  {
    id: 'caridina',
    name: 'Caridina',
    category: 'invertebrato',
    waterType: 'dolce',
    pHMin: 6,
    pHMax: 7.5,
    tempMin: 22,
    tempMax: 26,
    ghMin: 4,
    ghMax: 10,
    minLiters: 30,
    difficulty: 'medio',
    description: 'Gamberetti sensibili, richiedono acqua stabile',
  },
  {
    id: 'neritina',
    name: 'Neritina',
    category: 'invertebrato',
    waterType: 'dolce',
    pHMin: 6.5,
    pHMax: 8.5,
    tempMin: 22,
    tempMax: 28,
    minLiters: 20,
    difficulty: 'facile',
    description: 'Lumaca ottima contro le alghe',
  },
  {
    id: 'ampullaria',
    name: 'Ampullaria',
    category: 'invertebrato',
    waterType: 'dolce',
    pHMin: 6.5,
    pHMax: 8,
    tempMin: 18,
    tempMax: 28,
    minLiters: 40,
    difficulty: 'facile',
    description: 'Lumaca grande, mangia anche le piante',
  },
  // Pesci marini
  {
    id: 'pesce-pagliaccio',
    name: 'Pesce pagliaccio',
    category: 'pesce',
    waterType: 'marino',
    pHMin: 8.1,
    pHMax: 8.4,
    tempMin: 24,
    tempMax: 27,
    minLiters: 100,
    difficulty: 'medio',
    description: 'Iconico pesce marino, vive in simbiosi con anemoni',
  },
  {
    id: 'gobide',
    name: 'Gobide',
    category: 'pesce',
    waterType: 'marino',
    pHMin: 8.1,
    pHMax: 8.4,
    tempMin: 24,
    tempMax: 27,
    minLiters: 80,
    difficulty: 'facile',
    description: 'Pesce da fondo, pacifico',
  },
  // Coralli
  {
    id: 'zoanthus',
    name: 'Zoanthus',
    category: 'corallo',
    waterType: 'marino',
    pHMin: 8.1,
    pHMax: 8.4,
    tempMin: 24,
    tempMax: 27,
    minLiters: 50,
    difficulty: 'facile',
    description: 'Corallo molle colorato, adatto ai principianti',
  },
  {
    id: 'mushroom',
    name: 'Funghi (Discosoma)',
    category: 'corallo',
    waterType: 'marino',
    pHMin: 8.1,
    pHMax: 8.4,
    tempMin: 24,
    tempMax: 27,
    minLiters: 50,
    difficulty: 'facile',
    description: 'Corallo molle resistente',
  },
];

export function getSpeciesByCategory(category: SpeciesInfo['category']): SpeciesInfo[] {
  return SPECIES_CATALOG.filter((s) => s.category === category);
}

export function getSpeciesForAquarium(
  waterType: 'dolce' | 'marino',
  category: SpeciesInfo['category']
): SpeciesInfo[] {
  return SPECIES_CATALOG.filter(
    (s) => s.category === category && s.waterType === waterType
  );
}

export function searchSpecies(
  species: SpeciesInfo[],
  query: string
): SpeciesInfo[] {
  const q = query.trim().toLowerCase();
  if (!q) return species;
  return species.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      (s.description?.toLowerCase().includes(q))
  );
}

export function getSpeciesById(id: string): SpeciesInfo | undefined {
  return SPECIES_CATALOG.find((s) => s.id === id);
}

export function formatSpeciesParams(species: SpeciesInfo): string {
  const parts: string[] = [];
  if (species.pHMin != null && species.pHMax != null) {
    parts.push(`pH ${species.pHMin}-${species.pHMax}`);
  }
  if (species.tempMin != null && species.tempMax != null) {
    parts.push(`${species.tempMin}-${species.tempMax}°C`);
  }
  if (species.ghMin != null && species.ghMax != null) {
    parts.push(`GH ${species.ghMin}-${species.ghMax}`);
  }
  if (species.minLiters != null) {
    parts.push(`min ${species.minLiters}L`);
  }
  return parts.join(' • ');
}
