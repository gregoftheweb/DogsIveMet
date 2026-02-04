import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Dog } from '@/src/types/Dog';
import { addDog, getDogById, updateDog } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';
import { Toast } from '@/components/Toast';

const BREEDS = [
  'Unknown',
  'Doodle',
  'Labrador Retriever',
  'Golden Retriever',
  'German Shepherd',
  'French Bulldog',
  'Poodle',
  'Beagle',
  'Mixed',
];

// Delay before navigation to allow toast to be visible
const TOAST_NAVIGATION_DELAY_MS = 500;

// Error message constants
const SAVE_ERROR_MESSAGE = 'Failed to save dog. Please try again.';

export default function NewDogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mode = (params.mode as string) || 'create';
  const dogId = params.id as string | undefined;
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [existingDog, setExistingDog] = useState<Dog | null>(null);
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Unknown');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [metLocationText, setMetLocationText] = useState('');
  const [notes, setNotes] = useState('');
  const [breedModalVisible, setBreedModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Track initial values for unsaved changes detection
  const [initialValues, setInitialValues] = useState({
    name: '',
    breed: 'Unknown',
    photoUri: undefined as string | undefined,
    metLocationText: '',
    notes: '',
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  // Check if form has unsaved changes
  const hasUnsavedChanges = () => {
    return (
      name !== initialValues.name ||
      breed !== initialValues.breed ||
      photoUri !== initialValues.photoUri ||
      metLocationText !== initialValues.metLocationText ||
      notes !== initialValues.notes
    );
  };

  // Load dog data for edit mode
  const loadDogData = useCallback(async () => {
    if (!isEditMode || !dogId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    logEvent('EditDog:screen:mount');
    logEvent('EditDog:load:start', { id: dogId });

    try {
      const foundDog = await getDogById(dogId);
      
      if (foundDog) {
        setExistingDog(foundDog);
        setName(foundDog.name);
        setBreed(foundDog.breed);
        setPhotoUri(foundDog.photoUri);
        setMetLocationText(foundDog.metLocationText || '');
        setNotes(foundDog.notes || '');
        
        // Store initial values for change detection
        setInitialValues({
          name: foundDog.name,
          breed: foundDog.breed,
          photoUri: foundDog.photoUri,
          metLocationText: foundDog.metLocationText || '',
          notes: foundDog.notes || '',
        });
        
        logEvent('EditDog:load:success', { id: dogId });
      } else {
        setNotFound(true);
        logEvent('EditDog:load:not_found', { id: dogId });
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        { context: 'EditDog:load:error', id: dogId }
      );
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [isEditMode, dogId]);

  // Load on focus (for edit mode)
  useFocusEffect(
    useCallback(() => {
      loadDogData();
    }, [loadDogData])
  );

  // Log screen mount
  useEffect(() => {
    if (!isEditMode) {
      logEvent('New Dog - Screen mounted');
    }
    return () => {
      if (isEditMode) {
        logEvent('EditDog:screen:unmount');
      } else {
        logEvent('New Dog - Screen unmounted');
      }
    };
  }, [isEditMode]);

  const handleTakePhoto = async () => {
    const eventPrefix = isEditMode ? 'EditDog:camera' : 'New Dog - Take photo';
    logEvent(isEditMode ? `${eventPrefix}:press` : 'New Dog - Take photo initiated');
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        logEvent(isEditMode ? `${eventPrefix}:permission_denied` : 'New Dog - Camera permission denied');
        Alert.alert(
          'Camera Permission Required',
          'Please enable camera permissions in your device settings to take photos of dogs.',
          [{ text: 'OK' }]
        );
        return;
      }

      logEvent(isEditMode ? `${eventPrefix}:permission_granted` : 'New Dog - Camera permission granted, launching camera');
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        const uriLog = uri ? `...${uri.slice(-12)}` : 'none';
        logEvent(isEditMode ? `${eventPrefix}:success` : 'New Dog - Photo captured successfully', 
          isEditMode ? { uriPreview: uriLog } : undefined);
      } else {
        logEvent(isEditMode ? `${eventPrefix}:cancel` : 'New Dog - Photo capture cancelled');
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)), 
        { context: isEditMode ? `${eventPrefix}:error` : 'New Dog - Photo capture failed' }
      );
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const handleSave = async () => {
    const eventPrefix = isEditMode ? 'EditDog' : 'New Dog';
    logEvent(`${eventPrefix}:save:press`, { name: name.trim(), breed });

    // Validate required fields
    const trimmedName = name.trim();
    if (!trimmedName) {
      logEvent(`${eventPrefix}:save:validation_failed`, { reason: 'Name is empty' });
      Alert.alert('Validation Error', 'Please enter the dog\'s name.');
      return;
    }
    if (!breed) {
      logEvent(`${eventPrefix}:save:validation_failed`, { reason: 'Breed not selected' });
      Alert.alert('Validation Error', 'Please select a breed.');
      return;
    }

    setIsSaving(true);
    logEvent(`${eventPrefix}:save:write_start`);

    try {
      if (isEditMode && existingDog) {
        // Update existing dog
        const updatedDog: Dog = {
          ...existingDog,
          name: trimmedName,
          breed,
          photoUri: photoUri || undefined,
          metLocationText: metLocationText.trim() || undefined,
          notes: notes.trim() || undefined,
          // Preserve original timestamps
          metAt: existingDog.metAt,
          createdAt: existingDog.createdAt,
          // Set updatedAt (will be overwritten by updateDog function)
          updatedAt: new Date().toISOString(),
        };

        logEvent('EditDog:save:dog_object_created', { id: existingDog.id, name: trimmedName, breed });

        await updateDog(updatedDog);
        logEvent('EditDog:save:success', { id: existingDog.id });

        // Show success feedback
        showToast('Dog updated successfully!', 'success');

        // Navigate back to dog profile
        setTimeout(() => {
          logEvent('Nav:to:DogProfile', { id: existingDog.id });
          router.push({
            pathname: '/dog-profile',
            params: { id: existingDog.id },
          });
        }, TOAST_NAVIGATION_DELAY_MS);
      } else {
        // Create new dog
        const id = typeof crypto !== 'undefined' && crypto.randomUUID 
          ? crypto.randomUUID() 
          : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const now = new Date().toISOString();
        
        const newDog: Dog = {
          id,
          name: trimmedName,
          breed,
          photoUri: photoUri || undefined,
          metLocationText: metLocationText.trim() || undefined,
          notes: notes.trim() || undefined,
          metAt: now,
          createdAt: now,
          updatedAt: now,
        };

        logEvent('New Dog - Dog object created', { id, name: trimmedName, breed });

        await addDog(newDog);
        logEvent('New Dog - Saved to storage successfully', { id });

        // Show success feedback
        showToast('Dog saved successfully!', 'success');

        // Navigate to dog profile
        setTimeout(() => {
          logEvent('New Dog - Navigating to dog profile', { id });
          router.push({
            pathname: '/dog-profile',
            params: { id: newDog.id },
          });
        }, TOAST_NAVIGATION_DELAY_MS);
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error(String(error)),
        {
          context: `${eventPrefix}:save:error`,
          dogName: trimmedName,
          breed,
          ...(isEditMode && existingDog ? { id: existingDog.id } : {}),
        }
      );
      // Show toast for immediate feedback
      showToast(SAVE_ERROR_MESSAGE, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    const proceedWithCancel = () => {
      if (isEditMode && existingDog) {
        logEvent('EditDog:cancel', { id: existingDog.id });
        logEvent('Nav:to:DogProfile', { id: existingDog.id });
        router.push({
          pathname: '/dog-profile',
          params: { id: existingDog.id },
        });
      } else {
        logEvent('New Dog - Cancelled');
        router.back();
      }
    };

    // Check for unsaved changes
    if (hasUnsavedChanges()) {
      Alert.alert(
        'Discard changes?',
        'You have unsaved changes. Are you sure you want to discard them?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: proceedWithCancel,
          },
        ]
      );
    } else {
      proceedWithCancel();
    }
  };

  // Loading state for edit mode
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading dog data...</Text>
      </View>
    );
  }

  // Not found state for edit mode
  if (isEditMode && notFound) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.notFoundText}>Dog not found.</Text>
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.backButtonPressed,
          ]}
          onPress={() => {
            logEvent('Nav:to:DogsList');
            router.back();
          }}
        >
          <Text style={styles.backButtonText}>Back to list</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter the dog's name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        </View>

        {/* Photo Preview and Camera Button */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Photo</Text>
          <View style={styles.photoContainer}>
            <View style={styles.photoPreview}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              ) : (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={48} color="#999" />
                  <Text style={styles.photoPlaceholderText}>No photo yet</Text>
                </View>
              )}
            </View>
            <Pressable
              style={({ pressed }) => [
                styles.cameraButton,
                pressed && styles.cameraButtonPressed,
              ]}
              onPress={handleTakePhoto}
            >
              <Ionicons name="camera" size={24} color="#fff" />
              <Text style={styles.cameraButtonText}>Take Photo</Text>
            </Pressable>
          </View>
        </View>

        {/* Breed Picker */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Breed *</Text>
          <Pressable
            style={styles.pickerButton}
            onPress={() => setBreedModalVisible(true)}
          >
            <Text style={styles.pickerButtonText}>{breed}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </Pressable>
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Where did I meet this dog?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Park, Pet Store, Friend's House"
            value={metLocationText}
            onChangeText={setMetLocationText}
            autoCapitalize="words"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Any notes about this dog..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.saveButton,
              pressed && styles.saveButtonPressed,
              isSaving && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.saveButtonText}>Saving...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditMode ? 'Save Changes' : 'Save Dog'}
              </Text>
            )}
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.cancelButton,
              pressed && styles.cancelButtonPressed,
              isSaving && styles.cancelButtonDisabled,
            ]}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Breed Selection Modal */}
      <Modal
        visible={breedModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setBreedModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Breed</Text>
              <Pressable onPress={() => setBreedModalVisible(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {BREEDS.map((breedOption) => (
                <Pressable
                  key={breedOption}
                  style={({ pressed }) => [
                    styles.breedOption,
                    breed === breedOption && styles.breedOptionSelected,
                    pressed && styles.breedOptionPressed,
                  ]}
                  onPress={() => {
                    setBreed(breedOption);
                    setBreedModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.breedOptionText,
                      breed === breedOption && styles.breedOptionTextSelected,
                    ]}
                  >
                    {breedOption}
                  </Text>
                  {breed === breedOption && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  notesInput: {
    minHeight: 100,
    paddingTop: 12,
  },
  photoContainer: {
    alignItems: 'center',
  },
  photoPreview: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 300,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999',
  },
  cameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  cameraButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  cameraButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  actionsContainer: {
    marginTop: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  saveButtonDisabled: {
    backgroundColor: '#99c5ff',
    opacity: 0.7,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonPressed: {
    backgroundColor: '#f5f5f5',
    transform: [{ scale: 0.98 }],
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalScroll: {
    maxHeight: 400,
  },
  breedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  breedOptionSelected: {
    backgroundColor: '#f0f7ff',
  },
  breedOptionPressed: {
    backgroundColor: '#e8f4ff',
  },
  breedOptionText: {
    fontSize: 16,
    color: '#333',
  },
  breedOptionTextSelected: {
    fontWeight: '600',
    color: '#007AFF',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  notFoundText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonPressed: {
    backgroundColor: '#0051D5',
    transform: [{ scale: 0.98 }],
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonDisabled: {
    opacity: 0.5,
  },
});
