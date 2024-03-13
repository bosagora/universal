import { Platform, SafeAreaView } from 'react-native';
import { trunk, useStores } from '../../stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import 'react-native-get-random-values';
import '@ethersproject/shims';
import { ethers } from 'ethers';
import * as Clipboard from 'expo-clipboard';

import {
  getSecureValue,
  saveSecure,
  saveSecureValue,
} from '../../utils/secure.store';
import ImportShopPrivateKey from '../../components/ImportShopPrivateKey';
import {
  Box,
  ButtonText,
  Button,
  Center,
  VStack,
  HStack,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  Heading,
  Text,
  FormControl,
  FormControlHelper,
  FormControlHelperText,
  Input,
  View,
  InputField,
  ButtonGroup,
  Icon,
  ModalCloseButton,
  ModalHeader,
  CloseIcon,
} from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader'; //for ethers.js
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getClient } from '../../utils/client';
import * as Device from 'expo-device';
import { ContractUtils, MobileType } from 'dms-sdk-client';
import { AUTH_STATE } from '../../stores/user.store';
import { useTranslation } from 'react-i18next';
import ImportPrivateKey from '../../components/ImportPrivateKey';
import {
  WrapBase2,
  WrapBox,
  WrapDivider,
} from '../../components/styled/layout';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  HeaderText,
  NumberText,
  ParaText,
  RobotoMediumText,
  RobotoSemiBoldText,
  SubHeaderText,
} from '../../components/styled/text';
import { WrapButton, WrapWhiteButton } from '../../components/styled/button';
const { Wallet } = ethers;

