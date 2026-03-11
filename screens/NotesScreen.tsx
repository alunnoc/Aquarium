import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useAquarium } from '../context/AquariumContext';
import { Card } from '../components/Card';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { colors, spacing, borderRadius } from '../utils/theme';

export function NotesScreen() {
  const { notes, addNote, selectedAquariumId } = useAquarium();
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const filtered = notes
    .filter((n) => selectedAquariumId && n.aquariumId === selectedAquariumId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleAdd = () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      Alert.alert('Errore', 'Inserisci un titolo per l\'appunto.');
      return;
    }
    if (!selectedAquariumId) return;
    addNote({
      aquariumId: selectedAquariumId,
      title: trimmedTitle,
      content: content.trim(),
      date: new Date().toISOString(),
    });
    setModalVisible(false);
    setTitle('');
    setContent('');
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
      <Text style={styles.title}>Appunti</Text>
      <Text style={styles.subtitle}>Diario dell'acquario</Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListText}>Nessun appunto</Text>
          <Text style={styles.emptyListSubtext}>
            Esempi: cambio acqua, manutenzione filtro, fertilizzazione, osservazioni
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card>
              <Text style={styles.noteTitle}>{item.title}</Text>
              {item.content ? (
                <Text style={styles.noteContent} numberOfLines={4}>
                  {item.content}
                </Text>
              ) : null}
              <Text style={styles.noteDate}>{formatDate(item.date)}</Text>
            </Card>
          )}
        />
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo appunto</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Titolo</Text>
              <TextInput
                style={styles.input}
                placeholder="es. Cambio acqua"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Contenuto</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Note dettagliate..."
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                placeholderTextColor={colors.textSecondary}
              />
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
    paddingBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  noteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  noteContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.sm,
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
    textAlign: 'center',
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
    maxHeight: '75%',
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
    minHeight: 120,
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
