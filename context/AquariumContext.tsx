import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Aquarium, WaterAnalysis, Inhabitant, Note } from '../utils/types';
import { aquariumStorage } from '../storage/aquariumStorage';

interface AquariumContextType {
  aquariums: Aquarium[];
  customAnalysisTypes: string[];
  addCustomAnalysisType: (name: string) => void;
  addAquarium: (aq: Omit<Aquarium, 'id' | 'createdAt'>) => void;
  updateAquarium: (id: string, data: Partial<Aquarium>) => void;
  deleteAquarium: (id: string) => void;
  selectedAquariumId: string | null;
  setSelectedAquariumId: (id: string | null) => void;
  waterAnalyses: WaterAnalysis[];
  addWaterAnalysis: (a: Omit<WaterAnalysis, 'id'>) => void;
  updateWaterAnalysis: (id: string, data: Partial<WaterAnalysis>) => void;
  deleteWaterAnalysis: (id: string) => void;
  inhabitants: Inhabitant[];
  addInhabitant: (i: Omit<Inhabitant, 'id'>) => void;
  updateInhabitant: (id: string, data: Partial<Inhabitant>) => void;
  deleteInhabitant: (id: string) => void;
  notes: Note[];
  addNote: (n: Omit<Note, 'id'>) => void;
  updateNote: (id: string, data: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  loadData: () => Promise<void>;
}

const AquariumContext = createContext<AquariumContextType | null>(null);

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export function AquariumProvider({ children }: { children: React.ReactNode }) {
  const [aquariums, setAquariums] = useState<Aquarium[]>([]);
  const [waterAnalyses, setWaterAnalyses] = useState<WaterAnalysis[]>([]);
  const [inhabitants, setInhabitants] = useState<Inhabitant[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [customAnalysisTypes, setCustomAnalysisTypes] = useState<string[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [a, w, i, n, c] = await Promise.all([
      aquariumStorage.getAquariums(),
      aquariumStorage.getWaterAnalyses(),
      aquariumStorage.getInhabitants(),
      aquariumStorage.getNotes(),
      aquariumStorage.getCustomAnalysisTypes(),
    ]);
    setAquariums(a);
    setWaterAnalyses(w);
    setInhabitants(i);
    setNotes(n);
    setCustomAnalysisTypes(c);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const persistAquariums = useCallback(async (a: Aquarium[]) => {
    setAquariums(a);
    await aquariumStorage.saveAquariums(a);
  }, []);

  const persistWaterAnalyses = useCallback(async (w: WaterAnalysis[]) => {
    setWaterAnalyses(w);
    await aquariumStorage.saveWaterAnalyses(w);
  }, []);

  const persistInhabitants = useCallback(async (i: Inhabitant[]) => {
    setInhabitants(i);
    await aquariumStorage.saveInhabitants(i);
  }, []);

  const persistNotes = useCallback(async (n: Note[]) => {
    setNotes(n);
    await aquariumStorage.saveNotes(n);
  }, []);

  const addAquarium = useCallback((aq: Omit<Aquarium, 'id' | 'createdAt'>) => {
    const newAq: Aquarium = {
      ...aq,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    persistAquariums([...aquariums, newAq]);
  }, [aquariums, persistAquariums]);

  const updateAquarium = useCallback((id: string, data: Partial<Aquarium>) => {
    const updated = aquariums.map((a) => (a.id === id ? { ...a, ...data } : a));
    persistAquariums(updated);
  }, [aquariums, persistAquariums]);

  const deleteAquarium = useCallback(async (id: string) => {
    const [currentAquariums, currentAnalyses, currentInhabitants, currentNotes] =
      await Promise.all([
        aquariumStorage.getAquariums(),
        aquariumStorage.getWaterAnalyses(),
        aquariumStorage.getInhabitants(),
        aquariumStorage.getNotes(),
      ]);

    const newAquariums = currentAquariums.filter((a) => a.id !== id);
    const newAnalyses = currentAnalyses.filter((x) => x.aquariumId !== id);
    const newInhabitants = currentInhabitants.filter((x) => x.aquariumId !== id);
    const newNotes = currentNotes.filter((x) => x.aquariumId !== id);

    await aquariumStorage.saveAquariums(newAquariums);
    await aquariumStorage.saveWaterAnalyses(newAnalyses);
    await aquariumStorage.saveInhabitants(newInhabitants);
    await aquariumStorage.saveNotes(newNotes);

    setAquariums(newAquariums);
    setWaterAnalyses(newAnalyses);
    setInhabitants(newInhabitants);
    setNotes(newNotes);
    setSelectedAquariumId(null);
  }, []);

  const addWaterAnalysis = useCallback((a: Omit<WaterAnalysis, 'id'>) => {
    const newA: WaterAnalysis = { ...a, id: generateId() };
    persistWaterAnalyses([...waterAnalyses, newA]);
  }, [waterAnalyses, persistWaterAnalyses]);

  const updateWaterAnalysis = useCallback((id: string, data: Partial<WaterAnalysis>) => {
    const updated = waterAnalyses.map((a) => (a.id === id ? { ...a, ...data } : a));
    persistWaterAnalyses(updated);
  }, [waterAnalyses, persistWaterAnalyses]);

  const deleteWaterAnalysis = useCallback((id: string) => {
    persistWaterAnalyses(waterAnalyses.filter((a) => a.id !== id));
  }, [waterAnalyses, persistWaterAnalyses]);

  const addInhabitant = useCallback((i: Omit<Inhabitant, 'id'>) => {
    const newI: Inhabitant = { ...i, id: generateId() };
    persistInhabitants([...inhabitants, newI]);
  }, [inhabitants, persistInhabitants]);

  const updateInhabitant = useCallback((id: string, data: Partial<Inhabitant>) => {
    const updated = inhabitants.map((i) => (i.id === id ? { ...i, ...data } : i));
    persistInhabitants(updated);
  }, [inhabitants, persistInhabitants]);

  const deleteInhabitant = useCallback((id: string) => {
    persistInhabitants(inhabitants.filter((i) => i.id !== id));
  }, [inhabitants, persistInhabitants]);

  const addNote = useCallback((n: Omit<Note, 'id'>) => {
    const newN: Note = { ...n, id: generateId() };
    persistNotes([...notes, newN]);
  }, [notes, persistNotes]);

  const updateNote = useCallback((id: string, data: Partial<Note>) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, ...data } : n));
    persistNotes(updated);
  }, [notes, persistNotes]);

