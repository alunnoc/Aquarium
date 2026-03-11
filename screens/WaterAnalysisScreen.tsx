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
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAquarium } from '../context/AquariumContext';
import { Card } from '../components/Card';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { colors, spacing, borderRadius } from '../utils/theme';
import type { WaterTestParam } from '../utils/types';

const PARAM_LABELS: Record<WaterTestParam, string> = {
  pH: 'pH',
  GH: 'GH',
  KH: 'KH',
  NO2: 'NO2',
  NO3: 'NO3',
  NH3: 'NH3/NH4',
  temperatura: 'Temperatura (°C)',
  altro: 'Altro',
};

const chartConfig = {
  backgroundColor: colors.white,
  backgroundGradientFrom: colors.white,
  backgroundGradientTo: colors.white,
  decimalPlaces: 1,
  color: (opacity = 1) => `rgba(13, 148, 136, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(15, 23, 42, ${opacity})`,
  style: { borderRadius: borderRadius.lg },
};

function getParamKey(a: { param: WaterTestParam; customParamName?: string }): string {
  return a.param === 'altro' && a.customParamName ? a.customParamName : a.param;
}

function getParamLabel(
  key: string,
  labels: Record<WaterTestParam, string>
): string {
  return key in labels ? labels[key as WaterTestParam] : key;
}

