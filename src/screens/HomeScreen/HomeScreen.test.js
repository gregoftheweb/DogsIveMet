import React from 'react';
import 'react-native';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';
import HomeScreen from './HomeScreen';

//check homescreen
it('renders correctly', () => {
  renderer.create(<HomeScreen />);
});

//check onpress events
describe('HomeScreen', () => {
  test('check button press', () => {
    const component = renderer.create(<HomeScreen />);
    console.log = jest.fn();
    // Find the button that has props.testID === 'button'
    const button = component.root.findByProps({testID: 'buttonNewDog'});
    // All codes that causes state updates should wrap in act(...)

    button.props.onPress();

    // Expect the result
    expect(console.log).toHaveBeenCalledWith('Create new Dog Record');
  });
});
