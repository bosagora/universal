import { Input, InputField, FormControl, VStack } from '@gluestack-ui/themed';
import { useFormik } from 'formik';
import * as yup from 'yup';
import React, { useRef, useState } from 'react';
import { observer } from 'mobx-react';
import { AUTH_STATE } from '../../stores/user.store';
import { useStores } from '../../stores';
import '@ethersproject/shims';
import { ContractUtils } from 'dms-sdk-client-v2';
import * as Clipboard from 'expo-clipboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
  PhoneNumberUtil,
  PhoneNumberFormat as PNF,
} from 'google-libphonenumber';
import { useTranslation } from 'react-i18next';
import MobileHeader from '../../components/MobileHeader';
import { WrapBox } from '../../components/styled/layout';
import {
  ActiveButtonText,
  RobotoRegularText,
} from '../../components/styled/text';
import { WrapButton } from '../../components/styled/button';

const registerSchema = yup.object().shape({
  n1: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(2, 'Must be exactly 2 digits')
    .max(2, 'Must be exactly 2 digits'),
  n2: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(2, 'Must be exactly 2 digits')
    .max(2, 'Must be exactly 2 digits'),
  n3: yup
    .string()
    .required()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(2, 'Must be exactly 2 digits')
    .max(2, 'Must be exactly 2 digits'),
});

const registerInitialValues = {
  n1: '',
  n2: '',
  n3: '',
};

