import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native';
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
import { convertProperValue, timePadding } from '../../utils/convert';
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
import { MaterialIcons } from '@expo/vector-icons';
import { WrapButton, WrapHistoryButton } from '../../components/styled/button';
import { useFormik, useFormikContext } from 'formik';
import * as yup from 'yup';
import Svg, { WithLocalSvg } from 'react-native-svg';

import bs from '../../assets/images/bosagora.svg';
import * as Clipboard from 'expo-clipboard';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const registerInitialValues = {
  n1: '',
};
const registerSchema = yup.object().shape({
  n1: yup
    .string()
    .matches(/^(\-)?(\d+)?(\.\d+)?$/, 'Invalid number format')
    .test(
      'positive',
      'Number must be greater than or equal to 0',
      (value) => parseFloat(value) > 0,
    )
    .required(),
});
const Deposit = observer(({ navigation }) => {
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
      if (userStore.isDeposit)
        doDeposit().then((v) => navigation.navigate('Wallet'));
      else doWithdraw().then((v) => navigation.navigate('Wallet'));
      resetForm();
    },
  });

  async function doDeposit() {
    try {
      userStore.setLoading(true);
      const amount = Amount.make(formik.values.n1, 18).value;
      let depositId = '';
      const steps = [];
      for await (const step of client.ledger.depositViaBridge(amount)) {
        console.log('deposit step :', step);
        steps.push(step);
        if (step.key === NormalSteps.DONE) depositId = step.depositId;
      }
      const waitSteps = [];
      console.log('depositId : ', depositId);
      if (steps.length === 3 && steps[2].key === 'done') {
        for await (const waitStep of client.ledger.waiteDepositViaBridge(
          depositId,
          60,
        )) {
          console.log('waitDeposit step :', waitStep);
          waitSteps.push(waitStep);
        }
      }
      userStore.setLoading(false);
    } catch (e) {
      await Clipboard.setStringAsync(JSON.stringify(e));
      console.log('error : ', e);
      userStore.setLoading(false);
      alert(t('phone.alert.reg.fail') + JSON.stringify(e.message));
    }
  }

  async function doWithdraw() {
    try {
      userStore.setLoading(true);
      const amount = Amount.make(formik.values.n1, 18).value;
      let depositId = '';
      const steps = [];
      for await (const step of client.ledger.withdrawViaBridge(amount)) {
        console.log('withdraw step :', step);
        steps.push(step);
        if (step.key === NormalSteps.DONE) depositId = step.depositId;
      }
      const waitSteps = [];
      console.log('depositId : ', depositId);
      if (steps.length === 3 && steps[2].key === 'done') {
        for await (const waitStep of client.ledger.waiteWithdrawViaBridge(
          depositId,
          60,
        )) {
          console.log('wait step :', waitStep);
          waitSteps.push(waitStep);
        }
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
    // console.log('max :', convertProperValue(balanceMainChain.toBOAString()));
    // const vv = convertProperValue(balanceMainChain.toBOAString())

    const balance = userStore.isDeposit
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
    formik.setFieldValue('n1', vv);
    const fee = userStore.isDeposit ? mainChainFee : sideChainFee;
    if (
      validateNumberWithDecimal(vv) &&
      compareFloatTexts(vv, sideChainFee.toBOAString())
    ) {
      setAbleToDo(true);
      const aa = subFloatTexts(vv, fee.toBOAString());
      setReceiveAmount(aa);
    } else {
      setAbleToDo(false);
      setReceiveAmount('0');
    }
  };

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

    if (isNaN(float1) || isNaN(float2)) {
      return '0';
    }

    return (float1 - float2).toString();
  }
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
        <MobileHeader title={t('Deposit / Withdraw')} subTitle='' />
        <DepositTabs userStore={userStore} />
        <Box mt={20} w='$full'>
          <Box bg='white' rounded='$sm'>
            <VStack>
              <HStack
                space='md'
                alignItems='center'
                justifyContent='flex-start'>
                <HStack space='sm' alignItems='center'>
                  <WithLocalSvg
                    width={20}
                    height={20}
                    fill={'#000000'}
                    asset={bs}
                  />

                  <VStack>
                    <ParaText
                      fontSize={13}
                      fontWeight={500}
                      lightHeight={16}
                      color='#000000'>
                      From
                    </ParaText>
                    <ParaText fontSize={11} fontWeight={400} lightHeight={20}>
                      {userStore.isDeposit ? 'BosAgora' : 'Ledger'}
                    </ParaText>
                  </VStack>
                </HStack>
                <HStack space='md' alignItems='center' justifyContent='center'>
                  <MaterialIcons
                    name='arrow-forward-ios'
                    size={20}
                    color='#8A8A8A'
                  />
                </HStack>
                <HStack space='sm' alignItems='center'>
                  <WithLocalSvg
                    width={20}
                    height={20}
                    fill={'#000000'}
                    asset={bs}
                  />

                  <VStack>
                    <ParaText
                      fontSize={13}
                      fontWeight={500}
                      lightHeight={16}
                      color='#000000'>
                      To
                    </ParaText>
                    <ParaText fontSize={11} fontWeight={400} lightHeight={20}>
                      {userStore.isDeposit ? 'Ledger' : 'BosAgora'}
                    </ParaText>
                  </VStack>
                </HStack>
              </HStack>
              <Box py={30}>
                <FormControl size='md' isInvalid={!!formik.errors.n1}>
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
                          onBlur={formik.handleBlur('n1')}
                          value={formik.values?.n1}
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
                          userStore.isDeposit
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
                bg={ableToDo ? '#5C66D5' : '#E4E4E4'}
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

export default Deposit;
