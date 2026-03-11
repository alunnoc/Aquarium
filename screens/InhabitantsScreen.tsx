import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
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
import type { InhabitantCategory } from '../utils/types';

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
  const { inhabitants, addInhabitant, selectedAquariumId } = useAquarium();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InhabitantCategory>('pesce');
  const [quantity, setQuantity] = useState('1');
  const [notes, setNotes] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

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

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Errore', 'Inserisci un nome.');
      return;
    }
    if (!selectedAquariumId) return;
    addInhabitant({
      aquariumId: selectedAquariumId,
      name: trimmed,
      category,
      quantity: parseInt(quantity, 10) || 1,
      notes: notes.trim() || undefined,
      photo,
    });
    setModalVisible(false);
    setName('');
    setCategory('pesce');
    setQuantity('1');
    setNotes('');
    setPhoto(undefined);
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
                <Card key={item.id}>
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
                      {item.notes && (
                        <Text style={styles.inhabitantNotes} numberOfLines={2}>
                          {item.notes}
                        </Text>
                      )}
                    </View>
                  </View>
                </Card>
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

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo abitante</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Categoria</Text>
              <View style={styles.categoryRow}>
                {categoriesOrder.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.categoryBtn, category === c && styles.categoryBtnActive]}
                    onPress={() => setCategory(c)}
                  >
                    <Text style={[styles.categoryBtnText, category === c && styles.categoryBtnTextActive]}>
                      {CATEGORY_ICONS[c]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="es. Neon tetra"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Quantità</Text>
              <TextInput
                style={styles.input}
                placeholder="1"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Note (opzionale)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Note..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Text style={styles.imageBtnText}>
                  {photo ? '📷 Foto selezionata' : '📷 Aggiungi foto'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
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
  imageBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  imageBtnText: {
    fontSize: 16,
    color: colors.textSecondary,
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
