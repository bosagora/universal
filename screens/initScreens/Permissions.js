import { SafeAreaView } from 'react-native';
import { useStores } from '../../stores';
import { observer } from 'mobx-react';
import React, { useEffect, useState } from 'react';
import * as Device from 'expo-device';

import {
  Box,
  Button,
  ButtonText,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import MobileHeader from '../../components/MobileHeader';
import { useTranslation } from 'react-i18next';
import { WrapBox, WrapDivider } from '../../components/styled/layout';
import {
  ActiveButtonText,
  Header2Text,
  ParaText,
} from '../../components/styled/text';
import { WrapButton } from '../../components/styled/button';

const Permissions = observer(({ navigation }) => {
  const { t } = useTranslation();
  const { userStore } = useStores();
  const [values, setValues] = useState(['T1', 'T2']);
  useEffect(() => {
    console.log(
      'Permissions Screen > expoPushToken :',
      userStore.expoPushToken,
    );
    userStore.setLoading(false);
  }, []);

  function checkPushToken() {
    console.log('checkPushToken > permision count', userStore.permissionsCount);
    console.log('checkPushToken >expoPushToken', userStore.expoPushToken);
    if (userStore.expoPushToken === '') return false;
    console.log('1');
    if (userStore.expoPushToken.length < 10) return false;
    console.log('2');
    if (!userStore.expoPushToken.includes('ExponentPushToken')) return false;
    return true;
  }
  function agreePermissions() {
    console.log('agreePermissions >');
    if (Device.isDevice) {
      if (true || checkPushToken()) {
        navigation.navigate('Term');
      } else {
        alert(t('permission.agree.alert'));
        userStore.setPermissionsCount();
      }
    } else {
      navigation.navigate('Term');
    }
  }
  return (
    <WrapBox>
      <Box flex={5}>
        <MobileHeader
          title={t('permission.header.title')}
          subTitle={t('permission.header.subtitle', {
            appName: t('app.name'),
          })}></MobileHeader>

        <VStack mt={50}>
          <VStack>
            <Header2Text>{t('permission.body.heading')}</Header2Text>
            <WrapDivider></WrapDivider>
            <ParaText mt={5}>
              {t('permission.body.text.a', { appName: t('app.name') })}
            </ParaText>
            <ParaText mt={15}>
              {t('permission.body.text.b', { appName: t('app.name') })}
            </ParaText>
          </VStack>
        </VStack>
      </Box>
      <Box py={10}>
        <WrapButton onPress={() => agreePermissions()}>
          <ActiveButtonText>{t('next')}</ActiveButtonText>
        </WrapButton>
      </Box>
    </WrapBox>
  );
});

export default Permissions;
