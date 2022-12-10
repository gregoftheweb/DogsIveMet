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
  test('check New Dog button press', () => {
    const component = renderer.create(<HomeScreen />);
    console.log = jest.fn();
    // Find the button that has props.testID === 'button'
    const button = component.root.findByProps({testID: 'buttonNewDog'});
    // All codes that causes state updates should wrap in act(...)
    button.props.onPress();
    // Expect the result
    expect(console.log).toHaveBeenCalledWith('Create new Dog Record');
  });
  test('check Dog List button press', () => {
    const component = renderer.create(<HomeScreen />);
    console.log = jest.fn();
    const button = component.root.findByProps({testID: 'buttonDogList'});
    button.props.onPress();
    expect(console.log).toHaveBeenCalledWith('Go to Dog List');
  });
  test('check My Dog button press', () => {
    const component = renderer.create(<HomeScreen />);
    console.log = jest.fn();
    const button = component.root.findByProps({testID: 'buttonMyDog'});
    button.props.onPress();
    expect(console.log).toHaveBeenCalledWith('Go to My Dog');
  });
  test('check Me and mine button press', () => {
    const component = renderer.create(<HomeScreen />);
    console.log = jest.fn();
    const button = component.root.findByProps({testID: 'buttonMe'});
    button.props.onPress();
    expect(console.log).toHaveBeenCalledWith('Go to Me');
  });
});
