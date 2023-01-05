import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NewDogScreen from '../screens/NewDogScreen';
import JustDatePicker from '../screens/JustDatePicker';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewDog" component={NewDogScreen} />
        <Stack.Screen name="JustDatePicker" component={JustDatePicker} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
