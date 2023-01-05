import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  useWindowDimensions,
} from 'react-native';
import React, {useState} from 'react';
import CameraIcon from '../../../assets/images/cameraIcon_80.png';
import vanillaDog from '../../../assets/images/vanillaDog.png';
import CustomInput from '../../components/CustomInput';
import CustomButton from '../../components/CustomButton';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import DogsHeader from '../../components/DogsHeader';
import DatePicker from '../../components/DatePicker';

const NewDogScreen = () => {
  const {width} = useWindowDimensions();

  const navigation = useNavigation();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm();

  const onNewDogSaved = data => {
    console.log('Saved a new Dog Record');
    navigation.navigate('Home');
  };

  const onCancel = data => {
    console.log('canceled the create new dog screen');
    navigation.navigate('Home');
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <DogsHeader title="New Dog" />

      <View style={styles.container}>
        <View
          style={[
            styles.cameraRowItem,
            {width: width * 0.65},
            {height: width * 0.65},
          ]}>
          <Image source={vanillaDog} resizeMode="contain" />
        </View>
        <View style={styles.rowItem2}>
          <Image
            source={CameraIcon}
            style={[styles.camera, {width: width * 0.25}]}
            resizeMode="contain"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <CustomInput
          name="dogName"
          placeholder="New Dog Name"
          control={control}
          rules={{required: 'New dog name is required'}}
        />
      </View>

      <View style={styles.buttonContainer}>
        <CustomInput
          name="dogBreed"
          placeholder="New Dog Breed"
          control={control}
          rules={{required: 'New dog breed is required'}}
        />
      </View>
      <View style={styles.buttonContainer}>
        <CustomInput
          name="whereMet"
          placeholder="Where did we meet?"
          control={control}
          rules={{required: 'Where I met the dog is required'}}
        />
      </View>

      <View style={styles.container}>
        <DatePicker />
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.rowItem1}>
          <CustomButton
            text="Save New Dog"
            onPress={onNewDogSaved}
            fgColor="white"
            bgColor="#aa3278"
            type="PRIMARY"
            testID="buttonNewDog"
          />
        </View>
        <View style={styles.rowItem2}>
          <CustomButton
            text="Cancel"
            onPress={onCancel}
            type="TERTIARY"
            testID="buttonCancelNewDog"
          />
        </View>
      </View>
    </ScrollView>
  );
};

export default NewDogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#fbf9fc',
  },
  bottomContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#fbf9fc',
    justifyContent: 'flex-end',
    marginTop: 15,
  },
  datePickerContainer: {
    width: '95%',
    borderWidth: 2,
    borderColor: '#004055',
    borderRadius: 5,
    height: 100,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginRight: 10,
    marginLeft: 10,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
    backgroundColor: '#fbf9fc',
    justifyContent: 'flex-start',
    marginTop: 5,
    marginRight: 10,
    marginLeft: 10,
  },
  rowItem1: {
    width: '70%',
    alignItems: 'center',
  },
  rowItem2: {
    width: '30%',
    marginTop: '2%',
  },
  cameraRowItem: {
    width: '70%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#004055',
    borderRadius: 5,
    margin: 10,
    marginTop: 15,
  },

  camera: {
    maxWidth: 200,
  },

  datePicker: {
    height: 80,
    alignSelf: 'center',
  },
});
