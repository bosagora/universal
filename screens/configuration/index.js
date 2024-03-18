import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Box,
  Heading,
  FlatList,
  HStack,
  VStack,
  Text,
  Switch,
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useStores } from '../../stores';
import { PinCodeT } from 'react-native-pincode-bosagora-ys';
import { Platform, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { registerForPushNotificationsAsync } from '../../hooks/usePushNotification';
import { getClient } from '../../utils/client';
import { MobileType } from 'dms-sdk-client';
import * as Clipboard from 'expo-clipboard';
import { registerPushTokenWithClient } from '../../utils/push.token';
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
  RobotoMediumText,
} from '../../components/styled/text';

const Configuration = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { pinStore, userStore } = useStores();
  const [bioAuthenticationEnabled, setBioAuthenticationEnabled] =
    useState(false);
  const [registeredPushToken, setRegisteredPushToken] = useState(false);
  const [client, setClient] = useState();
  const [walletAddress, setWalletAddress] = useState('');

  const fetchClient = async () => {
    const { client: client1, address: userAddress } =
      await getClient('configIndex');
    console.log('>>>>>>> userAddress :', userAddress);
    setClient(client1);
    setWalletAddress(userAddress);

    console.log('Secret fetch > client1 :', client1);
    return client1;
  };

  useEffect(() => {
    setBioAuthenticationEnabled(userStore.enableBio);
    setRegisteredPushToken(userStore.registeredPushToken);
    pinStore.setMode(PinCodeT.Modes.Enter);
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(false);
  }, []);
  const toggleBioAuthentication = (toggleState) => {
    console.log('bio :', toggleState);
    setBioAuthenticationEnabled(toggleState);
    userStore.setEnableBio(toggleState);
  };
  const togglePushNotification = async (toggleState) => {
    console.log('PushNotification :', toggleState);
    setRegisteredPushToken(toggleState);
    const ret = await registerForPushNotificationsAsync(userStore);

    if (ret === 'denied') {
      alert(t('permission.body.text.b', { appName: t('app.name') }));
      return;
    }

    if (toggleState && ret === 'granted') {
      const cc = await fetchClient();
      const regRet = await registerPushTokenWithClient(
        cc,
        userStore,
        process.env.EXPO_PUBLIC_APP_KIND,
      );
      if (regRet) {
        setRegisteredPushToken(true);
        // userStore.setRegisteredPushToken(true);
      }
    } else {
      setRegisteredPushToken(false);
      // userStore.setRegisteredPushToken(false);
    }
  };
  const toggleQuickApproval = async (toggleState) => {
    console.log('toggleQuickApproval :', toggleState);
    userStore.setLoading(true);

    const steps = [];
    const cc = await fetchClient();
    if (toggleState) {
      try {
        for await (const step of cc.shop.createDelegate(userStore.shopId)) {
          steps.push(step);
          console.log('createDelegate step :', step);
        }
        if (steps.length === 3 && steps[2].key === 'done') {
          userStore.setQuickApproval(true);
        }
        userStore.setLoading(false);
      } catch (e) {
        console.log('error : ', e);
        userStore.setLoading(false);
      }
    } else {
      try {
        for await (const step of cc.shop.removeDelegate(userStore.shopId)) {
          steps.push(step);
          console.log('removeDelegate step :', step);
        }
        if (steps.length === 3 && steps[2].key === 'done') {
          userStore.setQuickApproval(false);
        }
        userStore.setLoading(false);
      } catch (e) {
        console.log('error : ', e);
        userStore.setLoading(false);
      }
    }
  };

  // async function registerPushTokenWithClient(cc) {
  //   console.log('registerPushTokenWithClient >>>>>>>> cc:', cc);
  //   const token = userStore.expoPushToken;
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
  const setPincode = () => {
    console.log('setPincode');
    pinStore.setNextScreen('setPincode');
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(true);
    pinStore.setUseFooter(true);
  };

  const goWalletManager = () => {
    pinStore.setNextScreen('WalletManager');
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(true);
    pinStore.setUseFooter(true);
  };

  const goProperScreen = (id) => {
    console.log('item.name :', id);
    if (id === 'bd7acbea') {
      setPincode();
    } else if (id === '58694a0f') {
      goWalletManager();
    } else if (id === '3ac68afc') {
      console.log('bio ');
    }
  };

  const aData = [
    {
      id: 'bd7acbea',
      name: t('config.menu.a'),
    },
    {
      id: '3ac68afc',
      name: t('config.menu.b'),
    },
    {
      id: '58694a0f',
      name: t('config.menu.c'),
    },
    {
      id: '4a0f5869',
      name: t('config.menu.d'),
    },
  ];
  const bData = [
    {
      id: 'f44a0869',
      name: t('config.menu.e'),
    },
  ];
  const cData = [
    {
      id: 'cb69423sg',
      name:
        'Version : ' +
        process.env.EXPO_PUBLIC_APP_KIND +
        ' ' +
        Constants.expoConfig?.version +
        '/' +
        process.env.EXPO_PUBLIC_UPDATE_CODE +
        ' (' +
        process.env.EXPO_PUBLIC_ENV +
        ') ',
    },
  ];
  const data =
    process.env.EXPO_PUBLIC_APP_KIND === 'shop'
      ? [...aData, ...bData, ...cData]
      : [...aData, ...cData];
  return (
    <WrapBox
      style={{ paddingTop: 35, backgroundColor: userStore.contentColor }}>
      <MobileHeader title={t('config.setting')} subTitle='' />
      <FlatList
        mt={40}
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable onPress={() => goProperScreen(item.id)}>
            <VStack mt={2} mb={4}>
              <HStack
                space='md'
                alignItems='center'
                justifyContent='space-between'>
                <VStack>
                  <RobotoMediumText
                    fontSize={14}
                    lightHeight={24}
                    fontWeight={500}>
                    {item.name}
                  </RobotoMediumText>
                </VStack>
                <Box>
                  {item.id === '3ac68afc' ? (
                    <Switch
                      size='sm'
                      onToggle={toggleBioAuthentication}
                      value={bioAuthenticationEnabled}
                    />
                  ) : item.id === '4a0f5869' ? (
                    <Switch
                      size='sm'
                      onToggle={togglePushNotification}
                      value={registeredPushToken}
                    />
                  ) : item.id === 'f44a0869' ? (
                    <Switch
                      size='sm'
                      onToggle={toggleQuickApproval}
                      value={userStore.quickApproval}
                    />
                  ) : item.id !== 'cb69423sg' ? (
                    <MaterialIcons
                      name='arrow-forward-ios'
                      size={20}
                      color='#8A8A8A'
                    />
                  ) : null}
                </Box>
              </HStack>
              <WrapDivider></WrapDivider>
            </VStack>
          </Pressable>
        )}
      />
    </WrapBox>
  );
});

export default Configuration;
