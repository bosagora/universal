import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import {
  Box,
  FormControl,
  HStack,
  Input,
  InputField,
  VStack,
} from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader';
import { getClient } from '../../utils/client';
import {
  compareFloatTexts,
  convertProperValue,
  subFloatTexts,
  truncateMiddleString,
  validateNumberWithDecimal,
} from '../../utils/convert';
import { Amount, BOACoin } from 'dms-sdk-client-v2';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  AppleSDGothicNeoSBText,
  Para2Text,
  RobotoMediumText,
  RobotoRegularText,
  RobotoSemiBoldText,
} from '../../components/styled/text';
import { Feather } from '@expo/vector-icons';
import { WrapButton, WrapHistoryButton } from '../../components/styled/button';
import { useFormik } from 'formik';
import * as yup from 'yup';
import * as Clipboard from 'expo-clipboard';
import TransferTab from '../../components/TransferTab';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const registerInitialValues = {
  amount: '',
  receiver: '',
};
const registerSchema = yup.object().shape({
  amount: yup
    .string()
    .matches(/^(\-)?(\d+)?(\.\d+)?$/, 'Invalid number format')
    .test(
      'positive',
      'Number must be greater than or equal to 0',
      (value) => parseFloat(value) > 0,
    )
    .required(),
});
const Transfer = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore } = useStores();
  const [balanceMainChain, setBalanceMainChain] = useState(new BOACoin(0));
  const [balanceSideChain, setBalanceSideChain] = useState(new BOACoin(0));
  const [sideChainFee, setSideChainFee] = useState(new BOACoin(0));
  const [mainChainFee, setMainChainFee] = useState(new BOACoin(0));
  const [ableToDo, setAbleToDo] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  useEffect(() => {
    const fetchHistory = async () => {
      const newBalanceMainChain =
        await secretStore.client.ledger.getMainChainBalance(
          secretStore.address,
        );
      console.log('mainChain balance :', newBalanceMainChain);
      const balanceMainChainConv = new BOACoin(newBalanceMainChain);
      setBalanceMainChain(balanceMainChainConv);

      const newBalanceSideChain =
        await secretStore.client.ledger.getTokenBalance(secretStore.address);
      console.log('sideChain balance :', newBalanceSideChain);
      const balanceSideChainConv = new BOACoin(newBalanceSideChain);
      setBalanceSideChain(balanceSideChainConv);
      console.log('balanceSideChainConv :', balanceSideChainConv.toBOAString());

      const sideChainInfo =
        await secretStore.client.ledger.getChainInfoOfSideChain();
      const mainChainInfo =
        await secretStore.client.ledger.getChainInfoOfMainChain();
      const sideChainFee1 = new BOACoin(sideChainInfo.network.bridgeFee);
      const mainChainFee1 = new BOACoin(mainChainInfo.network.bridgeFee);
      console.log(
        'sideChainInfo.network.bridgeFee :',
        sideChainInfo.network.bridgeFee,
      );
      setSideChainFee(sideChainFee1);
      setMainChainFee(mainChainFee1);
    };
    fetchHistory();
  }, []);

  const formik = useFormik({
    initialValues: registerInitialValues,
    validationSchema: registerSchema,

    onSubmit: (values, { resetForm }) => {
      console.log('form values :', values);
      if (receiveAddress === '') return;
      if (userStore.isMainChainTransfer)
        doMainChainTransfer().then((v) => navigation.navigate('Wallet'));
      else doSideChainTransfer().then((v) => navigation.navigate('Wallet'));
      resetForm();
    },
  });

  async function doMainChainTransfer() {
    try {
      userStore.setLoading(true);
      const amount = Amount.make(formik.values.amount, 18).value;
      let depositId = '';
      const steps = [];
      for await (const step of secretStore.client.ledger.transferInMainChain(
        receiveAddress,
        amount,
      )) {
        console.log('doMainChainTransfer step :', step);
        steps.push(step);
      }
      if (steps.length === 3 && steps[2].key === 'done') {
        userStore.setLoading(false);
      }
    } catch (e) {
      await Clipboard.setStringAsync(JSON.stringify(e));
      console.log('error : ', e);
      userStore.setLoading(false);
      alert(t('phone.alert.reg.fail') + JSON.stringify(e.message));
    }
  }

  async function doSideChainTransfer() {
    try {
      userStore.setLoading(true);
      const amount = Amount.make(formik.values.amount, 18).value;
      let depositId = '';

      const type =
        await secretStore.client.ledger.getLoyaltyType(receiveAddress);
      if (type !== 1) {
        userStore.setLoading(false);
        alert('미등록 또는 토큰을 사용할 수 없는 주소로 전송할 수 없습니다.');
        return;
      }
      const steps = [];
      for await (const step of secretStore.client.ledger.transfer(
        receiveAddress,
        amount,
      )) {
        console.log('doSideChainTransfer step :', step);
        steps.push(step);
      }
      userStore.setLoading(false);
    } catch (e) {
      await Clipboard.setStringAsync(JSON.stringify(e));
      console.log('error : ', e);
      userStore.setLoading(false);
      alert(t('phone.alert.reg.fail') + JSON.stringify(e.message));
    }
  }

  const takeMaxAmount = () => {
    const balance = userStore.isMainChainTransfer
      ? balanceMainChain.toBOAString()
      : balanceSideChain.toBOAString();
    console.log('max :', convertProperValue(balance));
    const vv = convertProperValue(balance).split(',').join('');
    changeAmount(vv);
  };

  const changeAmount = (v) => {
    console.log('change value :', v);
    console.log('change include comma :', v.includes(','));
    const vv = v.includes(',') ? v.split(',').join('') : v;
    formik.setFieldValue('amount', vv);
    const balance = userStore.isMainChainTransfer
      ? balanceMainChain.toBOAString()
      : balanceSideChain.toBOAString();
    const fee = userStore.isMainChainTransfer ? mainChainFee : sideChainFee;
    if (
      validateNumberWithDecimal(vv) &&
      compareFloatTexts(vv, fee.toBOAString()) &&
      compareFloatTexts(balance, vv)
    ) {
      setAbleToDo(true);
      const aa = subFloatTexts(vv, fee.toBOAString());
      console.log('aa : ', aa);
      setReceiveAmount(aa);
    } else {
      setAbleToDo(false);
      setReceiveAmount('0');
    }
  };

  const changeReceiver = (v) => {
    console.log('reciever : ', v);
    const isEthAddress = ethers.utils.isAddress(v);
    console.log('isEthAddress :', isEthAddress);
    if (isEthAddress) {
      formik.setFieldValue('receiver', '');
      setReceiveAddress(v);
    } else {
      formik.setFieldValue('receiver', v);
      setReceiveAddress('');
    }
  };

  const removeReceiver = () => {
    setReceiveAddress('');
  };

  return (
    <WrapBox
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}>
      <KeyboardAwareScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        enableOnAndroid={true}
        scrollEnabled={true}
        extraScrollHeight={100}
        keyboardShouldPersistTaps='handled'
        scrollToOverflowEnabled={true}
        enableAutomaticScroll={true}>
        <MobileHeader title={t('Transfer')} subTitle='' />
        <TransferTab userStore={userStore} />
        <Box mt={20} w='$full'>
          <Box bg='white' rounded='$sm'>
            <VStack>
              <FormControl size='md'>
                <HStack
                  alignItems='center'
                  justifyContent='space-between'
                  space='sm'>
                  <AppleSDGothicNeoSBText
                    w={50}
                    color='#555555'
                    fontSize={15}
                    lineHeight={22}
                    fontWeight={500}>
                    From :
                  </AppleSDGothicNeoSBText>
                  <Input
                    flex={1}
                    mt={5}
                    isReadOnly={true}
                    style={{
                      height: 38,
                      borderWidth: 1,
                      borderColor: '#fff',
                    }}>
                    <InputField
                      style={{
                        fontFamily: 'Roboto-Medium',
                        lineHeight: 17,
                        fontSize: 15,
                        color: '#12121D',
                        textAlign: 'left',
                      }}
                      value={truncateMiddleString(
                        secretStore.address || '',
                        16,
                      )}
                    />
                  </Input>
                </HStack>
              </FormControl>

              <FormControl size='md'>
                <HStack
                  alignItems='center'
                  justifyContent='space-between'
                  space='sm'>
                  <AppleSDGothicNeoSBText
                    w={50}
                    color='#555555'
                    fontSize={15}
                    lineHeight={22}
                    fontWeight={500}>
                    To :
                  </AppleSDGothicNeoSBText>
                  {receiveAddress === '' ? (
                    <Input
                      flex={1}
                      multiline={false} // 다중 줄 입력 비활성화
                      numberOfLines={1} // 입력 필드에 표시할 줄 수
                      mt={5}
                      style={{
                        height: 38,
                        borderWidth: 1,
                        borderColor: '#E4E4E4',
                      }}>
                      <InputField
                        multiline={false} // 다중 줄 입력 비활성화
                        numberOfLines={1} // 입력 필드에 표시할 줄 수
                        style={{
                          fontFamily: 'Roboto-Medium',
                          lineHeight: 17,
                          fontSize: 15,
                          color: '#12121D',
                          textAlign: 'left',
                        }}
                        onChangeText={changeReceiver}
                        value={formik.values?.receiver}
                      />
                    </Input>
                  ) : (
                    <>
                      <Input
                        flex={1}
                        isReadOnly={true}
                        mt={5}
                        style={{
                          height: 38,
                          borderWidth: 1,
                          borderColor: '#E4E4E4',
                        }}>
                        <InputField
                          style={{
                            fontFamily: 'Roboto-Medium',
                            lineHeight: 17,
                            fontSize: 15,
                            color: '#12121D',
                            textAlign: 'left',
                          }}
                          value={truncateMiddleString(receiveAddress || '', 16)}
                        />
                      </Input>

                      <Feather
                        name='x-circle'
                        size={24}
                        color='black'
                        onPress={removeReceiver}
                      />
                    </>
                  )}
                </HStack>
              </FormControl>

              <Box py={30}>
                <FormControl size='md' isInvalid={!!formik.errors.amount}>
                  <VStack space='xs'>
                    <HStack
                      alignItems='center'
                      justifyContent='space-between'
                      space='sm'>
                      <Input
                        flex={1}
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
                            fontSize: 19,
                            color: '#12121D',
                            textAlign: 'right',
                          }}
                          // returnKeyLabel='Done'
                          // returnKeyType='done'
                          keyboardType='decimal-pad'
                          onChangeText={changeAmount}
                          onBlur={formik.handleBlur('amount')}
                          value={formik.values?.amount}
                        />
                      </Input>
                      <AppleSDGothicNeoSBText
                        w={50}
                        color='#555555'
                        fontSize={20}
                        lineHeight={22}
                        fontWeight={500}>
                        KIOS
                      </AppleSDGothicNeoSBText>
                    </HStack>
                    <HStack alignItems='center' justifyContent='flex-start'>
                      <RobotoRegularText
                        py={3}
                        fontSize={13}
                        lineHeight={18}
                        fontWeight={400}>
                        {' '}
                        {t('available')} :{' '}
                        {convertProperValue(
                          userStore.isMainChainTransfer
                            ? balanceMainChain.toBOAString()
                            : balanceSideChain.toBOAString(),
                        )}
                      </RobotoRegularText>

                      <WrapHistoryButton
                        borderRadius='$full'
                        h={20}
                        ml={10}
                        onPress={takeMaxAmount}>
                        <Para2Text style={{ fontSize: 12, color: '#707070' }}>
                          {t('max')}
                        </Para2Text>
                      </WrapHistoryButton>
                    </HStack>
                  </VStack>
                </FormControl>
              </Box>

              <WrapDivider my={2}></WrapDivider>
              <HStack
                my={10}
                alignItems='center'
                justifyContent='space-between'>
                <RobotoMediumText
                  fontSize={15}
                  fontWeight={500}
                  lightHeight={16}
                  color='#707070'>
                  {t('received.amount')} :
                </RobotoMediumText>
                <RobotoSemiBoldText>{receiveAmount}</RobotoSemiBoldText>
              </HStack>
              <WrapDivider my={2}></WrapDivider>
              <HStack
                my={10}
                alignItems='center'
                justifyContent='space-between'>
                <RobotoMediumText
                  fontSize={15}
                  fontWeight={500}
                  lightHeight={16}
                  color='#707070'>
                  {t('fee')} :
                </RobotoMediumText>
                <RobotoSemiBoldText>
                  {convertProperValue(sideChainFee.toBOAString())}
                </RobotoSemiBoldText>
              </HStack>
              <WrapDivider></WrapDivider>

              <WrapButton
                // isDisabled={formik.isValid}
                bg={ableToDo && receiveAddress !== '' ? '#5C66D5' : '#E4E4E4'}
                onPress={formik.handleSubmit}
                my='$4'>
                <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
              </WrapButton>
            </VStack>
          </Box>
        </Box>
      </KeyboardAwareScrollView>
    </WrapBox>
  );
});

export default Transfer;
