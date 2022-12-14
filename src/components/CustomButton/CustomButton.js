import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import {textTreatment, colorPalette} from '../../../assets/styles/globalStyles';

const CustomButton = ({onPress, text, type = 'PRIMARY', bgColor, fgColor}) => {
  const {width} = useWindowDimensions();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        {width: '80%'},
        styles[`container_${type}`],
        bgColor ? {backgroundColor: bgColor} : {},
      ]}>
      <Text
        style={[
          styles.text,
          styles[`text_${type}`],
          fgColor ? {color: fgColor} : {},
        ]}>
        {text}
      </Text>
    </Pressable>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    width: '80%',
    padding: 15,
    marginVertical: 5,
    alignItems: 'center',
    borderRadius: 5,
  },
  container_PRIMARY: {
    backgroundColor: '#00749c',
    fontWeight: '500',
  },
  container_SECONDARY: {
    borderColor: '#3b71f3',
    borderWidth: 2,
  },
  container_TERTIARY: {},
  text: {
    fontWeight: '600',
    color: '#00749c',
  },
  text_PRIMARY: {
    color: '#52082b',
    fontWeight: 'bold',
    fontFamily: 'sans-serif',
    fontSize: 25,
  },
  text_SECONDARY: {
    color: '#3b71f3',
  },
  text_TERTIARY: {
    color: '#00749c',
    fontSize: 18,
    textDecorationLine: 'underline',
  },
});
