import React, { useState } from 'react';
import { PinCode, PinCodeT } from 'react-native-pincode-bosagora-ys';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';

const InitPinCodeScreen = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { pinStore } = useStores();

  const customTexts = {
    enter: {
      subTitle: t('pin.enter.subTitle'),
    },
    set: {
      title: t('pin.set.title'),
      subTitle: '{{pinLength}} ' + t('pin.set.subTitle'),
      repeat: t('pin.set.repeat'),
    },
    locked: {
      title: t('pin.locked.title'),
      subTitle: `Wrong PIN {{maxAttempt}} times.\nTemporarily locked in {{lockDuration}}.`,
    },
  };

  const EnterAndSet = {
    header: {
      justifyContent: 'flex-start',
      alignItems: 'center',
      minHeight: 100,
    },
    title: {
      color: '#12121D',
      fontFamily: 'Roboto-Medium',
      fontWeight: 500,
      lineHeight: 28,
      fontSize: 25,
    },
    subTitle: {
      color: '#707070',
      fontFamily: 'Roboto-Medium',
      fontWeight: 400,
      lineHeight: 20,
      fontSize: 14,
    },
    pin: { backgroundColor: '#5C66D5' },
    button: {
      backgroundColor: '#E4E4E4',
      width: 72,
      height: 72,
      borderRadius: 60,
    },
    buttonText: {
      color: '#12121D',
      fontFamily: 'Roboto-Regular',
      fontWeight: 400,
      lineHeight: 28,
      fontSize: 28,
    },
    footerText: {
      color: '#8A8A8A',
      fontFamily: 'Roboto-Medium',
      fontWeight: 500,
      lineHeight: 24,
      fontSize: 16,
    },
  };

  const customStyles = {
    main: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 99,
      backgroundColor: '#fff',
    },
    enter: {
      ...EnterAndSet,
      buttonTextDisabled: { color: 'red' },
    },
    set: EnterAndSet,
    locked: {
      countdown: { borderColor: 'black' },
      countdownText: { color: 'black' },
    },
    reset: {
      confirmText: { color: '#a78bfa' },
    },
  };
  return (
    <PinCode
      pin={pinStore.code}
      visible={true}
      mode={PinCodeT.Modes.Set}
      options={{
        backSpace: <Icon name='backspace' size={24} color='#C0C0C0' />,
        lockIcon: <Icon name='lock' size={24} color='#C0C0C0' />,
        retryLockDuration: 1000,
        maxAttempt: 5,
      }}
      textOptions={customTexts}
      styles={customStyles}
      onSet={(newPin) => {
        pinStore.setCode(newPin);
        pinStore.setMode(PinCodeT.Modes.Enter);
        navigation.navigate('Secret');
      }}
      onSetCancel={() => navigation.goBack()}
    />
  );
});

export default InitPinCodeScreen;
