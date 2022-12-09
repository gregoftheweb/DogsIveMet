//This palette is made up of the 6 colors. Hex color codes:  #00749c,  #00658f,  #004055,  #aa3278,  #52082b and  #031440.
//https://colorkit.co/palette/00749c-00658f-004055-aa3278-52082b-031440/

import {StyleSheet} from 'react-native';

const textTreatment = StyleSheet.create({
  regular: {
    color: '#004055',
  },
});

const colorPalette = StyleSheet.create({
  light: {
    color: '#00749c',
  },
  lightMid: {
    color: '#00658f',
  },
  midOne: {
    color: '#004055',
  },
  midTwo: {
    color: '#aa3278',
  },
  darkMid: {
    color: '#52082b',
  },
  dark: {
    color: '#031440',
  },
});

export {textTreatment, colorPalette};
