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
    //navigation.navigate('SignIn');
  };
  const onMyDogPressed = data => {
    console.log('Go to My Dog');
    //navigation.navigate('SignIn');
  };
  const onMePressed = data => {
    console.log('Go to Me');
    //navigation.navigate('me');
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
    color: '#52082b',
    fontSize: 30,
    fontWeight: 'bold',
    alignSelf: 'center',
  },
});

export default HomeScreen;
