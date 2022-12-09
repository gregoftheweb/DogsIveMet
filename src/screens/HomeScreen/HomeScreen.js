import React from 'react';
import {StyleSheet, Text, Image, View, useWindowDimensions} from 'react-native';
import CustomButton from '../../components/CustomButton';
import Logo from '../../../assets/images/cameraIcon.png';

const HomeScreen = () => {
  const {height} = useWindowDimensions();

  const onNewDogPressed = data => {
    console.warn('Create new Dog Record');
    //navigation.navigate('SignIn');
  };

  return (
    <View>
      <Image
        source={require('../../../assets/images/DIM-Logo-v1.png')}
        style={[styles.logo, {height: height * 0.3}]}
        resizeMode="contain"
      />

      <Text>HomeScreen hello world</Text>
      <Text>Cool story bro!</Text>
      <CustomButton
        text="New Dog"
        onPress={onNewDogPressed}
        fgColor="white"
        type="PRIMARY"
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9fc',
    alignItems: 'center',
    width: '100%',
  },
  logo: {
    maxWidth: 200,
  },
});
