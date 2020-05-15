import React, { useEffect, useState } from 'react';
import { View, TextInput, Dimensions } from 'react-native';
// @ts-ignore
import { AsYouTypeFormatter, PhoneNumberUtil } from 'google-libphonenumber';
import { CountryPicker } from './CountryPicker';
import countries from './countries.json';

const { width: dWidth } = Dimensions.get('window');

const phoneUtil = PhoneNumberUtil.getInstance();

interface IPhoneInput {
  onChange: (text: string) => void;
  initialValue?: string;
  width?: number;
  containerStyle?: any;
  inputStyle?: any;
  inputProps?: any;
  isValid?: (param: boolean) => any;
}

const parse = (number: string, iso2: string) => {
  try {
    return phoneUtil.parse(number, iso2);
  } catch (err) {
    // phone number not recognized or not complete
    return null;
  }
};

const isValidNumber = (number: string, iso2: string) => {
  const phoneInfo = parse(number, iso2);

  if (phoneInfo) {
    return phoneUtil.isValidNumber(phoneInfo);
  }

  return false;
};

export const PhoneInput = (props: IPhoneInput) => {
  const {
    onChange,
    initialValue,
    width = dWidth,
    containerStyle = {},
    inputStyle = {},
    inputProps = {},
    isValid,
  } = props;

  const [countryIso, setCountryIso] = useState('us');
  const [phoneNumber, setPhoneNumber] = useState(initialValue || '+1');

  const format = (number: string) => {
    const selCountry = countries.filter(
      (c) => c.dialCode === number.split('+').pop(),
    )[0];
    if (selCountry) {
      return number;
    }
    const formatter = new AsYouTypeFormatter(countryIso);
    let formatted = '+';

    number
      .replace(/-/g, '')
      .replace(/ /g, '')
      .split('')
      .forEach((n: string) => (formatted = formatter.inputDigit(n)));
    return formatted;
  };

  useEffect(() => {
    if (!countryIso) {
      return;
    }
    const selectedCountry = countries.filter((c) => c.iso2 === countryIso)[0];
    onChange('');
    setPhoneNumber(`+${selectedCountry.dialCode}`);
  }, [countryIso]);

  const onChangeNumber = (number: string) => {
    onChange(number);
    if (!number) {
      isValid && isValid(false);
      return setPhoneNumber('+');
    }
    if (number.length <= 2) {
      isValid && isValid(false);
      setCountryIso('');
    }
    const valid = isValidNumber(number, countryIso);
    isValid && isValid(valid);
    setPhoneNumber(number);
  };
  return (
    <View style={{ width, flexDirection: 'row', alignItems: 'center' }}>
      <CountryPicker
        iso2={countryIso}
        onCountryChange={setCountryIso}
        phoneNumber={phoneNumber}
        width={width}
        containerStyle={containerStyle}
      />
      <TextInput
        {...inputProps}
        value={format(phoneNumber)}
        onChangeText={onChangeNumber}
        style={{
          width: width * 0.67,
          borderWidth: 1,
          fontSize: 20,
          backgroundColor: '#fff',
          borderColor: '#e9e9e9',
          borderRadius: 5,
          marginLeft: width * 0.03,
          color: '#717171',
          letterSpacing: 1.5,
          padding: width * 0.02,
          ...containerStyle,
          ...inputStyle,
        }}
      />
    </View>
  );
};
