import React, { useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAquarium } from '../context/AquariumContext';
import { AquariumCard } from '../components/AquariumCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { colors, spacing, borderRadius } from '../utils/theme';
import type { AquariumType } from '../utils/types';

export function AquariScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { aquariums, addAquarium, setSelectedAquariumId, deleteAquarium, loadData } = useAquarium();
  const topInset =
    insets.top > 0
      ? insets.top
      : Platform.OS === 'android'
        ? Math.max(StatusBar.currentHeight ?? 0, 56)
        : 44;
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [liters, setLiters] = useState('');
  const [type, setType] = useState<AquariumType>('dolce');
  const [coverImage, setCoverImage] = useState<string | undefined>();

  const pickImage = async () => {
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
      setCoverImage(result.assets[0].uri);
    }
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Errore', 'Inserisci un nome per l\'acquario.');
      return;
    }
    addAquarium({
      name: trimmed,
      liters: liters ? parseInt(liters, 10) : undefined,
      type,
      coverImage,
    });
    setModalVisible(false);
    setName('');
    setLiters('');
    setType('dolce');
    setCoverImage(undefined);
  };

  const handleSelectAquarium = (id: string) => {
    setSelectedAquariumId(id);
    navigation.navigate('Detail' as never);
  };

  useFocusEffect(
    React.useCallback(() => {
      setSelectedAquariumId(null);
      loadData();
    }, [setSelectedAquariumId, loadData])
  );

  return (
    <View style={[styles.container, { paddingTop: topInset + spacing.lg }]}>
      <Text style={styles.title}>I tuoi acquari</Text>
      {aquariums.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Nessun acquario ancora</Text>
          <Text style={styles.emptySubtext}>Tocca + per aggiungere il primo</Text>
        </View>
      ) : (
        <FlatList
          data={aquariums}
          keyExtractor={(item) => item.id}
          removeClippedSubviews={false}
          renderItem={({ item }) => (
            <AquariumCard
              aquarium={item}
              onPress={() => handleSelectAquarium(item.id)}
              onLongPress={() => {
                Alert.alert(
                  'Elimina acquario',
                  `Vuoi eliminare "${item.name}"? Questa azione non può essere annullata.`,
                  [
                    { text: 'Annulla', style: 'cancel' },
                    {
                      text: 'Elimina',
                      style: 'destructive',
                      onPress: () => deleteAquarium(item.id),
                    },
                  ]
                );
              }}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}

      <FloatingActionButton onPress={() => setModalVisible(true)} />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nuovo acquario</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.input}
                placeholder="Nome acquario"
                value={name}
                onChangeText={setName}
                placeholderTextColor={colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Litri (opzionale)"
                value={liters}
                onChangeText={setLiters}
                keyboardType="numeric"
                placeholderTextColor={colors.textSecondary}
              />
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[styles.typeBtn, type === 'dolce' && styles.typeBtnActive]}
                  onPress={() => setType('dolce')}
                >
                  <Text style={[styles.typeBtnText, type === 'dolce' && styles.typeBtnTextActive]}>
                    Dolce
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeBtn, type === 'marino' && styles.typeBtnActive]}
                  onPress={() => setType('marino')}
                >
                  <Text style={[styles.typeBtnText, type === 'marino' && styles.typeBtnTextActive]}>
                    Marino
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.imageBtn} onPress={pickImage}>
                <Text style={styles.imageBtnText}>
                  {coverImage ? '📷 Foto selezionata' : '📷 Aggiungi foto di copertina'}
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
        </KeyboardAvoidingView>
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
  list: {
    padding: spacing.md,
    paddingBottom: 100,
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    fontSize: 16,
    color: colors.text,
    marginBottom: spacing.md,
  },
  typeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  typeBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeBtnText: {
    fontSize: 16,
    color: colors.text,
  },
  typeBtnTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  imageBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: spacing.md,
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
});
