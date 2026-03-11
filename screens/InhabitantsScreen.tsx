import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAquarium } from '../context/AquariumContext';
import { Card } from '../components/Card';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { colors, spacing, borderRadius } from '../utils/theme';
import type { InhabitantCategory, Inhabitant } from '../utils/types';
import {
  getSpeciesForAquarium,
  getSpeciesById,
  formatSpeciesParams,
  searchSpecies,
  type SpeciesInfo,
} from '../utils/speciesCatalog';

const CATEGORY_LABELS: Record<InhabitantCategory, string> = {
  pesce: '🐟 Pesce',
  pianta: '🌿 Pianta',
  invertebrato: '🦐 Invertebrato',
  corallo: '🪸 Corallo',
};

const CATEGORY_ICONS: Record<InhabitantCategory, string> = {
  pesce: '🐟',
  pianta: '🌿',
  invertebrato: '🦐',
  corallo: '🪸',
};

export function InhabitantsScreen() {
  const { inhabitants, addInhabitant, updateInhabitant, deleteInhabitant, aquariums, selectedAquariumId } = useAquarium();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInhabitant, setEditingInhabitant] = useState<Inhabitant | null>(null);
  const [addMode, setAddMode] = useState<'catalog' | 'custom'>('catalog');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState<SpeciesInfo | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InhabitantCategory>('pesce');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

  const selectedAquarium = aquariums.find((a) => a.id === selectedAquariumId);
  const aquariumWaterType = selectedAquarium?.type ?? 'dolce';
  const catalogSpeciesBase = getSpeciesForAquarium(aquariumWaterType, category);
  const catalogSpecies = searchSpecies(catalogSpeciesBase, catalogSearch);
  const editCatalogBase = editingInhabitant
    ? getSpeciesForAquarium(aquariumWaterType, editingInhabitant.category)
    : [];
  const customSuggestions =
    addMode === 'custom' && name.trim().length > 0
      ? searchSpecies(catalogSpeciesBase, name)
      : [];
  const editSuggestions =
    editingInhabitant && name.trim().length > 0
      ? searchSpecies(editCatalogBase, name)
      : [];

  const filtered = inhabitants.filter(
    (i) => selectedAquariumId && i.aquariumId === selectedAquariumId
  );

  const byCategory = filtered.reduce(
    (acc, i) => {
      if (!acc[i.category]) acc[i.category] = [];
      acc[i.category].push(i);
      return acc;
    },
    {} as Record<InhabitantCategory, typeof filtered>
  );

  const categoriesOrder: InhabitantCategory[] = ['pesce', 'pianta', 'invertebrato', 'corallo'];

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso necessario', 'Serve il permesso per accedere alle foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const openModal = () => {
    setEditingInhabitant(null);
    setAddMode('catalog');
    setCatalogSearch('');
    setSelectedSpecies(null);
    setName('');
    setCategory('pesce');
    setQuantity('1');
    setNotes('');
    setPhoto(undefined);
    setModalVisible(true);
  };

  const openEditModal = (item: Inhabitant) => {
    setEditingInhabitant(item);
    setAddMode('custom');
    setCatalogSearch('');
    setSelectedSpecies(item.speciesId ? getSpeciesById(item.speciesId) ?? null : null);
    setName(item.name);
    setCategory(item.category);
    setQuantity(String(item.quantity));
    setNotes(item.notes ?? '');
    setPhoto(item.photo);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingInhabitant(null);
    setAddMode('catalog');
    setCatalogSearch('');
    setSelectedSpecies(null);
    setName('');
    setCategory('pesce');
    setQuantity('1');
    setNotes('');
    setPhoto(undefined);
  };

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Errore', 'Inserisci un nome.');
      return;
    }
    if (editingInhabitant) {
      updateInhabitant(editingInhabitant.id, {
        name: trimmed,
        quantity: parseInt(quantity, 10) || 1,
        notes: notes.trim() || undefined,
        photo,
        speciesId: selectedSpecies?.id,
      });
    } else {
      if (!selectedAquariumId) return;
      addInhabitant({
        aquariumId: selectedAquariumId,
        name: trimmed,
        category,
        quantity: parseInt(quantity, 10) || 1,
        notes: notes.trim() || undefined,
        photo,
        speciesId: selectedSpecies?.id,
      });
    }
    closeModal();
  };

  const handleDelete = () => {
    if (!editingInhabitant) return;
    Alert.alert(
      'Elimina abitante',
      `Eliminare "${editingInhabitant.name}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            deleteInhabitant(editingInhabitant.id);
            closeModal();
          },
        },
      ]
    );
  };

  if (!selectedAquariumId) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nessun acquario selezionato</Text>
          <Text style={styles.emptySubtext}>Torna indietro per scegliere un acquario</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Abitanti</Text>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {categoriesOrder.map((cat) => {
          const items = byCategory[cat] || [];
          if (items.length === 0) return null;
          return (
            <View key={cat} style={styles.section}>
              <Text style={styles.sectionTitle}>{CATEGORY_LABELS[cat]}</Text>
              {items.map((item) => (
                <TouchableOpacity key={item.id} activeOpacity={0.7} onPress={() => openEditModal(item)}>
                  <Card>
                    <View style={styles.inhabitantRow}>
                    {item.photo ? (
                      <Image source={{ uri: item.photo }} style={styles.thumb} />
                    ) : (
                      <View style={styles.iconPlaceholder}>
                        <Text style={styles.iconText}>{CATEGORY_ICONS[item.category]}</Text>
                      </View>
                    )}
                    <View style={styles.inhabitantInfo}>
                      <Text style={styles.inhabitantName}>{item.name}</Text>
                      <Text style={styles.inhabitantMeta}>Quantità: {item.quantity}</Text>
                      {item.speciesId && (() => {
                        const sp = getSpeciesById(item.speciesId);
                        return sp ? (
                          <Text style={styles.speciesParams} numberOfLines={1}>
                            {formatSpeciesParams(sp)}
                          </Text>
                        ) : null;
                      })()}
                      {item.notes && (
                        <Text style={styles.inhabitantNotes} numberOfLines={2}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                  </Card>
                </TouchableOpacity>
              ))}
            </View>
          );
        })}
        {filtered.length === 0 && (
          <View style={styles.emptyList}>
            <Text style={styles.emptyListText}>Nessun abitante</Text>
            <Text style={styles.emptyListSubtext}>Tocca + per aggiungere il primo</Text>
          </View>
        )}
      </ScrollView>

      <FloatingActionButton onPress={openModal} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingInhabitant ? 'Modifica abitante' : 'Nuovo abitante'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {!editingInhabitant && (
                <View>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoryRow}>
                {categoriesOrder.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.categoryBtn, category === c && styles.categoryBtnActive]}
                    onPress={() => {
                      setCategory(c);
                      setCatalogSearch('');
                      setSelectedSpecies(null);
                      setName('');
                    }}
                  >
                    <Text style={[styles.categoryBtnText, category === c && styles.categoryBtnTextActive]}>
                      {CATEGORY_ICONS[c]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.addModeRow}>
                <TouchableOpacity
                  style={[styles.addModeBtn, addMode === 'catalog' && styles.addModeBtnActive]}
                  onPress={() => {
                    setAddMode('catalog');
                    setCatalogSearch('');
                    setSelectedSpecies(null);
                    setName('');
                  }}
                >
                  <Text style={[styles.addModeText, addMode === 'catalog' && styles.addModeTextActive]}>
                    Dal catalogo
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.addModeBtn, addMode === 'custom' && styles.addModeBtnActive]}
                  onPress={() => {
                    setAddMode('custom');
                    setCatalogSearch('');
                    setSelectedSpecies(null);
                    setName('');
                  }}
                >
                  <Text style={[styles.addModeText, addMode === 'custom' && styles.addModeTextActive]}>
                    Personalizzato
                  </Text>
                </TouchableOpacity>
              </View>

              {addMode === 'catalog' ? (
                <>
                  <TextInput
                    style={styles.searchInput}
                    placeholder="Cerca specie..."
                    value={catalogSearch}
                    onChangeText={setCatalogSearch}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {catalogSpecies.length === 0 ? (
                    <Text style={styles.noSpeciesText}>
                      {catalogSearch.trim()
                        ? 'Nessun risultato. Prova un altro termine.'
                        : `Nessuna specie per ${category} (${aquariumWaterType}). Usa "Personalizzato".`}
                    </Text>
                  ) : (
                    <ScrollView
                      style={styles.speciesListScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={false}
                    >
                      {catalogSpecies.map((sp) => (
                        <TouchableOpacity
                          key={sp.id}
                          style={[
                            styles.speciesItem,
                            selectedSpecies?.id === sp.id && styles.speciesItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedSpecies(sp);
                            setName(sp.name);
                          }}
                        >
                          <Text style={styles.speciesName}>{sp.name}</Text>
                          <Text style={styles.speciesParamsText}>
                            {formatSpeciesParams(sp)}
                          </Text>
                          {sp.difficulty && (
                            <Text style={styles.speciesDifficulty}>
                              {sp.difficulty}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                  {selectedSpecies && (
                    <View style={styles.selectedDetails}>
                      <TextInput
                        style={styles.input}
                        value={name}
                        onChangeText={setName}
                        placeholder="Nome"
                        placeholderTextColor={colors.textSecondary}
                      />
                      <View style={styles.quantityRow}>
                        <Text style={styles.quantityLabel}>Qtà</Text>
                        <TextInput
                          style={styles.quantityInput}
                          placeholder="1"
                          value={quantity}
                          onChangeText={setQuantity}
                          keyboardType="numeric"
                          placeholderTextColor={colors.textSecondary}
                        />
                      </View>
                      <TextInput
                        style={[styles.input, styles.notesInput]}
                        placeholder="Note (opzionale)"
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                        numberOfLines={2}
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="es. Neon tetra"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (selectedSpecies && t !== selectedSpecies.name) setSelectedSpecies(null);
                    }}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {customSuggestions.length > 0 && (
                    <View style={styles.suggestionsBox}>
                      {customSuggestions.slice(0, 5).map((sp, idx, arr) => (
                        <TouchableOpacity
                          key={sp.id}
                          style={[
                            styles.suggestionItem,
                            idx === arr.length - 1 && styles.suggestionItemLast,
                          ]}
                          onPress={() => {
                            setName(sp.name);
                            setSelectedSpecies(sp);
                          }}
                        >
                          <Text style={styles.suggestionName}>{sp.name}</Text>
                          <Text style={styles.suggestionParams}>
                            {formatSpeciesParams(sp)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Quantità</Text>
                    <TextInput
                      style={styles.quantityInput}
                      placeholder="1"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <Text style={styles.label}>Note</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Opzionale..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    placeholderTextColor={colors.textSecondary}
                  />
                </>
              )}

              {addMode === 'custom' || selectedSpecies ? (
                <View style={styles.photoRow}>
                  <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                    <Text style={styles.imageBtnText}>
                      {photo ? '📷 Cambia foto' : '📷 Aggiungi foto'}
                    </Text>
                  </TouchableOpacity>
                  {photo && (
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => setPhoto(undefined)}
                    >
                      <Text style={styles.removePhotoText}>Rimuovi</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : null}
                </View>
              )}

              {editingInhabitant && (
                <>
                  <Text style={styles.label}>Nome</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="es. Neon tetra"
                    value={name}
                    onChangeText={(t) => {
                      setName(t);
                      if (selectedSpecies && t !== selectedSpecies.name) setSelectedSpecies(null);
                    }}
                    placeholderTextColor={colors.textSecondary}
                  />
                  {editSuggestions.length > 0 && (
                    <View style={styles.suggestionsBox}>
                      {editSuggestions.slice(0, 5).map((sp, idx, arr) => (
                        <TouchableOpacity
                          key={sp.id}
                          style={[
                            styles.suggestionItem,
                            idx === arr.length - 1 && styles.suggestionItemLast,
                          ]}
                          onPress={() => {
                            setName(sp.name);
                            setSelectedSpecies(sp);
                          }}
                        >
                          <Text style={styles.suggestionName}>{sp.name}</Text>
                          <Text style={styles.suggestionParams}>
                            {formatSpeciesParams(sp)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                  <View style={styles.quantityRow}>
                    <Text style={styles.quantityLabel}>Quantità</Text>
                    <TextInput
                      style={styles.quantityInput}
                      placeholder="1"
                      value={quantity}
                      onChangeText={setQuantity}
                      keyboardType="numeric"
                      placeholderTextColor={colors.textSecondary}
                    />
                  </View>
                  <Text style={styles.label}>Note</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Opzionale..."
                    value={notes}
                    onChangeText={setNotes}
                    multiline
                    numberOfLines={2}
                    placeholderTextColor={colors.textSecondary}
                  />
                  <View style={styles.photoRow}>
                    <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                      <Text style={styles.imageBtnText}>
                        {photo ? '📷 Cambia foto' : '📷 Aggiungi foto'}
                      </Text>
                    </TouchableOpacity>
                    {photo && (
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => setPhoto(undefined)}
                      >
                        <Text style={styles.removePhotoText}>Rimuovi</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                    <Text style={styles.deleteBtnText}>Elimina</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Salva</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    padding: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  inhabitantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  iconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.waterBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    fontSize: 24,
  },
  inhabitantInfo: {
    flex: 1,
  },
  inhabitantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  inhabitantMeta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  inhabitantNotes: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  emptyList: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyListText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyListSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    padding: spacing.lg,
    maxHeight: '85%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    minHeight: 80,
  },
  categoryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryBtnText: {
    fontSize: 24,
  },
  categoryBtnTextActive: {
    opacity: 1,
  },
  addModeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  addModeBtn: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  addModeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  addModeText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addModeTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  speciesListScroll: {
    maxHeight: 220,
    marginBottom: spacing.sm,
  },
  speciesItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  selectedDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  quantityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    minWidth: 36,
  },
  quantityInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  notesInput: {
    minHeight: 56,
    marginTop: spacing.sm,
  },
  suggestionsBox: {
    marginTop: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  suggestionItem: {
    padding: spacing.sm,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionItemLast: {
    borderBottomWidth: 0,
  },
  suggestionName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  suggestionParams: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  speciesItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  speciesName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  speciesParamsText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  speciesDifficulty: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  noSpeciesText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  selectedInfo: {
    marginTop: spacing.sm,
  },
  speciesParams: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 2,
  },
  imageBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  removePhotoBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  removePhotoText: {
    fontSize: 14,
    color: colors.error,
  },
  imageBtnText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  deleteBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  deleteBtnText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  saveBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});
