import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Aquarium, WaterAnalysis, Inhabitant, Note, MaintenanceAlert } from '../utils/types';

const KEYS = {
  AQUARIUMS: '@aquarium_app_aquariums',
  WATER_ANALYSES: '@aquarium_app_water_analyses',
  INHABITANTS: '@aquarium_app_inhabitants',
  NOTES: '@aquarium_app_notes',
  MAINTENANCE_ALERTS: '@aquarium_app_maintenance_alerts',
  CUSTOM_ANALYSIS_TYPES: '@aquarium_app_custom_analysis_types',
};

export const aquariumStorage = {
  async getAquariums(): Promise<Aquarium[]> {
    const data = await AsyncStorage.getItem(KEYS.AQUARIUMS);
    return data ? JSON.parse(data) : [];
  },

  async saveAquariums(aquariums: Aquarium[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.AQUARIUMS, JSON.stringify(aquariums));
  },

  async getWaterAnalyses(): Promise<WaterAnalysis[]> {
    const data = await AsyncStorage.getItem(KEYS.WATER_ANALYSES);
    return data ? JSON.parse(data) : [];
  },

  async saveWaterAnalyses(analyses: WaterAnalysis[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.WATER_ANALYSES, JSON.stringify(analyses));
  },

  async getInhabitants(): Promise<Inhabitant[]> {
    const data = await AsyncStorage.getItem(KEYS.INHABITANTS);
    return data ? JSON.parse(data) : [];
  },

  async saveInhabitants(inhabitants: Inhabitant[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.INHABITANTS, JSON.stringify(inhabitants));
  },

  async getNotes(): Promise<Note[]> {
    const data = await AsyncStorage.getItem(KEYS.NOTES);
    return data ? JSON.parse(data) : [];
  },

  async getCustomAnalysisTypes(): Promise<string[]> {
    const data = await AsyncStorage.getItem(KEYS.CUSTOM_ANALYSIS_TYPES);
    return data ? JSON.parse(data) : [];
  },

  async saveCustomAnalysisTypes(types: string[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.CUSTOM_ANALYSIS_TYPES, JSON.stringify(types));
  },

  async saveNotes(notes: Note[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
  },

  async getMaintenanceAlerts(): Promise<MaintenanceAlert[]> {
    const data = await AsyncStorage.getItem(KEYS.MAINTENANCE_ALERTS);
    return data ? JSON.parse(data) : [];
  },

  async saveMaintenanceAlerts(alerts: MaintenanceAlert[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.MAINTENANCE_ALERTS, JSON.stringify(alerts));
  },

  async exportAllData(): Promise<string> {
    const [aquariums, analyses, inhabitants, notes, maintenanceAlerts] = await Promise.all([
      this.getAquariums(),
      this.getWaterAnalyses(),
      this.getInhabitants(),
      this.getNotes(),
      this.getMaintenanceAlerts(),
    ]);
    return JSON.stringify(
      { aquariums, analyses, inhabitants, notes, maintenanceAlerts },
      null,
      2
    );
  },
};
