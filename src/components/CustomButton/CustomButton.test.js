import React from 'react';
import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import CustomButton from './CustomButton';

it('renders correctly', () => {
  renderer.create(<CustomButton />);
});

describe('CustomButton', () => {
  test('render button with text', () => {
    const component = renderer.create(<CustomButton />);
    // Expect the result
    expect(component.toJSON()).toMatchSnapshot();
  });
});
