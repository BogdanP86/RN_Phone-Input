import React, { useEffect, useState } from 'react';
import { View, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-community/picker';
import { Button, Icon } from 'react-native-elements';
import Modal from 'react-native-modal';

const { width: dWidth, height } = Dimensions.get('window');
// @ts-ignore
import { PhoneNumberUtil } from 'google-libphonenumber';
import FastImage from 'react-native-fast-image';

import countries from './countries.json';
import { flags } from './flagMapping';

const phoneUtil = PhoneNumberUtil.getInstance();

interface ICountry {
  iso2: string;
  onCountryChange: (c: string) => void;
  phoneNumber: string;
  width?: number;
  containerStyle?: any;
}

export const CountryPicker = (props: ICountry) => {
  const {
    iso2,
    onCountryChange,
    phoneNumber,
    width = dWidth,
    containerStyle,
  } = props;
  const [selectedValue, setSelectedValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [countryIso, setCountryIso] = useState(iso2);

  useEffect(() => {
    if (!iso2 && countryIso) {
      setCountryIso('');
    } else {
      setCountryIso(iso2);
    }
  }, [iso2]);

  const checkCountries = (countriesList: any, phoneMeta: any) => {
    const number = phoneMeta.getNationalNumber();
    const areaCode = number.toString().substr(0, 3);
    if (!areaCode) {
      return countriesList.filter((c: any) => !c.areaCodes)[0];
    }
    const found = countriesList.filter(
      (c: any) =>
        c.areaCodes && c.areaCodes.filter((a: string) => a === areaCode)[0],
    )[0];
    return found || countriesList.filter((c: any) => !c.areaCodes)[0];
  };

  const getCountryCode = () => {
    try {
      const phoneMeta = phoneUtil.parse(phoneNumber, countryIso);
      const countryCode = phoneMeta.getCountryCode();
      const selectedCountries = countries.filter(
        (c) => c.dialCode === countryCode.toString(),
      );
      const selectedCountry =
        selectedCountries.length === 1
          ? selectedCountries[0]
          : checkCountries(selectedCountries, phoneMeta);
      const { iso2: sIso2 } = selectedCountry;
      if (countryIso !== sIso2) {
        setCountryIso(sIso2);
      }
    } catch (e) {
      // Skip getting country code, not yet a recognizable number. Ex. +40 or +1
    }
  };

  useEffect(() => {
    getCountryCode();
  }, [phoneNumber]);

  const renderItems = () => {
    return countries.map((country) => (
      <Picker.Item
        key={country.iso2}
        label={country.name}
        value={country.iso2}
      />
    ));
  };
  const renderPicker = () => {
    return (
      <Modal
        isVisible={visible}
        backdropTransitionOutTiming={0}
        onBackdropPress={() => setVisible(false)}
        onBackButtonPress={() => setVisible(false)}
        style={{
          alignItems: 'center',
          justifyContent: 'flex-end',
          margin: 0,
        }}>
        <View
          style={{
            height: height * 0.4,
            backgroundColor: '#fff',
            borderRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              borderBottomWidth: 1,
              borderColor: '#e9e9e9',
            }}>
            <Button
              title="Cancel"
              type="clear"
              containerStyle={{ width: '40%' }}
              onPress={() => setVisible(false)}
              titleStyle={{
                color: '#717171',
                opacity: 0.6,
              }}
            />
            <Button
              title="Confirm"
              type="clear"
              containerStyle={{ width: '40%' }}
              onPress={() => {
                setVisible(false);
                onCountryChange(selectedValue);
              }}
            />
          </View>
          <Picker
            selectedValue={selectedValue}
            style={{ width: dWidth, height: height * 0.4, flex: 1 }}
            itemStyle={{ height: '100%' }}
            onValueChange={(itemValue) =>
              setSelectedValue(itemValue as string)
            }>
            {renderItems()}
          </Picker>
        </View>
      </Modal>
    );
  };
  return (
    <View>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{
          width: width * 0.25,
          borderWidth: 1,
          borderRadius: 5,
          flexDirection: 'row',
          borderColor: '#e9e9e9',
          alignItems: 'center',
          justifyContent: 'space-around',
          backgroundColor: '#f9f9f9',
          marginLeft: width * 0.02,
          padding: width * 0.018,
          ...containerStyle,
        }}>
        <Image
          source={countryIso ? (flags as any)[countryIso] : null}
          style={{ width: '40%', height: '65%' }}
          resizeMode={FastImage.resizeMode.stretch}
        />
        <Icon
          name="chevron-down"
          type="material-community"
          size={30}
          color="#d0d0d0"
        />
      </TouchableOpacity>
      {renderPicker()}
    </View>
  );
};
