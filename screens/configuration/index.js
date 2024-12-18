import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import {
  Box,
  FlatList,
  HStack,
  VStack,
  Switch,
  Button,
} from '@gluestack-ui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useStores } from '../../stores';
import { PinCodeT } from 'react-native-pincode-bosagora-ys';
import { Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import { registerForPushNotificationsAsync } from '../../hooks/usePushNotification';
import {
  activatePushNotification,
  registerPushTokenWithClient,
} from '../../utils/push.token';
import MobileHeader from '../../components/MobileHeader';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import { RobotoMediumText } from '../../components/styled/text';

const Configuration = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { pinStore, userStore, secretStore } = useStores();
  const [bioAuthenticationEnabled, setBioAuthenticationEnabled] =
    useState(false);

  useEffect(() => {
    setBioAuthenticationEnabled(userStore.enableBio);
    pinStore.setMode(PinCodeT.Modes.Enter);
    pinStore.setSuccessEnter(false);
    pinStore.setVisible(false);
  }, []);
  const toggleBioAuthentication = (toggleState) => {
    setBioAuthenticationEnabled(toggleState);
    userStore.setEnableBio(toggleState);
  };
  const activatePush = async (toggleState) => {
    await activatePushNotification(
      t,
      secretStore,
      userStore,
      process.env.EXPO_PUBLIC_APP_KIND === 'shop' ? userStore.shopId : null,
    );
  };
  const toggleQuickApproval = async (toggleState) => {
    userStore.setLoading(true);

    const steps = [];
    if (toggleState) {
      try {
        for await (const step of secretStore.client.shop.createDelegate(
          userStore.shopId,
        )) {
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
        for await (const step of secretStore.client.shop.removeDelegate(
          userStore.shopId,
        )) {
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

  const setPincode = () => {
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
                    userStore.registeredPushToken ? (
                      <RobotoMediumText
                        fontSize={12}
                        lightHeight={24}
                        fontWeight={500}>
                        Active
                      </RobotoMediumText>
                    ) : (
                      <Button onPress={activatePush} size='sm'>
                        <RobotoMediumText
                          fontSize={12}
                          lightHeight={24}
                          fontWeight={500}
                          color='white'>
                          Activate
                        </RobotoMediumText>
                      </Button>
                    )
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
