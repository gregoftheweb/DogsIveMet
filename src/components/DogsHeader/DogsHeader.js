import {View, Text, StyleSheet, Image, useWindowDimensions} from 'react-native';
import React from 'react';

import Logo from '../../../assets/images/DIM-Logo-60.png';

const DogsHeader = (props) => {
  const {width} = useWindowDimensions();

  return (
    <View style={styles.container}>
      <View style={styles.rowItem2}>
        <Image
          source={Logo}
          style={[styles.logo, {width: width * 0.25}]}
          resizeMode="contain"
        />
      </View>
      <View style={styles.rowItem1}>
        <Text style={styles.title}>{props.title}</Text>
      </View>
    </View>
  );
};

export default DogsHeader;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#fbf9fc',
  },
  rowItem1: {
    width: '70%',
    alignItems: 'center',
  },
  rowItem2: {
    width: '30%',
    marginTop: '2%',
  },
  logo: {
    maxWidth: 200,
  },
  title: {
    color: '#031440',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
