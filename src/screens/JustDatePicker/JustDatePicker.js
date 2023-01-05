import {StyleSheet, Text, View, Button, Platform} from 'react-native';
import React, {useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import DatePicker from '../../components/DatePicker';

const JustDatePicker = () => {
  return (
    <View>
      <DatePicker />
    </View>
  );
};

export default JustDatePicker;

const styles = StyleSheet.create({});
