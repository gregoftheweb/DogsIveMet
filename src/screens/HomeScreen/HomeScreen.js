import React from 'react';
import {StyleSheet, Text, Image, View, useWindowDimensions} from 'react-native';
import CustomButton from '../../components/CustomButton';
import Logo from '../../../assets/images/DIM-Logo-v1.png';

const HomeScreen = () => {
  const {height} = useWindowDimensions();

  const onNewDogPressed = data => {
    console.log('Create new Dog Record');
    //navigation.navigate('SignIn');
  };
  const onDogListPressed = data => {
    console.log('Go to Dog List');
    //navigation.navigate('SignIn');
  };
  const onMyDogPressed = data => {
    console.log('Go to My Dog');
    //navigation.navigate('SignIn');
  };
  const onMePressed = data => {
    console.log('Go to Me');
    //navigation.navigate('SignIn');
  };

  return (
    <View>
      <Image
        source={Logo}
        style={[styles.logo, {height: height * 0.3}]}
        resizeMode="contain"
      />

      <Text style={styles.title}>Dogs I've Met</Text>
      <CustomButton
        text="New Dog"
        onPress={onNewDogPressed}
        fgColor="white"
        bgColor="#aa3278"
        type="PRIMARY"
        testID="buttonNewDog"
      />
      <CustomButton
        text="Dog List"
        onPress={onDogListPressed}
        fgColor="white"
        type="PRIMARY"
        testID="buttonDogList"
      />
      <CustomButton
        text="My Dog"
        onPress={onMyDogPressed}
        fgColor="white"
        type="PRIMARY"
        testID="buttonMyDog"
      />
      <CustomButton
        text="Me"
        onPress={onMePressed}
        fgColor="white"
        type="PRIMARY"
        testID="buttonMe"
      />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9fc',
  },
  logo: {
    maxWidth: 200,
    alignSelf: 'center',
  },
  title: {
    color: '#52082b',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});
