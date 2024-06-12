import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';
import {
  Box,
  VStack,
  HStack,
  Image,
  Button,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ButtonIcon,
  CopyIcon,
  Toast,
  ToastDescription,
  useToast,
  FormControl,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { Amount, BOACoin } from 'dms-sdk-client-v2';
import {
  compareFloatTexts,
  convertProperValue,
  truncateMiddleString,
  validateNumber,
} from '../../utils/convert';
import { ScrollView, Dimensions, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  AppleSDGothicNeoSBText,
  HeaderText,
  Para2Text,
  ParaText,
  RobotoMediumText,
  RobotoRegularText,
  RobotoSemiBoldText,
  SubHeaderText,
} from '../../components/styled/text';
import {
  WrapButton,
  WrapHistoryButton,
  WrapWhiteButton,
} from '../../components/styled/button';
import * as Clipboard from 'expo-clipboard';
import Carousel from 'react-native-snap-carousel';
import { useFormik } from 'formik';
import * as yup from 'yup';

const UserWallet = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore, loyaltyStore } = useStores();
  const [showModal, setShowModal] = useState(false);

  const [payablePoint, setPayablePoint] = useState(new BOACoin(0));
  const [payablePointRate, setPayablePointRate] = useState(new BOACoin(0));
  const [onePointRate, setOnePointRate] = useState(new BOACoin(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BOACoin(0));
  const [userTokenMainnetBalance, setUserTokenMainnetBalance] = useState(
    new BOACoin(0),
  );
  const [userTokenRate, setUserTokenRate] = useState(new BOACoin(0));
  const [userTokenMainnetRate, setUserTokenMainnetRate] = useState(
    new BOACoin(0),
  );
  const [oneTokenRate, setOneTokenRate] = useState(new BOACoin(0));
  const [userLoyaltyType, setUserLoyaltyType] = useState(0);
  const [phone, setPhone] = useState('');
  const [receiveTokenAmount, setReceiveTokenAmount] = useState(new BOACoin(0));
  const toast = useToast();

  const [ableToDo, setAbleToDo] = useState(false);

  useEffect(() => {
    console.log('================= UserWallet > userStore', userStore);

    fetchClient()
      .then(() =>
        console.log(
          'end of wallet fetch client > last :',
          loyaltyStore.lastUpdateTime,
        ),
      )
      .catch((error) => {
        console.log(error);
      });
    // loyaltyStore.setPayment({
    //   id: '0x5f59d6b480ff5a30044dcd7fe3b28c69b6d0d725ca469d1b685b57dfc1055d7f',
    //   type: 'new',
    //   taskId:
    //     '0xf7d3c6c310f5b53d62e96e363146b7da517ffaf063866923c6ce60683b154c91',
    // });
  }, []);
  async function fetchClient() {
    try {
      await setData();
      await fetchBalances();
    } catch (e) {
      console.log('ee :', e);
    }
  }
  async function fetchBalances() {
    if (userStore.walletInterval > 0) clearInterval(userStore.walletInterval);

    const id = setInterval(async () => {
      try {
        await setData();
      } catch (e) {
        console.log('setData > e1:', e);
      }
    }, 5000);
    userStore.setWalletInterval(id);
  }

  async function setData() {
    try {
      const phone = userStore.phone;
      setPhone(phone);

      // const loyaltyType = await secretStore.client.ledger.getLoyaltyType(
      //   secretStore.address,
      // );

      // setUserLoyaltyType(loyaltyType);
      setUserLoyaltyType(1);
      // console.log('userLoyaltyType :', loyaltyType);

      const tokenBalance = await secretStore.client.ledger.getTokenBalance(
        secretStore.address,
      );
      // console.log('tokenBalance :', tokenBalance.toString());
      const tokenBalConv = new BOACoin(tokenBalance);
      console.log('tokenBalance :', tokenBalConv.toBOAString());
      setUserTokenBalance(tokenBalConv);

      const tokenMainnetBalance =
        await secretStore.client.ledger.getMainChainBalance(
          secretStore.address,
        );
      // console.log('tokenBalance :', tokenBalance.toString());
      const tokenMainnetBalConv = new BOACoin(tokenMainnetBalance);
      // console.log('tokenMainnetBalConv :', tokenMainnetBalConv.toBOAString());
      setUserTokenMainnetBalance(tokenMainnetBalConv);

      // const tokenAmount = Amount.make(tokenBalance, 18).value;
      let userTokenCurrencyRate =
        await secretStore.client.currency.tokenToCurrency(
          tokenBalance,
          userStore.currency.toLowerCase(),
        );

      const userTokenCurrencyConv = new BOACoin(userTokenCurrencyRate);
      // console.log('userTokenCurrencyConv :', userTokenCurrencyConv.toBOAString());
      setUserTokenRate(userTokenCurrencyConv);

      let userTokenMainnetCurrencyRate =
        await secretStore.client.currency.tokenToCurrency(
          tokenMainnetBalance,
          userStore.currency.toLowerCase(),
        );

      const userTokenCurrencyMainnetConv = new BOACoin(
        userTokenMainnetCurrencyRate,
      );
      // console.log('userTokenCurrencyConv :', userTokenCurrencyConv.toBOAString());
      setUserTokenMainnetRate(userTokenCurrencyMainnetConv);

      const oneTokenAmount = BOACoin.make(1, 18).value;
      let oneTokenCurrencyRate =
        await secretStore.client.currency.tokenToCurrency(
          oneTokenAmount,
          userStore.currency.toLowerCase(),
        );

      // console.log('oneTokenCurrencyRate :', oneTokenCurrencyRate.toString());
      const oneTokenConv = new BOACoin(oneTokenCurrencyRate);
      // console.log('boaBal :', boaConv.toBOAString());
      setOneTokenRate(oneTokenConv);

      const userPoint = await secretStore.client.ledger.getPointBalance(
        secretStore.address,
      );
      const payableConv = new BOACoin(userPoint);
      console.log('userPoint :', payableConv.toBOAString());
      setPayablePoint(payableConv);

      let pointCurrencyRate = await secretStore.client.currency.pointToCurrency(
        userPoint,
        userStore.currency,
      );
      const pointRateConv = new BOACoin(pointCurrencyRate);
      // console.log('pointRateConv :', pointRateConv.toBOAString());
      setPayablePointRate(pointRateConv);

      const onePointAmount = BOACoin.make(1, 18).value;
      let onePointCurrencyRate =
        await secretStore.client.currency.pointToCurrency(
          onePointAmount,
          userStore.currency.toLowerCase(),
        );
      const onePointConv = new BOACoin(onePointCurrencyRate);
      // console.log('onePointAmount :', onePointConv.toBOAString());
      setOnePointRate(onePointConv);
    } catch (e) {
      console.log('setdata > e2:', e);
    }
  }

  const handleQRSheet = async () => {
    secretStore.setShowQRSheet(!secretStore.showQRSheet);
    console.log('handle QR sheet : ', secretStore.showQRSheet);
  };

  const convertToToken = () => {
    console.log('convert to token');
    setShowModal(true);
  };

  const exchangeToToken = async () => {
    console.log('confirm to token');
    return;
    let steps = [];
    try {
      for await (const step of secretStore.client.ledger.changeToLoyaltyToken()) {
        steps.push(step);
        console.log('confirm to token step :', step);
      }
      if (steps.length === 3 && steps[2].key === 'done') {
        setUserLoyaltyType(1);
      }

      alert(t('user.wallet.alert.convert.done'));
    } catch (e) {
      console.log('error : ', e);
      await Clipboard.setStringAsync(JSON.stringify(e));
      alert(t('user.wallet.alert.convert.fail') + JSON.stringify(e.message));
    }
    await fetchClient();

    setShowModal(false);
  };

  const goToDeposit = (tp) => {
    if (tp === 'deposit') {
      userStore.setIsDeposit(true);
    } else userStore.setIsDeposit(false);
    navigation.navigate('Deposit');
  };
  const goToTransfer = (tp) => {
    if (tp === 'mainChainTransfer') {
      userStore.setIsMainChainTransfer(true);
    } else userStore.setIsMainChainTransfer(false);
    navigation.navigate('Transfer');
  };
  const width = Dimensions.get('window').width;

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

  const takeMaxAmount = () => {
    const balance = convertProperValue(payablePoint.toBOAString(), 0);
    changeAmount(balance);
  };

  const changeAmount = async (v) => {
    try {
      const balance = convertProperValue(payablePoint.toBOAString(), 0);
      if (
        validateNumber(v) &&
        compareFloatTexts(v, 0) &&
        compareFloatTexts(balance, v)
      ) {
        userStore.setLoading(true);
        formik.setFieldValue('n1', v);
        const inputAmount = Amount.make(v, 18).value;
        const convertedToken =
          await secretStore.client.currency.pointToToken(inputAmount);
        const amount = new BOACoin(convertedToken);
        console.log('converted token amount :', amount.toBOAString());
        setReceiveTokenAmount(amount);
        setAbleToDo(true);
        userStore.setLoading(false);
      } else {
        formik.setFieldValue('n1', '');
        setAbleToDo(false);
        setReceiveTokenAmount(Amount.make(0, 18));
        console.log('below zero');
      }
    } catch (e) {
      console.log(e);
      formik.setFieldValue('n1', '');
      setAbleToDo(false);
      userStore.setLoading(false);
    }
  };

  return (
    <WrapBox pl={0} style={{ backgroundColor: '#12121D', paddingTop: 3 }}>
      <Box alignItems='flex-end'>
        <Button
          bg='#5C66D5'
          rounded='$xl'
          h={26}
          w={138}
          variant='link'
          onPress={async () => {
            await Clipboard.setStringAsync(secretStore.address);

            toast.show({
              placement: 'top',
              duration: 500,
              render: ({ id }) => {
                const toastId = 'toast-' + id;
                return (
                  <Toast nativeID={toastId} action='attention' variant='solid'>
                    <VStack space='xs'>
                      <ToastDescription>
                        {t('wallet.toast.copy')}
                      </ToastDescription>
                    </VStack>
                  </Toast>
                );
              },
            });
          }}>
          <ParaText style={{ color: '#fff' }}>
            {truncateMiddleString(secretStore.address || '', 8)}
          </ParaText>
          <Image
            ml={9}
            my={3}
            h={13.3}
            w={13.3}
            alt='alt'
            source={require('../../assets/images/copy.png')}
          />
        </Button>
      </Box>
      <Carousel
        style={{ backgroundColor: 'red' }}
        layout={'default'}
        ref={(ref) => (this.carousel = ref)}
        // inactiveSlideScale={0.9}
        // inactiveSlideOpacity={0.3}
        sliderWidth={width}
        itemWidth={width / 1.2}
        data={[...new Array(2).keys()]}
        onSnapToItem={(index) => console.log('current index:', index)}
        renderItem={({ index }) =>
          index === 0 ? (
            <Box>
              <ScrollView showsVerticalScrollIndicator={false}>
                <VStack mt={50} pb={100} alignItems='flex-start'>
                  <HeaderText color='white'>
                    {t('user.wallet.heading')}
                  </HeaderText>
                  <SubHeaderText color='white' mt={7}>
                    {t('user.wallet.heading.description', {
                      appName: t('app.name'),
                    })}
                  </SubHeaderText>
                  <Box mt={20} w='$full'>
                    <Box>
                      <Box bg='white' rounded='$xl'>
                        <HStack
                          mt={20}
                          mx={18}
                          alignItems='center'
                          justifyContent='space-between'>
                          <Image
                            h={18}
                            w={87}
                            alt='alt'
                            source={require('../../assets/images/mypoint.png')}
                          />
                          <WrapHistoryButton
                            borderRadius='$full'
                            h={24}
                            pt={-2}
                            onPress={() =>
                              navigation.navigate('MileageHistory')
                            }>
                            <Para2Text
                              style={{ fontSize: 12, color: '#707070' }}>
                              {t('user.wallet.link.history')}
                            </Para2Text>
                          </WrapHistoryButton>
                        </HStack>

                        <>
                          <HStack justifyContent='center' pt={50}>
                            <AppleSDGothicNeoSBText
                              fontSize={40}
                              lineHeight={48}
                              fontWeight={400}>
                              {convertProperValue(
                                payablePoint.toBOAString(),
                                0,
                              )}
                            </AppleSDGothicNeoSBText>
                          </HStack>
                          <VStack alignItems='center' pt={10}>
                            <AppleSDGothicNeoSBText
                              color='#555555'
                              fontSize={16}
                              lineHeight={22}
                              fontWeight={400}>
                              ≒{' '}
                              {convertProperValue(
                                payablePointRate.toBOAString(),
                              )}{' '}
                              {userStore.currency}
                            </AppleSDGothicNeoSBText>
                            <AppleSDGothicNeoSBText
                              color='#555555'
                              fontSize={16}
                              lineHeight={22}
                              fontWeight={400}>
                              (1 Point ≒{' '}
                              {convertProperValue(
                                onePointRate.toBOAString(),
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 1,
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 5,
                              )}{' '}
                              {userStore.currency} )
                            </AppleSDGothicNeoSBText>

                            <Box mt='$6' w='$full' pb={20}>
                              <WrapButton
                                mt={10}
                                mx={18}
                                mb={8}
                                onPress={() => handleQRSheet()}>
                                <Image
                                  mr={9}
                                  mt={-3}
                                  h={17}
                                  w={17}
                                  alt='alt'
                                  source={require('../../assets/images/qr_code.png')}
                                />
                                <RobotoMediumText
                                  style={{
                                    fontWeight: 500,
                                    lineHeight: 16,
                                    fontSize: 15,
                                    color: '#fff',
                                  }}>
                                  {t('user.wallet.use.qr')}
                                </RobotoMediumText>
                              </WrapButton>

                              <WrapButton
                                mx={18}
                                mb={8}
                                bg='black'
                                borderColor='#8A8A8A'
                                borderRadius='$lg'
                                borderWidth='$1'
                                onPress={() => convertToToken()}>
                                <RobotoMediumText
                                  style={{
                                    fontWeight: 500,
                                    lineHeight: 16,
                                    fontSize: 15,
                                    color: '#fff',
                                  }}>
                                  {t('user.wallet.link.convert')}
                                </RobotoMediumText>
                              </WrapButton>
                            </Box>
                          </VStack>
                        </>
                      </Box>

                      <Box mt={10} bg='white' rounded='$xl'>
                        <HStack
                          mt={20}
                          mx={18}
                          alignItems='center'
                          justifyContent='space-between'>
                          <Image
                            h={18}
                            w={87}
                            alt='alt'
                            source={require('../../assets/images/mykios.png')}
                          />
                          <WrapHistoryButton
                            borderRadius='$full'
                            h={24}
                            pt={-2}
                            onPress={() =>
                              navigation.navigate('DepositHistory')
                            }>
                            <Para2Text
                              style={{ fontSize: 12, color: '#707070' }}>
                              {t('user.wallet.link.deposit.history')}
                            </Para2Text>
                          </WrapHistoryButton>
                        </HStack>
                        <>
                          <HStack justifyContent='center' pt={50}>
                            <AppleSDGothicNeoSBText
                              fontSize={40}
                              lineHeight={48}
                              fontWeight={400}>
                              {convertProperValue(
                                userTokenBalance.toBOAString(),
                              )}
                            </AppleSDGothicNeoSBText>
                          </HStack>
                          <VStack alignItems='center' pt={10}>
                            <AppleSDGothicNeoSBText
                              color='#555555'
                              fontSize={16}
                              lineHeight={22}
                              fontWeight={400}>
                              ≒{' '}
                              {convertProperValue(
                                userTokenRate.toBOAString(),
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 1,
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 2,
                              )}{' '}
                              {userStore.currency}
                            </AppleSDGothicNeoSBText>
                            <AppleSDGothicNeoSBText
                              color='#555555'
                              fontSize={16}
                              lineHeight={22}
                              fontWeight={400}>
                              (1 {t('token.name')} ≒{' '}
                              {convertProperValue(
                                oneTokenRate.toBOAString(),
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 1,
                                userStore.currency.toLowerCase() === 'krw'
                                  ? 0
                                  : 5,
                              )}{' '}
                              {userStore.currency})
                            </AppleSDGothicNeoSBText>

                            <HStack py={20} px={20} flex={1} space='md'>
                              <Box flex={1}>
                                <WrapButton
                                  bg='black'
                                  borderColor='#8A8A8A'
                                  borderRadius='$lg'
                                  borderWidth='$1'
                                  onPress={() => goToDeposit('deposit')}>
                                  <RobotoMediumText
                                    style={{
                                      fontWeight: 500,
                                      lineHeight: 16,
                                      fontSize: 15,
                                      color: '#fff',
                                    }}>
                                    {t('deposit')}
                                  </RobotoMediumText>
                                </WrapButton>
                              </Box>
                              <Box flex={1}>
                                <WrapButton
                                  bg='black'
                                  borderColor='#8A8A8A'
                                  borderRadius='$lg'
                                  borderWidth='$1'
                                  onPress={() => goToDeposit('withdraw')}>
                                  <RobotoMediumText
                                    style={{
                                      fontWeight: 500,
                                      lineHeight: 16,
                                      fontSize: 15,
                                      color: '#fff',
                                    }}>
                                    {t('withdraw')}
                                  </RobotoMediumText>
                                </WrapButton>
                              </Box>
                            </HStack>
                          </VStack>
                        </>
                      </Box>
                    </Box>
                  </Box>
                </VStack>
              </ScrollView>
              <Box>
                <Modal
                  isOpen={showModal}
                  size='lg'
                  onOpen={() => {
                    formik.setFieldValue('n1', '');
                  }}
                  onClose={() => {
                    setShowModal(false);
                  }}>
                  <ModalBackdrop />
                  <ModalContent bg='#FFFFFF'>
                    <ModalBody mt={30} mb={10} mx={10}>
                      <VStack>
                        <HeaderText>{t('user.wallet.link.convert')}</HeaderText>
                        <ParaText mt={7}>
                          {t('user.wallet.modal.heading.description')}
                        </ParaText>
                        <ParaText mt={7}>
                          {t('user.wallet.modal.body.a')}
                        </ParaText>
                      </VStack>

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
                                  keyboardType='number-pad'
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
                                Point
                              </AppleSDGothicNeoSBText>
                            </HStack>
                            <HStack
                              alignItems='center'
                              justifyContent='flex-start'>
                              <RobotoRegularText
                                py={3}
                                fontSize={13}
                                lineHeight={18}
                                fontWeight={400}>
                                {' '}
                                {t('available')} :{' '}
                                {convertProperValue(
                                  payablePoint.toBOAString(),
                                  0,
                                )}
                              </RobotoRegularText>

                              <WrapHistoryButton
                                borderRadius='$full'
                                h={20}
                                ml={10}
                                onPress={takeMaxAmount}>
                                <Para2Text
                                  style={{ fontSize: 12, color: '#707070' }}>
                                  {t('max')}
                                </Para2Text>
                              </WrapHistoryButton>
                            </HStack>

                            <HStack
                              mt={15}
                              alignItems='center'
                              justifyContent='space-between'>
                              <RobotoMediumText
                                fontSize={15}
                                fontWeight={500}
                                lightHeight={16}
                                color='#707070'>
                                {t('received.amount')} :
                              </RobotoMediumText>
                              <RobotoSemiBoldText>
                                {convertProperValue(
                                  receiveTokenAmount.toBOAString(),
                                )}
                                {'     '} KIOS
                              </RobotoSemiBoldText>
                            </HStack>
                          </VStack>
                        </FormControl>
                      </Box>

                      <HStack pt={20} flex={1}>
                        <Box flex={1} mr={5}>
                          <WrapWhiteButton
                            onPress={() => {
                              setShowModal(false);
                            }}>
                            <ActiveWhiteButtonText>
                              {t('button.press.b')}
                            </ActiveWhiteButtonText>
                          </WrapWhiteButton>
                        </Box>
                        <Box flex={1} ml={5}>
                          <WrapButton
                            bg={ableToDo ? '#5C66D5' : '#E4E4E4'}
                            onPress={() => {
                              exchangeToToken();
                            }}>
                            <ActiveButtonText>
                              {t('button.press.a')}
                            </ActiveButtonText>
                          </WrapButton>
                        </Box>
                      </HStack>
                    </ModalBody>
                  </ModalContent>
                </Modal>
              </Box>
            </Box>
          ) : (
            <Box>
              <Box>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <VStack mt={50} alignItems='flex-start'>
                    <HeaderText color='white'>BOSagora</HeaderText>
                    <SubHeaderText color='white' mt={7}>
                      {process.env.EXPO_PUBLIC_ENV === 'product'
                        ? t('wallet.heading.description.mainnet')
                        : t('wallet.heading.description.devnet')}
                    </SubHeaderText>
                    <Box mt={20} w='$full'>
                      <Box>
                        <Box pb={80} bg='white' rounded='$xl'>
                          <HStack
                            mt={20}
                            mx={18}
                            alignItems='center'
                            justifyContent='space-between'>
                            <Image
                              h={18}
                              w={87}
                              alt='alt'
                              source={
                                userLoyaltyType === 0
                                  ? require('../../assets/images/mypoint.png')
                                  : require('../../assets/images/mykios.png')
                              }
                            />
                            <WrapHistoryButton
                              borderRadius='$full'
                              h={24}
                              pt={-2}
                              onPress={() =>
                                navigation.navigate('TransferMainChainHistory')
                              }>
                              <Para2Text
                                style={{ fontSize: 12, color: '#707070' }}>
                                {t('user.wallet.link.transfer.history')}
                              </Para2Text>
                            </WrapHistoryButton>
                          </HStack>

                          <>
                            <HStack justifyContent='center' pt={50}>
                              <AppleSDGothicNeoSBText
                                pt={10}
                                fontSize={40}
                                lineHeight={48}
                                fontWeight={400}>
                                {convertProperValue(
                                  userTokenMainnetBalance.toBOAString(),
                                )}
                              </AppleSDGothicNeoSBText>
                            </HStack>
                            <VStack alignItems='center' pt={10}>
                              <AppleSDGothicNeoSBText
                                color='#555555'
                                fontSize={16}
                                lineHeight={22}
                                fontWeight={400}>
                                ≒{' '}
                                {convertProperValue(
                                  userTokenMainnetRate.toBOAString(),
                                  userStore.currency.toLowerCase() === 'krw'
                                    ? 0
                                    : 1,
                                  userStore.currency.toLowerCase() === 'krw'
                                    ? 0
                                    : 2,
                                )}{' '}
                                {userStore.currency}
                              </AppleSDGothicNeoSBText>
                              <AppleSDGothicNeoSBText
                                color='#555555'
                                fontSize={16}
                                lineHeight={22}
                                fontWeight={400}>
                                (1 {t('token.name')} ≒{' '}
                                {convertProperValue(
                                  oneTokenRate.toBOAString(),
                                  userStore.currency.toLowerCase() === 'krw'
                                    ? 0
                                    : 1,
                                  userStore.currency.toLowerCase() === 'krw'
                                    ? 0
                                    : 5,
                                )}{' '}
                                {userStore.currency})
                              </AppleSDGothicNeoSBText>
                            </VStack>
                          </>
                        </Box>
                      </Box>
                    </Box>

                    <HStack py={20} flex={1}>
                      <Box flex={1}>
                        <WrapButton
                          bg='black'
                          borderColor='#8A8A8A'
                          borderRadius='$lg'
                          borderWidth='$1'
                          onPress={() => {
                            goToTransfer('mainChainTransfer');
                          }}>
                          <RobotoMediumText
                            style={{
                              fontWeight: 500,
                              lineHeight: 16,
                              fontSize: 15,
                              color: '#fff',
                            }}>
                            {t('transfer')}
                          </RobotoMediumText>
                        </WrapButton>
                      </Box>
                    </HStack>
                  </VStack>
                </ScrollView>
              </Box>
            </Box>
          )
        }
      />
    </WrapBox>
  );
});
const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: '500',
    letterSpacing: -0.7,
    lineHeight: 32,
    fontFamily: 'Roboto-Medium',
  },
});
export default UserWallet;
