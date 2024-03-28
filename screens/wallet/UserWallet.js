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
} from '@gluestack-ui/themed';
import { getClient } from '../../utils/client';
import { Amount, BOACoin, ContractUtils } from 'dms-sdk-client';
import { convertProperValue, truncateMiddleString } from '../../utils/convert';
import { SafeAreaView, ScrollView, StatusBar, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  AppleSDGothicNeoBText,
  AppleSDGothicNeoEBText,
  AppleSDGothicNeoSBText,
  HeaderText,
  NumberText,
  Para2Text,
  Para3Text,
  ParaText,
  PinButtonText,
  RobotoMediumText,
  SubHeaderText,
} from '../../components/styled/text';
import {
  WrapButton,
  WrapHistoryButton,
  WrapWhiteButton,
} from '../../components/styled/button';
import * as Clipboard from 'expo-clipboard';
import MobileHeader from '../../components/MobileHeader';

const UserWallet = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { secretStore, userStore, loyaltyStore } = useStores();
  const [showModal, setShowModal] = useState(false);
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');
  const [payablePoint, setPayablePoint] = useState(new BOACoin(0));
  const [payablePointRate, setPayablePointRate] = useState(new BOACoin(0));
  const [onePointRate, setOnePointRate] = useState(new BOACoin(0));
  const [userTokenBalance, setUserTokenBalance] = useState(new BOACoin(0));
  const [userTokenRate, setUserTokenRate] = useState(new BOACoin(0));
  const [oneTokenRate, setOneTokenRate] = useState(new BOACoin(0));
  const [userLoyaltyType, setUserLoyaltyType] = useState(0);
  const [phone, setPhone] = useState('');

  const toast = useToast();

  useEffect(() => {
    console.log('================= userStore', userStore);

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
      const { client: client1, address: userAddress } =
        await getClient('wallet');
      setClient(client1);
      setAddress(userAddress);

      await setData(client1, userAddress);
      await fetchBalances(client1, userAddress);
    } catch (e) {
      console.log('ee :', e);
    }
  }

  async function fetchBalances(cc, userAddress) {
    if (userStore.walletInterval > 0) clearInterval(userStore.walletInterval);

    const id = setInterval(async () => {
      try {
        await setData(cc, userAddress);
      } catch (e) {
        console.log('setData > e:', e);
      }
    }, 5000);
    userStore.setWalletInterval(id);
  }

  async function setData(cc, userAddress) {
    try {
      const phone = userStore.phone;
      setPhone(phone);
      // console.log('user phone :', phone);

      const loyaltyType = await cc.ledger.getLoyaltyType(userAddress);
      setUserLoyaltyType(loyaltyType);
      // console.log('userLoyaltyType :', loyaltyType);

      const tokenBalance = await cc.ledger.getTokenBalance(userAddress);
      // console.log('tokenBalance :', tokenBalance.toString());
      const tokenBalConv = new BOACoin(tokenBalance);
      // console.log('tokenBalConv :', tokenBalConv.toBOAString());
      setUserTokenBalance(tokenBalConv);

      // const tokenAmount = Amount.make(tokenBalance, 18).value;
      let userTokenCurrencyRate = await cc.currency.tokenToCurrency(
        tokenBalance,
        userStore.currency.toLowerCase(),
      );

      // console.log('userTokenCurrencyRate :', userTokenCurrencyRate.toString());
      const oneConv = new BOACoin(userTokenCurrencyRate);
      // console.log('oneConv :', oneConv.toBOAString());
      setUserTokenRate(oneConv);

      const oneTokenAmount = BOACoin.make(1, 18).value;
      let oneTokenCurrencyRate = await cc.currency.tokenToCurrency(
        oneTokenAmount,
        userStore.currency.toLowerCase(),
      );

      // console.log('oneTokenCurrencyRate :', oneTokenCurrencyRate.toString());
      const oneTokenConv = new BOACoin(oneTokenCurrencyRate);
      // console.log('boaBal :', boaConv.toBOAString());
      setOneTokenRate(oneTokenConv);

      const userPoint = await cc.ledger.getPointBalance(userAddress);
      const payableConv = new BOACoin(userPoint);
      // console.log('payableConv :', payableConv.toBOAString());
      setPayablePoint(payableConv);

      let pointCurrencyRate = await cc.currency.pointToCurrency(
        userPoint,
        userStore.currency,
      );
      const pointRateConv = new BOACoin(pointCurrencyRate);
      // console.log('pointRateConv :', pointRateConv.toBOAString());
      setPayablePointRate(pointRateConv);

      const onePointAmount = BOACoin.make(1, 18).value;
      let onePointCurrencyRate = await cc.currency.pointToCurrency(
        onePointAmount,
        userStore.currency.toLowerCase(),
      );
      const onePointConv = new BOACoin(onePointCurrencyRate);
      // console.log('onePointConv :', onePointConv.toBOAString());
      setOnePointRate(onePointConv);
    } catch (e) {
      console.log('setdata > e:', e);
    }
  }

  const handleQRSheet = async () => {
    // await fetchPoints();
    secretStore.setShowQRSheet(!secretStore.showQRSheet);
    console.log('handle QR sheet : ', secretStore.showQRSheet);
  };

  const convertToToken = () => {
    console.log('convert to token');
    setShowModal(true);
  };

  const confirmToToken = async () => {
    console.log('confirm to token');
    let steps = [];
    try {
      for await (const step of client.ledger.changeToLoyaltyToken()) {
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

  return (
    <WrapBox style={{ backgroundColor: '#12121D', paddingTop: 3 }}>
      <Box alignItems='flex-end'>
        <Button
          bg='#5C66D5'
          rounded='$xl'
          h={26}
          w={138}
          variant='link'
          onPress={async () => {
            await Clipboard.setStringAsync(address);

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
            {truncateMiddleString(address || '', 8)}
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
      <ScrollView showsVerticalScrollIndicator={false}>
        <VStack mt={50} alignItems='flex-start'>
          <HeaderText color='white'>{t('user.wallet.heading')}</HeaderText>
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
                    onPress={() => navigation.navigate('MileageHistory')}>
                    <Para2Text style={{ fontSize: 12, color: '#707070' }}>
                      {t('user.wallet.link.history')}
                    </Para2Text>
                  </WrapHistoryButton>
                </HStack>
                {userLoyaltyType === 0 ? (
                  <>
                    {/*<HStack justifyContent='space-between'>*/}
                    {/*  <HStack py={20} px={18}>*/}
                    {/*    <Text*/}
                    {/*        _dark={{ color: '$textLight200' }}*/}
                    {/*        fontSize='$xl'*/}
                    {/*        mr='$1'>*/}
                    {/*      {convertProperValue(payablePoint.toBOAString())}*/}
                    {/*    </Text>*/}
                    {/*    <Text _dark={{ color: '$textLight200' }} fontSize='$sm'>*/}
                    {/*      point*/}
                    {/*    </Text>*/}
                    {/*  </HStack>*/}
                    {/*  <WrapHistoryButton*/}
                    {/*      borderRadius='$full'*/}
                    {/*      h={24}*/}
                    {/*      pt={-2}*/}
                    {/*      onPress={() => navigation.navigate('MileageHistory')}>*/}
                    {/*    <Para2Text style={{ fontSize: 12, color: '#707070' }}>*/}
                    {/*      {t('user.wallet.link.history')}*/}
                    {/*    </Para2Text>*/}
                    {/*  </WrapHistoryButton>*/}
                    {/*</HStack>*/}
                    <HStack justifyContent='center' pt={50}>
                      <AppleSDGothicNeoSBText
                        pt={10}
                        fontSize={56}
                        lineHeight={48}
                        fontWeight={400}>
                        {convertProperValue(payablePoint.toBOAString())}
                      </AppleSDGothicNeoSBText>
                      {/*<Text _dark={{ color: '$textLight200' }} fontSize='$sm'>*/}
                      {/*  point*/}
                      {/*</Text>*/}
                    </HStack>
                    <VStack alignItems='center' pt={10}>
                      <AppleSDGothicNeoSBText
                        color='#555555'
                        fontSize={16}
                        lineHeight={22}
                        fontWeight={400}>
                        ≒ {convertProperValue(payablePointRate.toBOAString())}{' '}
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
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 1,
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 5,
                        )}{' '}
                        {userStore.currency} )
                      </AppleSDGothicNeoSBText>
                    </VStack>
                  </>
                ) : (
                  <>
                    {/*<HStack justifyContent='space-between'>*/}

                    {/*  <Pressable*/}
                    {/*    onPress={() => navigation.navigate('MileageHistory')}>*/}
                    {/*    <Text fontSize='$sm' color='$pink600'>*/}
                    {/*      {t('user.wallet.link.history')}*/}
                    {/*    </Text>*/}
                    {/*  </Pressable>*/}
                    {/*</HStack>*/}
                    <HStack justifyContent='center' pt={50}>
                      <AppleSDGothicNeoSBText
                        pt={10}
                        fontSize={56}
                        lineHeight={48}
                        fontWeight={400}>
                        {convertProperValue(userTokenBalance.toBOAString())}
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
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 1,
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 2,
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
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 1,
                          userStore.currency.toLowerCase() === 'krw' ? 0 : 5,
                        )}{' '}
                        {userStore.currency})
                      </AppleSDGothicNeoSBText>
                    </VStack>
                  </>
                )}
                <WrapButton
                  mt={70}
                  mx={18}
                  mb={18}
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
              </Box>
            </Box>
          </Box>
          {userLoyaltyType === 0 ? (
            <Box mt='$6' w='$full' pb={20}>
              <WrapButton
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
          ) : null}
        </VStack>
      </ScrollView>
      <Box>
        <Modal
          isOpen={showModal}
          size='lg'
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
                <ParaText mt={7}>{t('user.wallet.modal.body.a')}</ParaText>
              </VStack>

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
                    onPress={() => {
                      confirmToToken();
                    }}>
                    <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
                  </WrapButton>
                </Box>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
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
