import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Aquarium, WaterAnalysis, Inhabitant, Note, MaintenanceAlert } from '../utils/types';
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
  maintenanceAlerts: MaintenanceAlert[];
  addMaintenanceAlert: (a: Omit<MaintenanceAlert, 'id'>) => void;
  updateMaintenanceAlert: (id: string, data: Partial<MaintenanceAlert>) => void;
  deleteMaintenanceAlert: (id: string) => void;
  loadData: () => Promise<void>;
  exportAquariumData: (aquariumId: string) => Promise<string>;
  importAquariumData: (json: string) => Promise<{ success: boolean; error?: string }>;
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
  const [maintenanceAlerts, setMaintenanceAlerts] = useState<MaintenanceAlert[]>([]);
  const [customAnalysisTypes, setCustomAnalysisTypes] = useState<string[]>([]);
  const [selectedAquariumId, setSelectedAquariumId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [a, w, i, n, m, c] = await Promise.all([
      aquariumStorage.getAquariums(),
      aquariumStorage.getWaterAnalyses(),
      aquariumStorage.getInhabitants(),
      aquariumStorage.getNotes(),
      aquariumStorage.getMaintenanceAlerts(),
      aquariumStorage.getCustomAnalysisTypes(),
    ]);
    setAquariums(a);
    setWaterAnalyses(w);
    setInhabitants(i);
    setNotes(n);
    setMaintenanceAlerts(m);
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
    try {
      const [currentAquariums, currentAnalyses, currentInhabitants, currentNotes, currentAlerts] =
        await Promise.all([
          aquariumStorage.getAquariums(),
          aquariumStorage.getWaterAnalyses(),
          aquariumStorage.getInhabitants(),
          aquariumStorage.getNotes(),
          aquariumStorage.getMaintenanceAlerts(),
        ]);

      const newAquariums = currentAquariums.filter((a) => a.id !== id);
      const newAnalyses = currentAnalyses.filter((x) => x.aquariumId !== id);
      const newInhabitants = currentInhabitants.filter((x) => x.aquariumId !== id);
      const newNotes = currentNotes.filter((x) => x.aquariumId !== id);
      const newAlerts = currentAlerts.filter((x) => x.aquariumId !== id);

      await Promise.all([
        aquariumStorage.saveAquariums(newAquariums),
        aquariumStorage.saveWaterAnalyses(newAnalyses),
        aquariumStorage.saveInhabitants(newInhabitants),
        aquariumStorage.saveNotes(newNotes),
        aquariumStorage.saveMaintenanceAlerts(newAlerts),
      ]);

      setAquariums(newAquariums);
      setWaterAnalyses(newAnalyses);
      setInhabitants(newInhabitants);
      setNotes(newNotes);
      setMaintenanceAlerts(newAlerts);
      setSelectedAquariumId(null);
    } catch (err) {
      console.error('Errore eliminazione acquario:', err);
    }
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

  const persistMaintenanceAlerts = useCallback(async (m: MaintenanceAlert[]) => {
    setMaintenanceAlerts(m);
    await aquariumStorage.saveMaintenanceAlerts(m);
  }, []);

  const addMaintenanceAlert = useCallback((a: Omit<MaintenanceAlert, 'id'>) => {
    const newA: MaintenanceAlert = { ...a, id: generateId() };
    persistMaintenanceAlerts([...maintenanceAlerts, newA]);
  }, [maintenanceAlerts, persistMaintenanceAlerts]);

  const updateMaintenanceAlert = useCallback((id: string, data: Partial<MaintenanceAlert>) => {
    const updated = maintenanceAlerts.map((a) => (a.id === id ? { ...a, ...data } : a));
    persistMaintenanceAlerts(updated);
  }, [maintenanceAlerts, persistMaintenanceAlerts]);

  const deleteMaintenanceAlert = useCallback((id: string) => {
    persistMaintenanceAlerts(maintenanceAlerts.filter((a) => a.id !== id));
  }, [maintenanceAlerts, persistMaintenanceAlerts]);

  const addCustomAnalysisType = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newTypes = customAnalysisTypes.includes(trimmed)
      ? customAnalysisTypes
      : [...customAnalysisTypes, trimmed];
    setCustomAnalysisTypes(newTypes);
    aquariumStorage.saveCustomAnalysisTypes(newTypes);
  }, [customAnalysisTypes]);

  const exportAquariumData = useCallback(async (aquariumId: string): Promise<string> => {
    const aq = aquariums.find((a) => a.id === aquariumId);
    if (!aq) return '';
    const analyses = waterAnalyses.filter((a) => a.aquariumId === aquariumId);
    const inhab = inhabitants.filter((i) => i.aquariumId === aquariumId);
    const n = notes.filter((n) => n.aquariumId === aquariumId);
    const alerts = maintenanceAlerts.filter((a) => a.aquariumId === aquariumId);
    const customTypes = Array.from(
      new Set([
        ...customAnalysisTypes,
        ...analyses
          .filter((x) => x.param === 'altro' && x.customParamName)
          .map((x) => x.customParamName!),
      ])
    );
    return JSON.stringify(
      {
        version: 1,
        exportedAt: new Date().toISOString(),
        aquarium: aq,
        waterAnalyses: analyses,
        inhabitants: inhab,
        notes: n,
        maintenanceAlerts: alerts,
        customAnalysisTypes: customTypes,
      },
      null,
      2
    );
  }, [aquariums, waterAnalyses, inhabitants, notes, maintenanceAlerts, customAnalysisTypes]);

  const importAquariumData = useCallback(async (json: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const data = JSON.parse(json);
      if (!data.aquarium || !data.aquarium.name) {
        return { success: false, error: 'File non valido: acquario mancante.' };
      }
      const newId = generateId();
      const newAq: Aquarium = {
        ...data.aquarium,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      const newAnalyses: WaterAnalysis[] = (data.waterAnalyses || []).map((a: WaterAnalysis) => ({
        ...a,
        id: generateId(),
        aquariumId: newId,
      }));
      const newInhab: Inhabitant[] = (data.inhabitants || []).map((i: Inhabitant) => ({
        ...i,
        id: generateId(),
        aquariumId: newId,
      }));
      const newNotes: Note[] = (data.notes || []).map((n: Note) => ({
        ...n,
        id: generateId(),
        aquariumId: newId,
      }));
      const newAlerts: MaintenanceAlert[] = (data.maintenanceAlerts || []).map((a: MaintenanceAlert) => ({
        ...a,
        id: generateId(),
        aquariumId: newId,
      }));
      const newCustomTypes = data.customAnalysisTypes || [];
      const mergedCustom = Array.from(
        new Set([...customAnalysisTypes, ...newCustomTypes])
      );

      await aquariumStorage.saveAquariums([...aquariums, newAq]);
      await aquariumStorage.saveWaterAnalyses([...waterAnalyses, ...newAnalyses]);
      await aquariumStorage.saveInhabitants([...inhabitants, ...newInhab]);
      await aquariumStorage.saveNotes([...notes, ...newNotes]);
      await aquariumStorage.saveMaintenanceAlerts([...maintenanceAlerts, ...newAlerts]);
      await aquariumStorage.saveCustomAnalysisTypes(mergedCustom);

      setAquariums((prev) => [...prev, newAq]);
      setWaterAnalyses((prev) => [...prev, ...newAnalyses]);
      setInhabitants((prev) => [...prev, ...newInhab]);
      setNotes((prev) => [...prev, ...newNotes]);
      setMaintenanceAlerts((prev) => [...prev, ...newAlerts]);
      setCustomAnalysisTypes(mergedCustom);
      setSelectedAquariumId(newId);
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : 'Errore durante l\'importazione.',
      };
    }
  }, [
    aquariums,
    waterAnalyses,
    inhabitants,
    notes,
    maintenanceAlerts,
    customAnalysisTypes,
  ]);

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
        maintenanceAlerts,
        addMaintenanceAlert,
        updateMaintenanceAlert,
        deleteMaintenanceAlert,
        loadData,
        exportAquariumData,
        importAquariumData,
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
