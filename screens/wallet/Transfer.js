import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import {
  Box,
  FlatList,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Image,
  Input,
  InputField,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader';
import { getClient } from '../../utils/client';
import {convertProperValue, timePadding, truncateMiddleString} from '../../utils/convert';
import { Amount, BOACoin, LedgerAction, NormalSteps } from 'dms-sdk-client';
import { BigNumber } from '@ethersproject/bignumber';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  AppleSDGothicNeoSBText,
  NumberText,
  Para2Text,
  Para3Text,
  ParaText,
  RobotoMediumText,
  RobotoRegularText,
  RobotoSemiBoldText,
} from '../../components/styled/text';
import DepositTabs from '../../components/DepositTab';
import {Feather, MaterialIcons} from '@expo/vector-icons';
import { WrapButton, WrapHistoryButton } from '../../components/styled/button';
import { useFormik, useFormikContext } from 'formik';
import * as yup from 'yup';
import Svg, { WithLocalSvg } from 'react-native-svg';

import bs from '../../assets/images/bosagora.svg';
import * as Clipboard from 'expo-clipboard';
import TransferTab from '../../components/TransferTab';

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
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');
  const [balanceMainChain, setBalanceMainChain] = useState(new BOACoin(0));
  const [balanceSideChain, setBalanceSideChain] = useState(new BOACoin(0));
  const [sideChainFee, setSideChainFee] = useState(new BOACoin(0));
  const [mainChainFee, setMainChainFee] = useState(new BOACoin(0));
  const [ableToDo, setAbleToDo] = useState(false);
  const [receiveAmount, setReceiveAmount] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState('');
  useEffect(() => {
    const fetchHistory = async () => {
      const { client: client1, address: userAddress } = await getClient();
      console.log('>>>>>>> userAddress :', userAddress);
      setClient(client1);
      setAddress(userAddress);
      const newBalanceMainChain =
        await client1.ledger.getMainChainBalance(userAddress);
      console.log('mainChain balance :', newBalanceMainChain);
      const balanceMainChainConv = new BOACoin(newBalanceMainChain);
      setBalanceMainChain(balanceMainChainConv);

      const newBalanceSideChain =
        await client1.ledger.getTokenBalance(userAddress);
      console.log('sideChain balance :', newBalanceSideChain);
      const balanceSideChainConv = new BOACoin(newBalanceSideChain);
      setBalanceSideChain(balanceSideChainConv);
      console.log('balanceSideChainConv :', balanceSideChainConv.toBOAString());

      const sideChainInfo = await client1.ledger.getChainInfoOfSideChain();
      const mainChainInfo = await client1.ledger.getChainInfoOfMainChain();
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
      if(receiveAddress === '') return
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
      for await (const step of client.ledger.transferInMainChain(receiveAddress, amount)) {
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

      const type = await client.ledger.getLoyaltyType(receiveAddress);
      if(type !== 1) {
        userStore.setLoading(false);
        alert('미등록 또는 토큰을 사용할 수 없는 주소로 전송할 수 없습니다.')
        return;
      }
      const steps = [];
      for await (const step of client.ledger.transfer(receiveAddress, amount)) {
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
    const balance = userStore.isMainChainTransfer ? balanceMainChain.toBOAString() : balanceSideChain.toBOAString()
    console.log('max :', convertProperValue(balance));
    const vv = convertProperValue(balance)
      .split(',')
      .join('');
    changeAmount(vv);
  };

  const changeAmount = (v) => {
    console.log('change value :', v);
    console.log('change include comma :', v.includes(','));
    const vv = v.includes(',') ? v.split(',').join('') : v;
    formik.setFieldValue('amount', vv);

    const fee = userStore.isMainChainTransfer ? mainChainFee : sideChainFee;
    if (
      validateNumberWithDecimal(vv) &&
      compareFloatTexts(vv, fee.toBOAString())
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
    console.log('reciever : ', v)
    const isEthAddress = ethers.utils.isAddress(v);
    console.log('isEthAddress :', isEthAddress)
    if(isEthAddress) {
      formik.setFieldValue('receiver', '');
      setReceiveAddress(v)
    } else {
      formik.setFieldValue('receiver', v);
      setReceiveAddress('')
    }
  }

  const removeReceiver = () => {
    setReceiveAddress('')
  }

  function validateNumberWithDecimal(numberString) {
    // 정규 표현식을 사용하여 주어진 문자열이 유효한 소수점을 포함한 숫자인지 확인
    const regex = /^-?\d*\.?\d+$/;
    return regex.test(numberString);
  }

  function compareFloatTexts(floatText1, floatText2) {
    const float1 = parseFloat(floatText1);
    const float2 = parseFloat(floatText2);

    if (isNaN(float1) || isNaN(float2)) {
      return false;
    }

    return float1 > float2;
  }

  function subFloatTexts(floatText1, floatText2) {
    const float1 = parseFloat(floatText1);
    const float2 = parseFloat(floatText2);

    console.log('f1 :', float1);
    console.log('f2 :', float2);
    if (isNaN(float1) || isNaN(float2)) {
      return '0';
    }

    return (float1 - float2).toFixed(2).toString();
  }
  return (
    <WrapBox
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}>
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
                            value={truncateMiddleString(address || '', 16)}
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
                  To     :
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
                </Input>) : (<><Input
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

                      <Feather name="x-circle" size={24} color="black" onPress={removeReceiver} />
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
                      가능 금액 :{' '}
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
                        Max
                      </Para2Text>
                    </WrapHistoryButton>
                  </HStack>
                </VStack>
              </FormControl>
            </Box>

            <WrapDivider my={2}></WrapDivider>
            <HStack my={10} alignItems='center' justifyContent='space-between'>
              <RobotoMediumText
                fontSize={15}
                fontWeight={500}
                lightHeight={16}
                color='#707070'>
                {userStore.isDeposit ? '예치' : '인출'} 금액 :
              </RobotoMediumText>
              <RobotoSemiBoldText>{receiveAmount}</RobotoSemiBoldText>
            </HStack>
            <WrapDivider my={2}></WrapDivider>
            <HStack my={10} alignItems='center' justifyContent='space-between'>
              <RobotoMediumText
                fontSize={15}
                fontWeight={500}
                lightHeight={16}
                color='#707070'>
                수수료 :
              </RobotoMediumText>
              <RobotoSemiBoldText>
                {convertProperValue(sideChainFee.toBOAString())}
              </RobotoSemiBoldText>
            </HStack>
            <WrapDivider></WrapDivider>

            <WrapButton
              // isDisabled={formik.isValid}
              bg={ableToDo ? '#5C66D5' : '#E4E4E4'}
              onPress={formik.handleSubmit}
              my='$4'>
              <ActiveButtonText>{t('authenticate')}</ActiveButtonText>
            </WrapButton>
          </VStack>
        </Box>
      </Box>
    </WrapBox>
  );
});

export default Transfer;
