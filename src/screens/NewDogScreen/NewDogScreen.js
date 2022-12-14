import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

const NewDogScreen = () => {
  return (
    <View style={styles.root}>
      <Text>NewDogScreen</Text>
    </View>
  );
};

export default NewDogScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9fc',
  },
});
