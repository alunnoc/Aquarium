import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
import type { MaintenanceAlert } from '../utils/types';

const PRESETS = [
  { title: 'Cambio acqua', days: 7 },
  { title: 'Pulizia filtro', days: 14 },
  { title: 'Cambio cartucce', days: 30 },
  { title: 'Pulizia vetro', days: 7 },
  { title: 'Fertilizzazione', days: 7 },
  { title: 'Test acqua', days: 14 },
];

function getNextDueDate(lastDone: string | undefined, intervalDays: number): Date | null {
  if (!lastDone) return null;
  const d = new Date(lastDone);
  d.setDate(d.getDate() + intervalDays);
  return d;
}

function isOverdue(lastDone: string | undefined, intervalDays: number): boolean {
  const next = getNextDueDate(lastDone, intervalDays);
  if (!next) return true;
  return next <= new Date();
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function MaintenanceScreen() {
  const {
    maintenanceAlerts,
    addMaintenanceAlert,
    updateMaintenanceAlert,
    deleteMaintenanceAlert,
    selectedAquariumId,
  } = useAquarium();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAlert, setEditingAlert] = useState<MaintenanceAlert | null>(null);
  const [title, setTitle] = useState('');
  const [intervalDays, setIntervalDays] = useState('7');

  const filtered = maintenanceAlerts.filter(
    (a) => selectedAquariumId && a.aquariumId === selectedAquariumId
  );

  const openAddModal = () => {
    setEditingAlert(null);
    setTitle('');
    setIntervalDays('7');
    setModalVisible(true);
  };

  const openEditModal = (a: MaintenanceAlert) => {
    setEditingAlert(a);
    setTitle(a.title);
    setIntervalDays(String(a.intervalDays));
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingAlert(null);
    setTitle('');
    setIntervalDays('7');
  };

  const handleSave = () => {
    const trimmed = title.trim();
    const days = parseInt(intervalDays, 10);
    if (!trimmed) {
      Alert.alert('Errore', 'Inserisci un nome per l\'alert.');
      return;
    }
    if (isNaN(days) || days < 1) {
      Alert.alert('Errore', 'Inserisci un intervallo valido (giorni).');
      return;
    }
    if (!selectedAquariumId) return;

    if (editingAlert) {
      updateMaintenanceAlert(editingAlert.id, { title: trimmed, intervalDays: days });
    } else {
      addMaintenanceAlert({
        aquariumId: selectedAquariumId,
        title: trimmed,
        intervalDays: days,
      });
    }
    closeModal();
  };

  const handleMarkDone = (a: MaintenanceAlert) => {
    setEditingAlert(null);
    updateMaintenanceAlert(a.id, { lastDoneDate: new Date().toISOString().split('T')[0] });
  };

  const handleDelete = () => {
    if (!editingAlert) return;
    Alert.alert(
      'Elimina alert',
      `Eliminare "${editingAlert.title}"?`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: () => {
            deleteMaintenanceAlert(editingAlert.id);
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
      <Text style={styles.title}>Gestione</Text>
      <Text style={styles.subtitle}>Alert impostabili per ricordarti le operazioni</Text>

      {filtered.length === 0 ? (
        <View style={styles.emptyList}>
          <Text style={styles.emptyListText}>Nessun alert impostato</Text>
          <Text style={styles.emptyListSubtext}>
            Tocca + per aggiungere promemoria (cambio acqua, pulizia filtro, ecc.)
          </Text>
        </View>
      ) : (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.list}>
          {filtered.map((a) => {
            const overdue = isOverdue(a.lastDoneDate, a.intervalDays);
            const nextDue = getNextDueDate(a.lastDoneDate, a.intervalDays);
            return (
              <Card key={a.id} style={overdue ? styles.alertCardOverdue : undefined}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openEditModal(a)}
                >
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTitle}>{a.title}</Text>
                    {overdue && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>Da fare</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.alertInterval}>
                    Ogni {a.intervalDays} giorni
                  </Text>
                  {a.lastDoneDate ? (
                    <Text style={styles.alertDate}>
                      Ultimo: {formatDate(a.lastDoneDate)}
                      {nextDue && (
                        <Text style={overdue ? styles.alertOverdue : styles.alertNext}>
                          {' • '}Prossimo: {formatDate(nextDue.toISOString().split('T')[0])}
                        </Text>
                      )}
                    </Text>
                  ) : (
                    <Text style={styles.alertDate}>Non ancora eseguito</Text>
                  )}
                  <TouchableOpacity
                    style={styles.doneBtn}
                    onPress={() => handleMarkDone(a)}
                  >
                    <Text style={styles.doneBtnText}>✓ Fatto</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </Card>
            );
          })}
        </ScrollView>
      )}

      <FloatingActionButton onPress={openAddModal} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingAlert ? 'Modifica alert' : 'Nuovo alert'}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Categoria rapida</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
                {PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.title}
                    style={[styles.presetChip, title === p.title && styles.presetChipActive]}
                    onPress={() => {
                      setTitle(p.title);
                      setIntervalDays(String(p.days));
                    }}
                  >
                    <Text style={[styles.presetText, title === p.title && styles.presetTextActive]}>
                      {p.title} ({p.days}g)
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="es. Cambio acqua"
                value={title}
                onChangeText={setTitle}
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Ogni quanti giorni</Text>
              <TextInput
                style={styles.input}
                placeholder="7"
                value={intervalDays}
                onChangeText={setIntervalDays}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={closeModal}>
                <Text style={styles.cancelBtnText}>Annulla</Text>
              </TouchableOpacity>
              {editingAlert && (
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                  <Text style={styles.deleteBtnText}>Elimina</Text>
                </TouchableOpacity>
              )}
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
    paddingBottom: 0,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  list: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  alertCardOverdue: {
    borderLeftWidth: 4,
    borderLeftColor: colors.error,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  alertInterval: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  alertDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  alertOverdue: {
    color: colors.error,
    fontWeight: '600',
  },
  alertNext: {
    color: colors.textSecondary,
  },
  doneBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  doneBtnText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
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
  presetsRow: {
    marginBottom: spacing.sm,
  },
  presetChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  presetChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  presetText: {
    fontSize: 14,
    color: colors.text,
  },
  presetTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    flexWrap: 'wrap',
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
  deleteBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.error,
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '600',
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
