import React from 'react';
import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import NewDogScreen from './NewDogScreen';

//check homescreen
it('renders correctly', () => {
  renderer.create(<NewDogScreen />);
});
