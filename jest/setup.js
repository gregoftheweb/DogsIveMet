 
// include this line for mocking react-native-gesture-handler
import 'react-native-gesture-handler/jestSetup';

jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ 
      navigate: jest.fn()
    }),
  }))