const PhoneAuth = observer(({ navigation }) => {
  const { t } = useTranslation();
  const [phoneCode, setPhoneCode] = useState('');
  const [requestId, setRequestId] = useState('');
  const { userStore, secretStore } = useStores();

  function secondsToTime(secs) {
    let hours = Math.floor(secs / (60 * 60));

    let divisor_for_minutes = secs % (60 * 60);
    let minutes = Math.floor(divisor_for_minutes / 60);

    let divisor_for_seconds = divisor_for_minutes % 60;
    let seconds = Math.ceil(divisor_for_seconds);
    console.log(
      hours,
      divisor_for_minutes,
      minutes,
      divisor_for_seconds,
      seconds,
    );

    let obj = {
      h: hours,
      m: minutes,
      s: seconds,
      ts: secs,
    };
    return obj;
  }
  const [timeLeft, setTimeLeft] = useState({});
  let fontRef = useRef(0);
  let intervalRef = useRef(0);

  const initiateTimer = () => {
    fontRef.current = 180;
    let timeLeftObj = secondsToTime(fontRef.current);
    setTimeLeft(timeLeftObj);
  };

  const startTimer = () => {
    initiateTimer();
    let interval = setInterval(timer, 1000);
    intervalRef.current = interval;
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    fontRef.current = 0;
    intervalRef.current = 0;
    setTimeLeft(secondsToTime(0));
  };

  const timer = () => {
    fontRef.current = fontRef.current - 1;
    if (fontRef.current > 0) {
      setTimeLeft(secondsToTime(fontRef.current));
    } else {
      setRequestId('');
      stopTimer();
    }
  };

  async function registerPhone() {
    userStore.setLoading(true);

    const steps = [];
    try {
      const phone = '+' + userStore.countryPhoneCode + phoneCode;
      const phoneUtil = PhoneNumberUtil.getInstance();
      const number = phoneUtil.parseAndKeepRawInput(phone);
      const pf = phoneUtil.format(number, PNF.INTERNATIONAL);
      console.log(phoneUtil.getRegionCodeForNumber(number));
      const phoneType = phoneUtil.getNumberType(number);
      const isValid = phoneUtil.isValidNumber(number);
      if (!isValid || (phoneType !== 1 && phoneType !== 2)) {
        userStore.setLoading(false);
        alert(t('phone.alert.invalid'));
        return;
      }

      userStore.setPhoneFormatted(pf);
      for await (const step of secretStore.client.link.register(pf)) {
        console.log('register step :', step);
        steps.push(step);
      }
      if (steps.length === 2 && steps[1].key === 'requested') {
        const requestId = steps[1].requestId;
        setRequestId(requestId);
        handleValidTime();
      }
      userStore.setLoading(false);
    } catch (e) {
      await Clipboard.setStringAsync(JSON.stringify(e));
      console.log('error : ', e);
      userStore.setLoading(false);
      alert(t('phone.alert.reg.fail') + JSON.stringify(e.message));
    }
  }

  function handleValidTime() {
    startTimer();
  }

  async function submitPhone(authNum) {
    userStore.setLoading(true);
    const steps = [];
    try {
      for await (const step of secretStore.client.link.submit(
        requestId,
        authNum,
      )) {
        steps.push(step);
        console.log('submit step :', step);
      }
      if (steps.length === 2 && steps[1].key === 'accepted') {
        completeAuth();
      }
      userStore.setLoading(false);
    } catch (e) {
      await Clipboard.setStringAsync(JSON.stringify(e));
      console.log('error : ', e);
      userStore.setLoading(false);
      alert(t('phone.alert.auth.fail') + JSON.stringify(e.message));
    }
  }
  function completeAuth() {
    stopTimer();
    changeUnpayableToPayable().then(() => {
      alert(t('phone.alert.auth.done'));
      userStore.setPhone(userStore.countryPhoneCode + phoneCode);
      userStore.setAuthState(AUTH_STATE.DONE);
    });
  }
  async function changeUnpayableToPayable() {
    const phone = userStore.phoneFormatted;
    const balance = await secretStore.client.ledger.getPointBalance(
      secretStore.address,
    );
    console.log('Point balance Before changing :', balance);

    const phoneHash = ContractUtils.getPhoneHash(phone);
    const unpayablePoint =
      await secretStore.client.ledger.getUnPayablePointBalance(phoneHash);
    console.log('Unpayable point :', unpayablePoint.toString());

    if (unpayablePoint.lte(0)) return;

    for await (const step of secretStore.client.ledger.changeToPayablePoint(
      phone,
    )) {
      console.log('change unpayable to payable step :', step);
    }
    const afterBalance = await secretStore.client.ledger.getPointBalance(
      secretStore.address,
    );
    console.log('Point balance After changing :', afterBalance);
  }

  const formik = useFormik({
    initialValues: registerInitialValues,
    validationSchema: registerSchema,

    onSubmit: (values, { resetForm }) => {
      console.log('form values :', values);
      const authNums = values.n1 + values.n2 + values.n3;
      submitPhone(authNums)
        .then((r) => {
          if (r === true) {
            completeAuth();
          }
        })
        .catch((error) => {
          console.log(error);
        });
      resetForm();
    },
  });

  return (
    <WrapBox style={{ backgroundColor: userStore.contentColor }}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        scrollEnabled={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps='handled'
        scrollToOverflowEnabled={true}
        enableAutomaticScroll={true}>
        <MobileHeader
          title={t('phone.header.title')}
          subTitle={t('phone.header.subtitle')}
        />

        <VStack mt={30}>
          <RobotoRegularText fontSize={12} lineHeight={18} fontWeight={400}>
            {t('phone.number')}
          </RobotoRegularText>
          <VStack>
            <Input
              mt={5}
              style={{
                height: 48,
                borderWidth: 1,
                borderColor: '#E4E4E4',
              }}>
              <InputField
                style={{
                  fontFamily: 'Roboto-Medium',
                  lineHeight: 20,
                  fontSize: 15,
                  color: '#12121D',
                }}
                placeholder={t('phone.body.input.a')}
                value={userStore.countryPhoneCode}
                onChangeText={userStore.setCountryPhoneCode}
              />
            </Input>

            <Input
              mt={5}
              style={{
                height: 48,
                borderWidth: 1,
                borderColor: '#E4E4E4',
              }}>
              <InputField
                style={{
                  fontFamily: 'Roboto-Medium',
                  lineHeight: 20,
                  fontSize: 15,
                  color: '#12121D',
                }}
                placeholder={t('phone.number')}
                value={phoneCode}
                onChangeText={setPhoneCode}
              />
            </Input>
            <WrapButton
              mt={5}
              isDisabled={requestId !== ''}
              onPress={() => {
                registerPhone();
              }}>
              <ActiveButtonText>{t('next')}</ActiveButtonText>
            </WrapButton>
          </VStack>
          <RobotoRegularText
            mt={15}
            fontSize={13}
            lineHeight={18}
            fontWeight={400}>
            {t('phone.body.text.a')}
          </RobotoRegularText>

          <VStack mt={40}>
            {fontRef.current > 0 ? (
              <RobotoRegularText
                color='#12121D'
                alignSelf='flex-end'
                fontSize={12}
                lineHeight={18}
                fontWeight={400}>
                {t('phone.body.text.b')} {timeLeft.m < 10 ? '0' : ''}
                {timeLeft.m}:{timeLeft.s < 10 ? '0' : ''}
                {timeLeft.s}
              </RobotoRegularText>
            ) : null}
            <FormControl isRequired={true} isInvalid={!!formik.errors.n1}>
              <Input
                mt={5}
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: '#E4E4E4',
                }}>
                <InputField
                  style={{
                    fontFamily: 'Roboto-Medium',
                    lineHeight: 20,
                    fontSize: 15,
                    color: '#12121D',
                  }}
                  keyboardType='number-pad'
                  placeholder='#1'
                  onChangeText={formik.handleChange('n1')}
                  onBlur={formik.handleBlur('n1')}
                  value={formik.values?.n1}
                />
              </Input>
            </FormControl>
            <FormControl
              size='md'
              isRequired={true}
              isInvalid={!!formik.errors.n2}>
              <Input
                mt={5}
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: '#E4E4E4',
                }}>
                <InputField
                  style={{
                    fontFamily: 'Roboto-Medium',
                    lineHeight: 20,
                    fontSize: 15,
                    color: '#12121D',
                  }}
                  keyboardType='number-pad'
                  placeholder='#2'
                  onChangeText={formik.handleChange('n2')}
                  onBlur={formik.handleBlur('n2')}
                  value={formik.values?.n2}
                />
              </Input>
            </FormControl>
            <FormControl
              size='md'
              isRequired={true}
              isInvalid={!!formik.errors.n3}>
              <Input
                mt={5}
                style={{
                  height: 48,
                  borderWidth: 1,
                  borderColor: '#E4E4E4',
                }}>
                <InputField
                  style={{
                    fontFamily: 'Roboto-Medium',
                    lineHeight: 20,
                    fontSize: 15,
                    color: '#12121D',
                  }}
                  keyboardType='number-pad'
                  placeholder='#3'
                  onChangeText={formik.handleChange('n3')}
                  onBlur={formik.handleBlur('n3')}
                  value={formik.values?.n3}
                />
              </Input>
            </FormControl>
            <WrapButton
              isDisabled={requestId === ''}
              onPress={formik.handleSubmit}
              my='$4'>
              <ActiveButtonText>{t('authenticate')}</ActiveButtonText>
            </WrapButton>
          </VStack>
        </VStack>
      </KeyboardAwareScrollView>
    </WrapBox>
  );
});

export default PhoneAuth;
