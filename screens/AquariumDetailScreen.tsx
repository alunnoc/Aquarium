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
import { useAquarium } from '../context/AquariumContext';
import { colors, spacing, borderRadius } from '../utils/theme';

export function AquariumDetailScreen() {
  const navigation = useNavigation();
  const { aquariums, updateAquarium, deleteAquarium, selectedAquariumId } = useAquarium();
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
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
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
    marginBottom: spacing.xl,
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
