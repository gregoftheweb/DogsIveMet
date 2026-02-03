import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native';

import HomeScreen from '../screens/HomeScreen';
import NewDogScreen from '../screens/NewDogScreen';
import DogsListScreen from '../screens/DogsListScreen';
import MyDogScreen from '../screens/MyDogScreen';
import MeScreen from '../screens/MeScreen';

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="NewDog" component={NewDogScreen} />
        {/* Route for Dogs List screen */}
        <Stack.Screen name="DogsList" component={DogsListScreen} />
        {/* Route for My Dog screen */}
        <Stack.Screen name="MyDog" component={MyDogScreen} />
        {/* Route for Me screen */}
        <Stack.Screen name="Me" component={MeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
