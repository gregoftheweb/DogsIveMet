import React from 'react';
import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import DogsHeader from './DogsHeader';

it('renders correctly', () => {
  renderer.create(<DogsHeader />);
});