const WalletManager = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { userStore, secretStore, loyaltyStore, pinStore } = useStores();
  const [privateKey, setPrivateKey] = useState(
    '0000000000000000000000000000000000000000000000000000000000000001',
  );
  const [showModal, setShowModal] = useState(false);
  const [showInitWalletModal, setShowInitWalletModal] = useState(false);
  const [client, setClient] = useState();
  const [address, setAddress] = useState('');

  const [fromOtherWallet, setFromOtherWallet] = useState(false);
  const [nextScreen, setNextScreen] = useState('none');
  useEffect(() => {
    const nc =
      process.env.EXPO_PUBLIC_APP_KIND === 'shop' ? 'ShopReg' : 'PhoneAuth';
    setNextScreen(nc);
  }, []);
  const fetchClient = async () => {
    const { client: client1, address: userAddress } = await getClient();
    setClient(client1);
    setAddress(userAddress);

    console.log('Secret fetch > client1 :', client1);
    return client1;
  };
  // async function registerPushTokenWithClient(cc) {
  //   console.log('registerPushTokenWithClient >>>>>>>> cc:', cc);
  //   const token = userStore.expoPushToken;
  //   console.log('token :', token);
  //   const language = userStore.lang.toLowerCase();
  //   const os = Platform.OS === 'android' ? 'android' : 'iOS';
  //   try {
  //     await cc.ledger.registerMobileToken(
  //       token,
  //       language,
  //       os,
  //       process.env.EXPO_PUBLIC_APP_KIND === 'shop'
  //         ? MobileType.SHOP_APP
  //         : MobileType.USER_APP,
  //     );
  //     return true;
  //   } catch (e) {
  //     await Clipboard.setStringAsync(JSON.stringify(e));
  //     console.log('error : ', e);
  //     alert(t('secret.alert.push.fail') + JSON.stringify(e.message));
  //     return false;
  //   }
  // }

  useEffect(() => {
    async function fetchKey() {
      const key = await getSecureValue('privateKey');
      setPrivateKey(key);
    }
    fetchKey();
  }, []);

  async function exportWallet() {
    setShowModal(true);
  }

  // async function saveSecure(key) {
  //   key = key.trim();
  //   let wallet;
  //   try {
  //     wallet = new Wallet(key);
  //   } catch (e) {
  //     console.log('Invalid private key.');
  //     alert(t('secret.alert.wallet.invalid'));
  //     return;
  //   }
  //   secretStore.setAddress(wallet.address);
  //   await saveSecureValue('address', wallet.address);
  //   await saveSecureValue('privateKey', key);
  // }

  async function saveKey(key) {
    await saveSecure(key, secretStore, t('secret.alert.wallet.invalid'));

    await fetchClient();
    userStore.setLoading(false);
    setFromOtherWallet(true);
  }
  async function saveKeyForShop(key) {
    await saveSecure(key, secretStore, t('secret.alert.wallet.invalid'));

    await fetchClient();
    userStore.setLoading(false);
    setFromOtherWallet(true);
  }

  async function afterSelectingShop() {
    if (Device.isDevice) {
      const ret = await registerPushTokenWithClient(
        client,
        userStore,
        process.env.EXPO_PUBLIC_APP_KIND,
      );
      if (ret) {
        alert(t('config.wallet.alert.import.done'));
        navigation.navigate('Wallet');
      } else {
        alert(t('config.wallet.alert.import.fail'));
      }
    } else {
      console.log('Not on device.');
      alert(t('config.wallet.alert.import.done'));
      navigation.navigate('Wallet');
    }
  }

  async function warnInitializeWallet() {
    setShowInitWalletModal(true);
  }
  async function initAuth() {
    console.log('initAuth');
    clearInterval(userStore.walletInterval);
    userStore.reset();
    pinStore.reset();
    loyaltyStore.reset();
    secretStore.reset();
    await saveSecureValue('address', '');
    await saveSecureValue('mnemonic', '');
    await saveSecureValue('privateKey', '');
    userStore.setAuthState(AUTH_STATE.INIT);
  }

  return (
    <WrapBox
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}>
      <MobileHeader
        title={t('config.wallet.header.title')}
        subTitle={t('config.wallet.header.subtitle')}
      />
      <VStack pt={50}>
        <Box>
          <WrapButton onPress={() => exportWallet()}>
            <ActiveButtonText>{t('wallet.export')}</ActiveButtonText>
          </WrapButton>
        </Box>
        {nextScreen === 'ShopReg' ? (
          <ImportShopPrivateKey
            saveKey={saveKeyForShop}
            fromOtherWallet={fromOtherWallet}
            afterSelectingShop={afterSelectingShop}
            client={client}
          />
        ) : (
          <ImportPrivateKey saveKey={saveKey} />
        )}
        <Box mt={10}>
          <WrapButton onPress={() => warnInitializeWallet()}>
            <ActiveButtonText>{t('wallet.init')}</ActiveButtonText>
          </WrapButton>
        </Box>
      </VStack>
      <Box>
        <KeyboardAwareScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={{ marginBottom: 150 }}
          enableOnAndroid={true}
          scrollEnabled={true}
          extraScrollHeight={100}
          keyboardShouldPersistTaps='handled'
          scrollToOverflowEnabled={true}
          enableAutomaticScroll={true}>
          <View>
            <Modal
              size='lg'
              isOpen={showModal}
              onClose={() => {
                setShowModal(false);
              }}>
              <ModalBackdrop />
              <ModalContent bg='#FFFFFF'>
                {/*<ModalHeader>*/}

                {/*  <ModalCloseButton>*/}
                {/*    <Icon as={CloseIcon} />*/}
                {/*  </ModalCloseButton>*/}
                {/*</ModalHeader>*/}
                <ModalBody mt={30} mb={10} mx={10}>
                  <VStack>
                    <HeaderText>{t('config.wallet.modal.heading')}</HeaderText>
                    <ParaText mt={7}>
                      {t('config.wallet.modal.body.text.a')}
                    </ParaText>
                    <ParaText mt={7}>
                      {t('config.wallet.modal.body.text.b')}
                    </ParaText>
                  </VStack>
                  <VStack py='$2' space='sm'>
                    <FormControl>
                      <FormControlHelper>
                        <SubHeaderText style={{ color: '#555555' }}>
                          {t('config.wallet.modal.body.text.c')}
                        </SubHeaderText>
                      </FormControlHelper>
                      <Input h={60}>
                        <InputField
                          bg='#C0C0C0'
                          style={{
                            fontFamily: 'Roboto-Medium',
                            fontWeight: 500,
                            lineHeight: 16,
                            fontSize: 15,
                            color: '#12121D',
                            borderWidth: 1,
                            borderColor: '#8A8A8A',
                          }}
                          value={privateKey}
                        />
                      </Input>
                    </FormControl>
                    <FormControl>
                      <FormControlHelper>
                        <SubHeaderText style={{ color: '#555555' }}>
                          {t('config.wallet.modal.body.text.d')}
                        </SubHeaderText>
                      </FormControlHelper>
                      <Input h={60}>
                        <InputField
                          bg='#C0C0C0'
                          style={{
                            fontFamily: 'Roboto-Medium',
                            fontWeight: 500,
                            lineHeight: 16,
                            fontSize: 15,
                            color: '#12121D',
                            borderWidth: 1,
                            borderColor: '#8A8A8A',
                          }}
                          value={userStore.shopId}
                        />
                      </Input>
                    </FormControl>
                  </VStack>

                  <HStack flex={1}>
                    <Box flex={1} mx={5}>
                      <WrapButton
                        onPress={async () => {
                          await Clipboard.setStringAsync(privateKey);
                          setShowModal(false);
                        }}>
                        <ActiveButtonText>
                          {t('config.wallet.modal.body.text.e')}
                        </ActiveButtonText>
                      </WrapButton>
                    </Box>
                    <Box flex={1} mx={5}>
                      <WrapButton
                        onPress={async () => {
                          await Clipboard.setStringAsync(userStore.shopId);
                          setShowModal(false);
                        }}>
                        <ActiveButtonText>
                          {t('config.wallet.modal.body.text.f')}
                        </ActiveButtonText>
                      </WrapButton>
                    </Box>
                  </HStack>
                </ModalBody>
              </ModalContent>
            </Modal>

            <Modal
              size='lg'
              isOpen={showInitWalletModal}
              onClose={() => {
                setShowInitWalletModal(false);
              }}>
              <ModalBackdrop />
              <ModalContent bg='#FFFFFF'>
                <ModalBody mt={30} mb={10} mx={10}>
                  <VStack>
                    <HeaderText>{t('wallet.init')}</HeaderText>
                    <ParaText mt={7}>
                      {t('config.wallet.modal.body.text.g')}
                    </ParaText>
                    <ParaText mt={7}>
                      {t('config.wallet.modal.body.text.h')}
                    </ParaText>
                  </VStack>

                  <HStack flex={1} mt={30}>
                    <Box flex={1} mx={5}>
                      <WrapWhiteButton
                        onPress={async () => {
                          setShowInitWalletModal(false);
                        }}>
                        <ActiveWhiteButtonText>
                          {t('button.press.b')}
                        </ActiveWhiteButtonText>
                      </WrapWhiteButton>
                    </Box>
                    <Box flex={1} mx={5}>
                      <WrapButton
                        onPress={async () => {
                          setShowInitWalletModal(false);
                          await initAuth();
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
          </View>
        </KeyboardAwareScrollView>
      </Box>
    </WrapBox>
  );
});

export default WalletManager;
