import React from 'react';
import {
  StyleSheet,
  Text,
  Image,
  View,
  useWindowDimensions,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CustomButton from '../../components/CustomButton';
import Logo from '../../../assets/images/DIM-Logo-v1.png';

const HomeScreen = () => {
  console.log('in home screen');

  const {height} = useWindowDimensions();
  const navigation = useNavigation();

  const onNewDogPressed = data => {
    console.log('Create new Dog Record');
    navigation.navigate('NewDog');
  };
  const onDogListPressed = data => {
    console.log('Go to Dog List');
    navigation.navigate('DogsList');
  };
  const onMyDogPressed = data => {
    console.log('Go to My Dog');
    navigation.navigate('MyDog');
  };
  const onMePressed = data => {
    console.log('Go to Me');
    navigation.navigate('Me');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.root}>
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
          text="List of dogs"
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
        {/* Advertising banner placeholder */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>Advertising</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbf9fc',
    alignItems: 'center',
  },
  logo: {
    maxWidth: 200,
    alignSelf: 'center',
  },
  title: {
    color: '#004055',
    fontSize: 36,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
  adBanner: {
    width: '100%',
    height: 60,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  adText: {
    color: '#666666',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
