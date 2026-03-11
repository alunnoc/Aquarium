import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { useAquarium } from '../context/AquariumContext';
import { colors, spacing, borderRadius } from '../utils/theme';

export function AquariumDetailScreen() {
  const navigation = useNavigation();
  const {
    aquariums,
    updateAquarium,
    deleteAquarium,
    exportAquariumData,
    importAquariumData,
    selectedAquariumId,
  } = useAquarium();
  const aquarium = aquariums.find((a) => a.id === selectedAquariumId);

  const [description, setDescription] = useState('');
  const [liters, setLiters] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [filterType, setFilterType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [extraPhoto, setExtraPhoto] = useState<string | undefined>();

  useEffect(() => {
    if (aquarium) {
      setDescription(aquarium.description ?? '');
      setLiters(aquarium.liters != null ? String(aquarium.liters) : '');
      setDimensions(aquarium.dimensions ?? '');
      setFilterType(aquarium.filterType ?? '');
      setStartDate(aquarium.startDate ?? '');
      setExtraPhoto(aquarium.extraPhoto);
    }
  }, [aquarium?.id, aquarium?.description, aquarium?.liters, aquarium?.dimensions, aquarium?.filterType, aquarium?.startDate, aquarium?.extraPhoto]);

  const pickExtraPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permesso necessario', 'Serve il permesso per accedere alle foto.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });
    if (!result.canceled) {
      setExtraPhoto(result.assets[0].uri);
      if (selectedAquariumId) {
        updateAquarium(selectedAquariumId, { extraPhoto: result.assets[0].uri });
      }
    }
  };

  const handleSave = () => {
    if (!selectedAquariumId) return;
    updateAquarium(selectedAquariumId, {
      description: description.trim() || undefined,
      liters: liters ? parseInt(liters, 10) : undefined,
      dimensions: dimensions.trim() || undefined,
      filterType: filterType.trim() || undefined,
      startDate: startDate.trim() || undefined,
      extraPhoto: extraPhoto || undefined,
    });
  };

  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useFocusEffect(React.useCallback(() => () => handleSaveRef.current(), []));

  const handleExport = async () => {
    if (!selectedAquariumId) return;
    try {
      const json = await exportAquariumData(selectedAquariumId);
      if (!json) {
        Alert.alert('Errore', 'Impossibile esportare l\'acquario.');
        return;
      }
      const filename = `acquario_${aquarium?.name.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.json`;
      const path = `${FileSystem.cacheDirectory}${filename}`;
      await FileSystem.writeAsStringAsync(path, json);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(path, {
          mimeType: 'application/json',
          dialogTitle: 'Esporta acquario',
        });
      } else {
        Alert.alert('Esportato', 'File salvato in cache. La condivisione non è disponibile.');
      }
    } catch (err) {
      Alert.alert('Errore', 'Impossibile esportare.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const uri = result.assets[0].uri;
      const content = await FileSystem.readAsStringAsync(uri);
      const { success, error } = await importAquariumData(content);
      if (success) {
        Alert.alert('Importazione completata', 'L\'acquario è stato importato.');
      } else {
        Alert.alert('Errore importazione', error || 'File non valido.');
      }
    } catch (err) {
      Alert.alert('Errore', 'Impossibile importare il file.');
    }
  };

  const handleDelete = () => {
    if (!aquarium || !selectedAquariumId) return;
    Alert.alert(
      'Elimina acquario',
      `Vuoi eliminare "${aquarium.name}"? Questa azione non può essere annullata.`,
      [
        { text: 'Annulla', style: 'cancel' },
        {
          text: 'Elimina',
          style: 'destructive',
          onPress: async () => {
            await deleteAquarium(selectedAquariumId);
            navigation.navigate('List' as never);
          },
        },
      ]
    );
  };

  if (!aquarium) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Acquario non trovato</Text>
      </View>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('it-IT', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={true}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.photoSection}>
          {aquarium.coverImage ? (
            <Image source={{ uri: aquarium.coverImage }} style={styles.coverImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderEmoji}>🐠</Text>
            </View>
          )}
          <Text style={styles.aquariumName}>{aquarium.name}</Text>
        </View>

        <View style={styles.dataSection}>
          <Text style={styles.sectionTitle}>Dati acquario</Text>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Litri</Text>
            <View style={styles.dataInputRow}>
              <TextInput
                style={styles.dataInput}
                placeholder="es. 100"
                value={liters}
                onChangeText={setLiters}
                onBlur={handleSave}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={styles.dataSuffix}>L</Text>
            </View>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tipo</Text>
            <Text style={styles.dataValue}>{aquarium.type === 'marino' ? 'Marino' : 'Dolce'}</Text>
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Dimensioni</Text>
            <TextInput
              style={styles.dataInput}
              placeholder="es. 80x40x35 cm"
              value={dimensions}
              onChangeText={setDimensions}
              onBlur={handleSave}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Tipo filtro</Text>
            <TextInput
              style={styles.dataInput}
              placeholder="es. Filtro interno, canister"
              value={filterType}
              onChangeText={setFilterType}
              onBlur={handleSave}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Data avvio</Text>
            <TextInput
              style={styles.dataInput}
              placeholder="es. 2024-01-15"
              value={startDate}
              onChangeText={setStartDate}
              onBlur={handleSave}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.dataRow}>
            <Text style={styles.dataLabel}>Creato il</Text>
            <Text style={styles.dataValue}>{formatDate(aquarium.createdAt)}</Text>
          </View>
        </View>

        <View style={styles.exportImportSection}>
          <Text style={styles.exportImportTitle}>Esporta / Importa</Text>
          <View style={styles.exportImportRow}>
            <TouchableOpacity style={styles.exportBtn} onPress={handleExport}>
              <Text style={styles.exportBtnText}>📤 Esporta</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
              <Text style={styles.importBtnText}>📥 Importa</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.photoSection}>
          <Text style={styles.sectionTitle}>Foto aggiuntiva</Text>
          <TouchableOpacity style={styles.extraPhotoBtn} onPress={pickExtraPhoto}>
            {extraPhoto ? (
              <Image source={{ uri: extraPhoto }} style={styles.extraPhoto} />
            ) : (
              <Text style={styles.extraPhotoPlaceholder}>📷 Aggiungi foto</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Descrizione</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Scrivi qualcosa sul tuo acquario..."
            value={description}
            onChangeText={setDescription}
            onBlur={handleSave}
            multiline
            numberOfLines={5}
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Elimina acquario</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  photoSection: {
    marginBottom: spacing.lg,
  },
  coverImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
    backgroundColor: colors.waterBlueLight,
  },
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: colors.waterBlueLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  aquariumName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  dataSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dataLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  dataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  dataInputRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  dataInput: {
    fontSize: 16,
    color: colors.text,
    minWidth: 60,
    textAlign: 'right',
    padding: 0,
  },
  dataSuffix: {
    fontSize: 16,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  extraPhotoBtn: {
    marginHorizontal: spacing.lg,
    height: 120,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraPhoto: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  extraPhotoPlaceholder: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  descriptionSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  exportImportSection: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  exportImportTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  exportImportRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  exportBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  exportBtnText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
  },
  importBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  importBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  descriptionInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 16,
    color: colors.text,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  deleteBtn: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
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
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    justifyContent: 'center',
  },
});
