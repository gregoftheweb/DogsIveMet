import React from 'react';
import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import DatePicker from './DatePicker';

it('renders correctly', () => {
  renderer.create(<DatePicker />);
});
