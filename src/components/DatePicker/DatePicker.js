import {StyleSheet, Text, View, Button, Platform} from 'react-native';
import React, {useState} from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const DatePicker = (props) => {
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
    console.log(currentDate);
    props.newDate = currentDate;
    props.changeDate(currentDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.textBox}>
        Date I met the dog: {date.toLocaleString()}
        -- {props.someText}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: '100%',
        }}>
        <View style={styles.buttonStyle}>
          <Button onPress={showDatepicker} title="Change Date" />
        </View>
        <View style={styles.buttonStyle}>
          <Button onPress={showTimepicker} title="Change Time" />
        </View>
      </View>
      {show && (
        <DateTimePicker
          style={styles.textBox}
          value={date}
          mode={mode}
          is24Hour={true}
          onChange={onChange}
        />
      )}
    </View>
  );
};

export default DatePicker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fbf9fc',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textBox: {
    backgroundColor: 'white',
    borderColor: '#004055',
    width: '100%',
    borderWidth: 2,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 5,
    color: '#000000',
    fontWeight: '600',
  },
});
