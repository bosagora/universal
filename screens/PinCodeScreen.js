import React, { useEffect } from 'react';
import { PinCode, PinCodeT } from 'react-native-pincode-bosagora-ys';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { StyleSheet } from 'react-native';
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import * as LocalAuthentication from 'expo-local-authentication';
import * as RootNavigation from '../utils/root.navigation';
import { useTranslation } from 'react-i18next';

const PinCodeScreen = observer(() => {
  const { t } = useTranslation();
  const { pinStore, userStore } = useStores();

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

  useEffect(() => {
    if (userStore.state === 'DONE' && pinStore.visible) checkBiometrics();
  }, [pinStore.visible]);

  const checkBiometrics = async () => {
    const hasBiometrics = await LocalAuthentication.hasHardwareAsync();
    const hasEnrolledBiometrics = await LocalAuthentication.isEnrolledAsync();

    console.log(
      'check bio :',
      hasBiometrics,
      hasEnrolledBiometrics,
      userStore.enableBio,
    );
    if (hasBiometrics && hasEnrolledBiometrics && userStore.enableBio) {
      await authenticateWithBiometrics();
    } else {
      pinStore.setMode(PinCodeT.Modes.Enter);
      pinStore.setSuccessEnter(false);
      pinStore.setVisible(true);
    }
  };

  const authenticateWithBiometrics = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate with biometrics',
    });
    if (result.success) {
      // Biometric authentication successful
      console.log('Biometric authentication successful');
      if (pinStore.nextScreen === 'setPincode') {
        pinStore.setMode(PinCodeT.Modes.Set);
      } else {
        enterCase();
      }
    } else {
      // Biometric authentication failed
      console.log('Biometric authentication failed');
    }
  };

  function enterCase() {
    if (pinStore.nextScreen === 'setPincode') {
      pinStore.setMode(PinCodeT.Modes.Set);
      pinStore.setNextScreen('none');
    } else {
      const nextScreen = pinStore.nextScreen;
      pinStore.setNextScreen('none');
      if (nextScreen !== 'none') RootNavigation.navigate(nextScreen);
      pinStore.setSuccessEnter(true);
      pinStore.setVisible(false);
    }
  }
  return (
    <PinCode
      pin={pinStore.code}
      visible={pinStore.visible}
      mode={pinStore.mode}
      options={{
        backSpace: <Icon name='backspace' size={24} color='white' />,
        lockIcon: <Icon name='lock' size={24} color='white' />,
        retryLockDuration: 1000,
        maxAttempt: 5,
        useFooter: pinStore.useFooter,
      }}
      textOptions={customTexts}
      styles={customStyles}
      onEnterCancel={() => {
        console.log('Cancel Enter');
        pinStore.setVisible(false);
      }}
      onEnter={() => {
        console.log('onEnter');
        enterCase();
      }}
      onSet={(newPin) => {
        console.log('onSet');
        pinStore.setCode(newPin);
        pinStore.setMode(PinCodeT.Modes.Enter);
        pinStore.setVisible(false);
      }}
      onReset={() => {
        console.log('onReset');
        pinStore.setCode(undefined);
      }}
      onSetCancel={() => {
        console.log('onSetCancel');
        pinStore.setVisible(false);
        pinStore.setMode('enter');
      }}
      onModeChanged={(lastMode, newMode) => {
        console.log('onModeChanged');
      }}
    />
  );
});

export default PinCodeScreen;
