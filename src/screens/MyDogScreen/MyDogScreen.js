import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const MyDogScreen = () => {
  return (
    <View style={styles.root}>
      <Text style={styles.title}>My Dog</Text>
      <Text style={styles.subtitle}>Coming Soon</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#004055',
    fontSize: 36,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#00749c',
    fontSize: 18,
    marginTop: 10,
  },
});

export default MyDogScreen;