export function WaterAnalysisScreen() {
  const { waterAnalyses, addWaterAnalysis, selectedAquariumId, customAnalysisTypes, addCustomAnalysisType } =
    useAquarium();
  const [modalVisible, setModalVisible] = useState(false);
  const [param, setParam] = useState<WaterTestParam | string>('pH');
  const [customParamName, setCustomParamName] = useState('');
  const [value, setValue] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterParam, setFilterParam] = useState<string>('tutti');

  const filtered = waterAnalyses.filter((a) => {
    if (!selectedAquariumId || a.aquariumId !== selectedAquariumId) return false;
    if (filterParam === 'tutti') return true;
    return getParamKey(a) === filterParam;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const chartDataByParam = (paramKey: string) => {
    const data = filtered
      .filter((a) => getParamKey(a) === paramKey)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const labels = data.map((d) => d.date.slice(5));
    let values = data.map((d) => d.value);
    if (values.length === 1) {
      labels.push(labels[0]);
      values = [values[0], values[0]];
    }
    return {
      labels,
      datasets: [{ data: values }],
    };
  };

  const paramsWithData = Array.from(new Set(filtered.map((a) => getParamKey(a))));
  const allCustomTypes = Array.from(
    new Set([...customAnalysisTypes, ...paramsWithData.filter((p) => !(p in PARAM_LABELS))])
  );

  const handleAdd = () => {
    const num = parseFloat(value);
    if (isNaN(num) || !selectedAquariumId) return;
    const isCustom = param === 'altro' || customAnalysisTypes.includes(param as string);
    const finalParam = isCustom ? 'altro' : (param as WaterTestParam);
    const finalCustomName = isCustom
      ? (param === 'altro' ? customParamName.trim() : (param as string))
      : undefined;
    if (isCustom && !finalCustomName) return;
    addWaterAnalysis({
      aquariumId: selectedAquariumId,
      param: finalParam,
      value: num,
      date,
      customParamName: finalCustomName,
    });
    if (finalCustomName) addCustomAnalysisType(finalCustomName);
    setModalVisible(false);
    setValue('');
    setParam('pH');
    setCustomParamName('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const screenWidth = Dimensions.get('window').width - spacing.lg * 2;

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
      <Text style={styles.title}>Analisi acqua</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <TouchableOpacity
          style={[styles.filterChip, filterParam === 'tutti' && styles.filterChipActive]}
          onPress={() => setFilterParam('tutti')}
        >
          <Text style={[styles.filterChipText, filterParam === 'tutti' && styles.filterChipTextActive]}>
            Tutti
          </Text>
        </TouchableOpacity>
        {(Object.keys(PARAM_LABELS) as WaterTestParam[]).map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.filterChip, filterParam === p && styles.filterChipActive]}
            onPress={() => setFilterParam(p)}
          >
            <Text style={[styles.filterChipText, filterParam === p && styles.filterChipTextActive]}>
              {PARAM_LABELS[p]}
            </Text>
          </TouchableOpacity>
        ))}
        {allCustomTypes.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.filterChip, filterParam === c && styles.filterChipActive]}
            onPress={() => setFilterParam(c)}
          >
            <Text style={[styles.filterChipText, filterParam === c && styles.filterChipTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {paramsWithData.map((p) => {
          const data = chartDataByParam(p);
          if (data.datasets[0].data.length === 0) return null;
          return (
            <Card key={p}>
              <Text style={styles.chartTitle}>{getParamLabel(p, PARAM_LABELS)}</Text>
              <LineChart
                data={data}
                width={screenWidth}
                height={180}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
              />
            </Card>
          );
        })}

        <Text style={styles.sectionTitle}>Cronologia</Text>
        {sorted.length === 0 ? (
          <Text style={styles.noData}>Nessuna analisi registrata</Text>
        ) : (
          sorted.map((a) => (
            <Card key={a.id}>
              <View style={styles.analysisRow}>
                <Text style={styles.analysisParam}>{getParamLabel(getParamKey(a), PARAM_LABELS)}</Text>
                <Text style={styles.analysisValue}>{a.value}</Text>
              </View>
              <Text style={styles.analysisDate}>{a.date}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuova analisi</Text>
            <ScrollView>
              <Text style={styles.label}>Parametro</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {(Object.keys(PARAM_LABELS) as WaterTestParam[]).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.paramChip, param === p && styles.paramChipActive]}
                    onPress={() => { setParam(p); setCustomParamName(''); }}
                  >
                    <Text style={[styles.paramChipText, param === p && styles.paramChipTextActive]}>
                      {PARAM_LABELS[p]}
                    </Text>
                  </TouchableOpacity>
                ))}
                {allCustomTypes.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.paramChip, param === c && styles.paramChipActive]}
                    onPress={() => { setParam(c); setCustomParamName(c); }}
                  >
                    <Text style={[styles.paramChipText, param === c && styles.paramChipTextActive]}>
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {param === 'altro' && (
                <>
                  <Text style={styles.label}>Nome parametro personalizzato</Text>
                  <View style={styles.addTypeRow}>
                    <TextInput
                      style={[styles.input, styles.flexInput]}
                      placeholder="es. PO4, Fe, O2"
                      value={customParamName}
                      onChangeText={setCustomParamName}
                      placeholderTextColor={colors.textSecondary}
                    />
                    <TouchableOpacity
                      style={styles.addTypeBtn}
                      onPress={() => {
                        const name = customParamName.trim();
                        if (name) {
                          addCustomAnalysisType(name);
                          setParam(name);
                          setCustomParamName(name);
                        }
                      }}
                    >
                      <Text style={styles.addTypeBtnText}>+ Aggiungi</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <Text style={styles.label}>Valore</Text>
              <TextInput
                style={styles.input}
                placeholder="es. 7.2"
                value={value}
                onChangeText={setValue}
                keyboardType="decimal-pad"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.label}>Data</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={date}
                onChangeText={setDate}
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
    paddingBottom: spacing.sm,
  },
  filterScroll: {
    maxHeight: 44,
    marginBottom: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: colors.text,
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
    paddingBottom: 100,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  noData: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisParam: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  analysisValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  analysisDate: {
    fontSize: 12,
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
    maxHeight: '70%',
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
  paramChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  paramChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paramChipText: {
    fontSize: 14,
    color: colors.text,
  },
  paramChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  addTypeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  flexInput: {
    flex: 1,
  },
  addTypeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
  },
  addTypeBtnText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
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
