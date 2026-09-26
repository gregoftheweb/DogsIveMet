import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { TextInput as RNTextInput } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';

type Mode = 'idle' | 'listening' | 'editing';

const DIDNT_CATCH_MESSAGE = "Didn't catch that — try again";

// The mic button is intentionally larger than a standard input icon and
// overlaps the field's right edge rather than sitting inside it (design
// request). Sized from IconButton's own container-size formula
// (icon size + 2x its internal padding) so the overlap math below is exact.
const MIC_ICON_SIZE = 34;
const MIC_BUTTON_PADDING = 8;
const MIC_BUTTON_DIAMETER = MIC_ICON_SIZE + MIC_BUTTON_PADDING * 2;
const MIC_BUTTON_COLOR = '#0B3D91';
// "Mic is live" convention used by video-call apps (Zoom, Meet, Discord).
const MIC_BUTTON_LISTENING_COLOR = '#00C853';

function formatTranscript(transcript: string): string {
  return transcript
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface VoiceInputFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  label: string;
  placeholder?: string;
  /** Called with a short message to surface (e.g. via a Toast) on permission denial or recognition failure. */
  onError?: (message: string) => void;
}

export function VoiceInputField({
  value,
  onChangeText,
  label,
  placeholder,
  onError,
}: VoiceInputFieldProps) {
  const [mode, setMode] = useState<Mode>('idle');
  const [interimTranscript, setInterimTranscript] = useState('');
  const inputRef = useRef<RNTextInput>(null);

  // Stop any in-progress recognition on unmount / screen navigation away.
  // Unconditional: stopping when nothing is listening is a harmless no-op.
  useEffect(() => {
    return () => {
      ExpoSpeechRecognitionModule.stop();
    };
  }, []);

  // Focus once React has actually committed editable=true to the underlying
  // native view. Doing this in the keyboard icon's onPress instead (even
  // with a delay) races the DOM/native update and is unreliable; an effect
  // keyed on mode runs strictly after that commit, so there's no race.
  useEffect(() => {
    if (mode === 'editing') {
      inputRef.current?.focus();
    }
  }, [mode]);

  useSpeechRecognitionEvent('result', (event) => {
    if (mode !== 'listening') return;

    const transcript = event.results[0]?.transcript ?? '';
    if (!event.isFinal) {
      setInterimTranscript(transcript);
      return;
    }

    setInterimTranscript('');
    setMode('idle');
    const formatted = formatTranscript(transcript);
    if (formatted) {
      onChangeText(formatted);
    } else {
      onError?.(DIDNT_CATCH_MESSAGE);
    }
  });

  useSpeechRecognitionEvent('error', () => {
    if (mode !== 'listening') return;
    setInterimTranscript('');
    setMode('idle');
    onError?.(DIDNT_CATCH_MESSAGE);
  });

  const startListening = useCallback(async () => {
    const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      onError?.('Microphone permission is required to use voice input.');
      return;
    }
    setMode('listening');
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    });
  }, [onError]);

  const handleMicPress = useCallback(() => {
    if (mode === 'listening') {
      ExpoSpeechRecognitionModule.stop();
      setInterimTranscript('');
      setMode('idle');
      return;
    }
    if (mode === 'editing') {
      inputRef.current?.blur();
    }
    startListening();
  }, [mode, startListening]);

  const handleKeyboardPress = useCallback(() => {
    if (mode === 'listening') {
      ExpoSpeechRecognitionModule.stop();
      setInterimTranscript('');
    }
    setMode('editing');
  }, [mode]);

  const handleBlur = useCallback(() => {
    setMode('idle');
  }, []);

  const displayValue = mode === 'listening' && interimTranscript ? interimTranscript : value;

  return (
    <View style={styles.container}>
      <TextInput
        ref={inputRef}
        label={label}
        value={displayValue}
        onChangeText={onChangeText}
        onBlur={handleBlur}
        mode="outlined"
        placeholder={placeholder}
        autoCapitalize="words"
        editable={mode === 'editing'}
        style={mode === 'listening' && interimTranscript ? { opacity: 0.6 } : undefined}
        left={
          <TextInput.Icon
            icon="keyboard-outline"
            forceTextInputFocus={false}
            onPress={handleKeyboardPress}
            accessibilityLabel={`Type ${label} manually`}
          />
        }
        // Renders nothing (Paper's adornment system only renders elements
        // whose type is TextInputIcon/TextInputAffix — a plain View is
        // silently skipped) but still reserves its width as right padding,
        // so typed/spoken text doesn't run underneath the overlapping mic
        // button below.
        right={<View style={{ width: MIC_BUTTON_DIAMETER / 2 }} />}
      />
      <IconButton
        icon={mode === 'listening' ? 'microphone' : 'microphone-outline'}
        mode="contained"
        containerColor={mode === 'listening' ? MIC_BUTTON_LISTENING_COLOR : MIC_BUTTON_COLOR}
        iconColor="#fff"
        size={MIC_ICON_SIZE}
        onPress={handleMicPress}
        accessibilityLabel={mode === 'listening' ? 'Stop listening' : `Speak to fill ${label}`}
        style={styles.micButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  micButton: {
    position: 'absolute',
    top: '50%',
    right: -(MIC_BUTTON_DIAMETER / 2),
    marginTop: -(MIC_BUTTON_DIAMETER / 2),
    margin: 0,
    zIndex: 1,
    elevation: 4,
  },
});
