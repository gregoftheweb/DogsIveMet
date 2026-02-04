/**
 * ScreenContainer - Consistent layout wrapper for all screens
 * Provides safe area, centered content, and responsive layout for portrait + square screens
 */

import React, { ReactNode } from 'react';
import { StyleSheet, View, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';

interface ScreenContainerProps {
  children: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}

export function ScreenContainer({ children, scroll = false, style }: ScreenContainerProps) {
  const theme = useTheme();

  const containerStyle = [
    styles.container,
    { backgroundColor: theme.colors.background },
    style,
  ];

  // For scroll mode, don't use flex: 1 - let content grow naturally
  // For non-scroll mode, use flex: 1 to enable centering
  const contentStyle = scroll
    ? [
        styles.scrollableContent,
        { backgroundColor: theme.colors.background },
      ]
    : [
        styles.content,
        { backgroundColor: theme.colors.background },
      ];

  if (scroll) {
    return (
      <SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={contentStyle}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle} edges={['top', 'left', 'right']}>
      <View style={contentStyle}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  // For scrollable content - no flex: 1, just padding and centering
  scrollableContent: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  // For non-scrollable content - flex: 1 enables centering
  content: {
    flex: 1,
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
});