  const deleteNote = useCallback((id: string) => {
    persistNotes(notes.filter((n) => n.id !== id));
  }, [notes, persistNotes]);

  const addCustomAnalysisType = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newTypes = customAnalysisTypes.includes(trimmed)
      ? customAnalysisTypes
      : [...customAnalysisTypes, trimmed];
    setCustomAnalysisTypes(newTypes);
    aquariumStorage.saveCustomAnalysisTypes(newTypes);
  }, [customAnalysisTypes]);

  return (
    <AquariumContext.Provider
      value={{
        aquariums,
        customAnalysisTypes,
        addCustomAnalysisType,
        addAquarium,
        updateAquarium,
        deleteAquarium,
        selectedAquariumId,
        setSelectedAquariumId,
        waterAnalyses,
        addWaterAnalysis,
        updateWaterAnalysis,
        deleteWaterAnalysis,
        inhabitants,
        addInhabitant,
        updateInhabitant,
        deleteInhabitant,
        notes,
        addNote,
        updateNote,
        deleteNote,
        loadData,
      }}
    >
      {children}
    </AquariumContext.Provider>
  );
}

export function useAquarium() {
  const ctx = useContext(AquariumContext);
  if (!ctx) throw new Error('useAquarium must be used within AquariumProvider');
  return ctx;
}
