import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import { useStores } from '../../stores';
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  View,
  Divider,
  Button,
  Image,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ButtonGroup,
  AddIcon,
  CopyIcon,
  ButtonIcon,
  useToast,
  Toast,
  ToastTitle,
  ToastDescription,
} from '@gluestack-ui/themed';
import { getClient } from '../../utils/client';
import {
  Amount,
  BOACoin,
  ContractUtils,
  ShopWithdrawStatus,
} from 'dms-sdk-client-v2';
import {
  convertShopProperValue,
  truncateMiddleString,
} from '../../utils/convert';
import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { BigNumber } from '@ethersproject/bignumber/src.ts';
import { getSecureValue, saveSecureValue } from '../../utils/secure.store';
import '@ethersproject/shims';
import { Wallet } from 'ethers';
import * as Device from 'expo-device';

import MobileHeader from '../../components/MobileHeader';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  HeaderText,
  NumberText,
  Para2Text,
  Para3Text,
  ParaText,
  PinButtonText,
} from '../../components/styled/text';
import {
  WrapButton,
  WrapHistoryButton,
  WrapWhiteButton,
} from '../../components/styled/button';

const Index = observer(({ navigation }) => {
  const { noteStore, secretStore, userStore, loyaltyStore } = useStores();
  const [showModal, setShowModal] = useState(false);

  const [modalHeader, setModalHeader] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState('');

  const [adjustmentStatus, setAdjustmentStatus] = useState(0);
  const [providedAmount, setProvidedAmount] = useState(new Amount(0, 18));
  const [usedAmount, setUsedAmount] = useState(new Amount(0, 18));
  const [withdrawAmount, setWithdrawAmount] = useState(new Amount(0, 18));
  const [withdrawnAmount, setWithdrawnAmount] = useState(new Amount(0, 18));
  const [withdrawableAmount, setWithdrawableAmount] = useState(
    new Amount(0, 18),
  );
  const [privateKey, setPrivateKey] = useState('');
  const [userLoyaltyType, setUserLoyaltyType] = useState(0);
  const [phone, setPhone] = useState('');
  const { t } = useTranslation();

  const toast = useToast();

  useEffect(() => {
    console.log('================= userStore', userStore);

    fetchClient().then(() =>
      console.log(
        'end of wallet fetch client > last :',
        loyaltyStore.lastUpdateTime,
      ),
    );
  }, [loyaltyStore.lastUpdateTime]);

  useEffect(() => {
    const newVersion = process.env.EXPO_PUBLIC_APP_VERSION;
    console.log('version : ', noteStore.version, ', newVersion :', newVersion);
    if (Device.isDevice) {
      if (noteStore.version === '0.0.0') {
        noteStore.setVersion(newVersion);
      } else if (noteStore.version !== newVersion) {
      }
    }
    // loyaltyStore.setPayment({
    //   id: '0x5f59d6b480ff5a30044dcd7fe3b28c69b6d0d725ca469d1b685b57dfc1055d7f',
    //   type: 'cancel',
    //   taskId:
    //     '0xf7d3c6c310f5b53d62e96e363146b7da517ffaf063866923c6ce60683b154c91',
    // });
  }, []);

  async function fetchClient() {
    await setData();
    await fetchBalances();
  }
  async function fetchBalances(cc, userAddress) {
    if (userStore.walletInterval > 0) clearInterval(userStore.walletInterval);

    const id = setInterval(async () => {
      try {
        await setData();
      } catch (e) {
        console.log('setData > e3:', e);
      }
    }, 5000);
    userStore.setWalletInterval(id);
  }
  async function setData() {
    const pkey = await getSecureValue('privateKey');
    if (pkey !== privateKey) {
      await secretStore.client.useSigner(new Wallet(pkey));
      setPrivateKey(pkey);
    }

    const shopInfo = await secretStore.client.shop.getShopInfo(
      userStore.shopId,
    );
    // console.log('shopInfo :', shopInfo);
    setAdjustmentStatus(shopInfo.withdrawStatus);

    const convProvidedAmount = new Amount(shopInfo.providedAmount, 18);
    const convUsedAmount = new Amount(shopInfo.usedAmount, 18);
    const convWithdrawAmount = new Amount(shopInfo.withdrawAmount, 18);
    const convWithdrawnAmount = new Amount(shopInfo.withdrawnAmount, 18);
    const withdrawableAmountTmp =
      shopInfo.withdrawStatus === 0
        ? await secretStore.client.shop.getWithdrawableAmount(userStore.shopId)
        : new Amount(0, 18).value;
    const convWithdrawableAmount = new Amount(withdrawableAmountTmp, 18);

    setProvidedAmount(convProvidedAmount);
    setUsedAmount(convUsedAmount);
    setWithdrawAmount(convWithdrawAmount);
    setWithdrawnAmount(convWithdrawnAmount);
    setWithdrawableAmount(convWithdrawableAmount);
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

  const confirmModal = async () => {
    console.log('confirm');
    setShowModal(false);
    userStore.setLoading(true);

    const steps = [];
    if (adjustmentMode === 'request') {
      try {
        for await (const step of secretStore.client.shop.openWithdrawal(
          userStore.shopId,
          withdrawableAmount.value,
        )) {
          steps.push(step);
          console.log('request step :', step);
        }
        if (steps.length === 3 && steps[2].key === 'done') {
          alert(t('wallet.modal.b.alert.done'));
        }
        userStore.setLoading(false);
      } catch (e) {
        await Clipboard.setStringAsync(JSON.stringify(e));
        console.log('error : ', e);
        userStore.setLoading(false);
        alert(t('wallet.modal.b.alert.fail') + JSON.stringify(e.message));
      }
    } else if (adjustmentMode === 'complete') {
      try {
        for await (const step of secretStore.client.shop.closeWithdrawal(
          userStore.shopId,
        )) {
          steps.push(step);
          console.log('request step :', step);
        }
        if (steps.length === 3 && steps[2].key === 'done') {
          alert(t('wallet.modal.a.alert.done'));
        }
        userStore.setLoading(false);
      } catch (e) {
        await Clipboard.setStringAsync(JSON.stringify(e));
        console.log('error : ', e);
        userStore.setLoading(false);
        alert(t('wallet.modal.a.alert.fail') + JSON.stringify(e.message));
      }
    }
  };

  const handleComplete = () => {
    console.log('handle complete');
    setModalHeader(t('wallet.modal.a.heading'));
    setModalContent(t('wallet.modal.a.heading.description'));
    setAdjustmentMode('complete');
    setShowModal(true);
  };

  const handleRequest = () => {
    console.log('handle request');
    setModalHeader(t('wallet.modal.b.heading'));
    setModalContent(t('wallet.modal.b.heading.description'));
    setAdjustmentMode('request');
    setShowModal(true);
  };

  return (
    <WrapBox style={{ backgroundColor: '#F3F3F4', paddingTop: 3 }}>
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
          {/*<ButtonIcon as={CopyIcon} ml={5} />*/}
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
        <VStack alignItems='center' pt={50}>
          <MobileHeader
            title={userStore.shopName}
            subTitle={t('wallet.heading.description', {
              appName: t('app.name'),
            })}></MobileHeader>
        </VStack>

        <VStack mt={40} p={20} bg='white' rounded='$lg'>
          <HStack justifyContent='space-between'>
            <Para2Text style={{ color: '#5C66D5' }}>
              • {t('wallet.modal.body.a')}
            </Para2Text>
            <WrapHistoryButton
              borderRadius='$full'
              h={24}
              pt={-2}
              onPress={() => navigation.navigate('MileageProvideHistory')}>
              <Para2Text style={{ color: '#707070' }}>
                {t('wallet.link.history.redemption')}
              </Para2Text>
            </WrapHistoryButton>
          </HStack>

          <Box mt={18}>
            <Para3Text>{t('wallet.modal.body.b')}</Para3Text>
            <HStack mt={4} alignItems='center'>
              <NumberText>
                {convertShopProperValue(
                  providedAmount.toBOAString(),
                  userStore.currency,
                )}{' '}
              </NumberText>
              <Para3Text pt={4} color='#12121D' style={{ fontWeight: 400 }}>
                {userStore.currency.toUpperCase()}
              </Para3Text>
            </HStack>
          </Box>
          <WrapDivider></WrapDivider>
          <Box mt={4}>
            <Para3Text>{t('wallet.modal.body.c')}</Para3Text>
            <HStack mt={4} alignItems='center'>
              <NumberText>
                {convertShopProperValue(
                  usedAmount.toBOAString(),
                  userStore.currency,
                )}{' '}
              </NumberText>
              <Para3Text pt={4} color='#12121D' style={{ fontWeight: 400 }}>
                {userStore.currency.toUpperCase()}
              </Para3Text>
            </HStack>
          </Box>
        </VStack>

        <VStack mt={12} p={20} bg='white' rounded='$lg'>
          <HStack justifyContent='space-between'>
            <Para2Text style={{ color: '#5C66D5' }}>
              • {t('wallet.modal.body.d')}
            </Para2Text>
            <WrapHistoryButton
              borderRadius='$full'
              h={24}
              pt={-2}
              onPress={() => navigation.navigate('MileageAdjustmentHistory')}>
              <Para2Text style={{ color: '#707070' }}>
                {t('wallet.link.history.settlement')}
              </Para2Text>
            </WrapHistoryButton>
          </HStack>

          {/*<Box mt={18}>*/}
          {/*  <HStack alignItems='center'>*/}
          {/*    <Text _dark={{ color: '$textLight200' }} size='sm' mr='$2'>*/}
          {/*      {t('wallet.modal.body.e')} :{' '}*/}
          {/*      {adjustmentStatus === ShopWithdrawStatus.OPEN*/}
          {/*        ? convertShopProperValue(*/}
          {/*            withdrawAmount.toBOAString(),*/}
          {/*            userStore.currency,*/}
          {/*          )*/}
          {/*        : convertShopProperValue(*/}
          {/*            new Amount(0, 18).toBOAString(),*/}
          {/*            userStore.currency,*/}
          {/*          )}{' '}*/}
          {/*      {userStore.currency.toUpperCase()}*/}
          {/*    </Text>*/}
          {/*    {adjustmentStatus === ShopWithdrawStatus.OPEN ? (*/}
          {/*      <Button size='xs' h={25} onPress={() => handleComplete()}>*/}
          {/*        <ButtonText size='xs'>{t('wallet.modal.body.g')}</ButtonText>*/}
          {/*      </Button>*/}
          {/*    ) : null}*/}
          {/*  </HStack>*/}
          {/*</Box>*/}

          <Box mt={18}>
            <HStack justifyContent='space-between' alignItems='center'>
              <Box>
                <Para3Text>{t('wallet.modal.body.e')}</Para3Text>
                <HStack mt={4} alignItems='center'>
                  <NumberText>
                    {adjustmentStatus === ShopWithdrawStatus.OPEN
                      ? convertShopProperValue(
                          withdrawAmount.toBOAString(),
                          userStore.currency,
                        )
                      : convertShopProperValue(
                          new Amount(0, 18).toBOAString(),
                          userStore.currency,
                        )}{' '}
                  </NumberText>
                  <Para3Text pt={4} color='#12121D' style={{ fontWeight: 400 }}>
                    {userStore.currency.toUpperCase()}
                  </Para3Text>
                </HStack>
              </Box>
              <Box>
                {adjustmentStatus === ShopWithdrawStatus.OPEN ? (
                  <WrapWhiteButton h={36} onPress={() => handleComplete()}>
                    <PinButtonText
                      style={{
                        fontWeight: 500,
                        lineHeight: 15,
                        fontSize: 14,
                        color: '#555555',
                      }}>
                      {t('wallet.modal.body.g')}
                    </PinButtonText>
                  </WrapWhiteButton>
                ) : null}
              </Box>
            </HStack>
          </Box>
          <WrapDivider></WrapDivider>

          {/*<Box p='$1'>*/}
          {/*  <HStack alignItems='center'>*/}
          {/*    <Text _dark={{ color: '$textLight200' }} size='sm' mr='$2'>*/}
          {/*      {t('wallet.modal.body.f')} :{' '}*/}
          {/*      {convertShopProperValue(*/}
          {/*        withdrawableAmount.toBOAString(),*/}
          {/*        userStore.currency,*/}
          {/*      )}{' '}*/}
          {/*      {userStore.currency.toUpperCase()}*/}
          {/*    </Text>*/}
          {/*    {adjustmentStatus !== ShopWithdrawStatus.OPEN &&*/}
          {/*    withdrawableAmount.value.gt(BigNumber.from(0)) ? (*/}
          {/*      <Button size='xs' h={25} onPress={() => handleRequest()}>*/}
          {/*        <ButtonText size='xs'>{t('wallet.modal.body.e')}</ButtonText>*/}
          {/*      </Button>*/}
          {/*    ) : null}*/}
          {/*  </HStack>*/}
          {/*</Box>*/}

          <Box mt={4}>
            <HStack justifyContent='space-between' alignItems='center'>
              <Box>
                <Para3Text>{t('wallet.modal.body.f')}</Para3Text>
                <HStack mt={4} alignItems='center'>
                  <NumberText>
                    {convertShopProperValue(
                      withdrawableAmount.toBOAString(),
                      userStore.currency,
                    )}{' '}
                  </NumberText>
                  <Para3Text pt={4} color='#12121D' style={{ fontWeight: 400 }}>
                    {userStore.currency.toUpperCase()}
                  </Para3Text>
                </HStack>
              </Box>
              <Box>
                {adjustmentStatus !== ShopWithdrawStatus.OPEN &&
                withdrawableAmount.value.gt(BigNumber.from(0)) ? (
                  <WrapButton h={36} onPress={() => handleRequest()}>
                    <PinButtonText
                      style={{
                        fontWeight: 500,
                        lineHeight: 15,
                        fontSize: 14,
                        color: '#fff',
                      }}>
                      {t('wallet.modal.body.e')}
                    </PinButtonText>
                  </WrapButton>
                ) : null}
              </Box>
            </HStack>
          </Box>
          <WrapDivider></WrapDivider>

          {/*<Box p='$1'>*/}
          {/*  <Text _dark={{ color: '$textLight200' }} size='sm' mr='$2'>*/}
          {/*    {t('wallet.modal.body.g')} :{' '}*/}
          {/*    {convertShopProperValue(*/}
          {/*      withdrawnAmount.toBOAString(),*/}
          {/*      userStore.currency,*/}
          {/*    )}{' '}*/}
          {/*    {userStore.currency.toUpperCase()}*/}
          {/*  </Text>*/}
          {/*</Box>*/}

          <Box mt={4}>
            <Para3Text>{t('wallet.modal.body.g')}</Para3Text>
            <HStack mt={4} alignItems='center'>
              <NumberText>
                {convertShopProperValue(
                  withdrawnAmount.toBOAString(),
                  userStore.currency,
                )}{' '}
              </NumberText>
              <Para3Text pt={4} color='#12121D' style={{ fontWeight: 400 }}>
                {userStore.currency.toUpperCase()}
              </Para3Text>
            </HStack>
          </Box>
        </VStack>
        <Box h={10}></Box>
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
                <HeaderText>{modalHeader}</HeaderText>
                <ParaText mt={7}>{modalContent}</ParaText>
                <ParaText mt={7}>{t('wallet.modal.body.h')} </ParaText>
              </VStack>

              {/*<ButtonGroup space='md' alignSelf='center'>*/}
              {/*  <Button*/}
              {/*    variant='outline'*/}
              {/*    py='$2.5'*/}
              {/*    action='secondary'*/}
              {/*    onPress={() => {*/}
              {/*      setShowModal(false);*/}
              {/*    }}>*/}
              {/*    <ButtonText fontSize='$sm' fontWeight='$medium'>*/}
              {/*      {t('button.press.b')}*/}
              {/*    </ButtonText>*/}
              {/*  </Button>*/}
              {/*  <Button*/}
              {/*    variant='solid'*/}
              {/*    bg='$success700'*/}
              {/*    borderColor='$success700'*/}
              {/*    onPress={() => {*/}
              {/*      confirmModal();*/}
              {/*    }}>*/}
              {/*    <ButtonText fontSize='$sm' fontWeight='$medium'>*/}
              {/*      {t('button.press.a')}*/}
              {/*    </ButtonText>*/}
              {/*  </Button>*/}
              {/*</ButtonGroup>*/}

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
                      setShowModal(false);
                      confirmModal();
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
export default Index;
