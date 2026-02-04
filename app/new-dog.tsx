import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import {
  TextInput,
  Button,
  IconButton,
  ActivityIndicator,
  Dialog,
  List,
  Portal,
  useTheme,
  Surface,
  Text as PaperText,
} from 'react-native-paper';
import { Dog } from '@/src/types/Dog';
import { addDog, getDogById, updateDog } from '@/src/storage/dogs';
import { logEvent, logError } from '@/src/utils/logger';
import { Toast } from '@/components/Toast';
import { ScreenContainer } from '@/src/ui/ScreenContainer';
import { TopNav } from '@/src/ui/TopNav';
import { useDogCounts } from '@/src/state/DogCountsProvider';

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

// URI preview length for logging (show last N characters)
const URI_LOG_PREVIEW_LENGTH = 12;

// Error message constants
const SAVE_ERROR_MESSAGE = 'Failed to save dog. Please try again.';

export default function NewDogScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const { refreshCounts } = useDogCounts();
  const mode = (params.mode as string) || 'create';
  const dogId = params.id as string | undefined;
  const isMineParam = params.isMine === 'true';
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [notFound, setNotFound] = useState(false);
  const [existingDog, setExistingDog] = useState<Dog | null>(null);
  
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Unknown');
  const [photoUri, setPhotoUri] = useState<string | undefined>(undefined);
  const [metLocationText, setMetLocationText] = useState('');
  const [notes, setNotes] = useState('');
  const [breedDialogVisible, setBreedDialogVisible] = useState(false);
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
      if (isMineParam) {
        logEvent('MyDogForm:screen:mount');
      } else {
        logEvent('New Dog - Screen mounted');
      }
    }
    return () => {
      if (isEditMode) {
        logEvent('EditDog:screen:unmount');
      } else if (isMineParam) {
        logEvent('MyDogForm:screen:unmount');
      } else {
        logEvent('New Dog - Screen unmounted');
      }
    };
  }, [isEditMode, isMineParam]);

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
        if (isEditMode) {
          const uriLog = uri ? `...${uri.slice(-URI_LOG_PREVIEW_LENGTH)}` : 'none';
          logEvent(`${eventPrefix}:success`, { uriPreview: uriLog });
        } else {
          logEvent('New Dog - Photo captured successfully');
        }
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
    // Helper to get the appropriate event prefix based on mode
    const getEventPrefix = () => {
      if (isEditMode) return 'EditDog';
      return isMineParam ? 'MyDogForm' : 'New Dog';
    };

    const eventPrefix = getEventPrefix();
    const logMetadata = isMineParam && !isEditMode ? { isMine: true } : {};
    
    logEvent(`${eventPrefix}:save:press`, { 
      name: name.trim(), 
      breed, 
      ...logMetadata 
    });

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
          // Preserve original timestamps (updatedAt will be set by updateDog)
          metAt: existingDog.metAt,
          createdAt: existingDog.createdAt,
        };

        logEvent('EditDog:save:dog_object_created', { id: existingDog.id, name: trimmedName, breed });

        await updateDog(updatedDog);
        logEvent('EditDog:save:success', { id: existingDog.id });

        // Refresh counts after update
        await refreshCounts();

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
          : `${Date.now()}-${Math.random().toString(36).substring(2, 11).padEnd(9, '0')}`;
        
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
          ...(isMineParam ? { isMine: true } : {}),
        };

        logEvent(`${eventPrefix} - Dog object created`, { 
          id, 
          name: trimmedName, 
          breed, 
          ...logMetadata 
        });

        await addDog(newDog);
        logEvent(`${eventPrefix} - Saved to storage successfully`, { id });

        // Refresh counts after save
        await refreshCounts();

        // Show success feedback
        showToast('Dog saved successfully!', 'success');

        // Navigate to dog profile
        setTimeout(() => {
          logEvent(`${eventPrefix} - Navigating to dog profile`, { id });
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
      <>
        <TopNav />
        <ScreenContainer>
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" animating={true} color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.onBackground }]}>
              Loading dog data...
            </Text>
          </View>
        </ScreenContainer>
      </>
    );
  }

  // Not found state for edit mode
  if (isEditMode && notFound) {
    return (
      <>
        <TopNav />
        <ScreenContainer>
          <View style={styles.centerContent}>
            <Ionicons name="alert-circle-outline" size={64} color={theme.colors.onSurfaceVariant} />
            <Text
              style={[
                styles.notFoundText,
                { color: theme.colors.onBackground, marginVertical: 16 },
              ]}
            >
              Dog not found.
            </Text>
            <Button
              mode="contained"
              onPress={() => {
                logEvent('Nav:to:DogsList');
                router.back();
              }}
            >
              Back to list
            </Button>
          </View>
        </ScreenContainer>
      </>
    );
  }

  return (
    <>
      <TopNav />
      <ScreenContainer scroll={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Name Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            placeholder="Enter the dog's name"
            autoCapitalize="words"
          />
        </View>

        {/* Photo Section - Conditional Rendering */}
        <View style={styles.inputContainer}>
          {!photoUri ? (
            // Before photo: Show compact Take Photo button
            <>
              <Button
                mode="contained"
                icon="camera"
                onPress={handleTakePhoto}
                style={styles.takePhotoButton}
              >
                Take Photo
              </Button>
              <PaperText
                variant="bodySmall"
                style={[styles.helperText, { color: theme.colors.onSurfaceVariant }]}
              >
                Add a photo to help remember this dog.
              </PaperText>
            </>
          ) : (
            // After photo: Show image preview + retake button
            <>
              <Surface style={styles.imageContainer} elevation={0}>
                <Image source={{ uri: photoUri }} style={styles.photoImage} />
              </Surface>
              <Button
                mode="outlined"
                icon="camera-reverse"
                onPress={handleTakePhoto}
                style={styles.retakeButton}
              >
                Retake Photo
              </Button>
            </>
          )}
        </View>

        {/* Breed Picker */}
        <View style={styles.inputContainer}>
          <Button
            mode="outlined"
            onPress={() => setBreedDialogVisible(true)}
            style={styles.breedButton}
          >
            {breed} *
          </Button>
        </View>

        {/* Location Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Where did I meet this dog?"
            value={metLocationText}
            onChangeText={setMetLocationText}
            mode="outlined"
            placeholder="e.g., Park, Pet Store, Friend's House"
            autoCapitalize="words"
          />
        </View>

        {/* Notes Input */}
        <View style={styles.inputContainer}>
          <TextInput
            label="Notes"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            placeholder="Any notes about this dog..."
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={isSaving}
            loading={isSaving}
          >
            {isEditMode ? 'Save Changes' : 'Save Dog'}
          </Button>

          <Button
            mode="outlined"
            onPress={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
        </View>
      </KeyboardAvoidingView>

      {/* Breed Selection Dialog */}
      <Portal>
        <Dialog
          visible={breedDialogVisible}
          onDismiss={() => setBreedDialogVisible(false)}
        >
          <Dialog.Title>Select Breed</Dialog.Title>
          <Dialog.Content>
            {BREEDS.map((breedOption) => (
              <List.Item
                key={breedOption}
                title={breedOption}
                right={() =>
                  breed === breedOption ? (
                    <Ionicons name="checkmark" size={24} color={theme.colors.primary} />
                  ) : null
                }
                onPress={() => {
                  setBreed(breedOption);
                  setBreedDialogVisible(false);
                }}
                style={[
                  breed === breedOption && {
                    backgroundColor: theme.colors.primaryContainer,
                  },
                ]}
              />
            ))}
          </Dialog.Content>
        </Dialog>
      </Portal>

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        visible={toastVisible}
        type={toastType}
        onHide={() => setToastVisible(false)}
      />
    </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    // Removed flex: 1 to allow ScrollView to work properly
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  notFoundText: {
    fontSize: 18,
    textAlign: 'center',
  },
  takePhotoButton: {
    width: '100%',
  },
  helperText: {
    marginTop: 8,
    textAlign: 'center',
  },
  imageContainer: {
    width: '100%',
    maxWidth: 320,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    marginTop: 12,
    alignSelf: 'center',
  },
  breedButton: {
    justifyContent: 'center',
    height: 56,
  },
  actionsContainer: {
    marginTop: 8,
    marginBottom: 16,
    gap: 12,
  },
});
