import React, { useEffect, useState } from 'react';
import {
  Box,
  VStack,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  HStack,
  ActionsheetContent,
} from '@gluestack-ui/themed';
import { KeyboardAvoidingView, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import {
  RobotoMediumText,
  RobotoSemiBoldText,
} from '../components/styled/text';
import * as Updates from 'expo-updates';
import * as Device from 'expo-device';
import { WrapButton } from '../components/styled/button';

const UpdateActionSheet = observer(() => {
  const { t } = useTranslation();
  const { userStore } = useStores();
  const [showUpdate, setShowUpdate] = useState(false);
  useEffect(() => {
    try {
      async function onFetchUpdateAsync() {
        try {
          const update = await Updates.checkForUpdateAsync();

          if (update.isAvailable) {
            // alert('update :' + JSON.stringify(update));
            userStore.setInUpdate(true);
            setShowUpdate(true);
          }
        } catch (error) {
          // You can also add an alert() to see the error message in case of an error when fetching updates.
          alert(`Error fetching latest Expo update: ${error}`);
        }
      }
      if (Device.isDevice) onFetchUpdateAsync();
    } catch (e) {
      console.log('e :', e);
    }
  }, []);
  const doUpdate = async () => {
    setShowUpdate(false);
    if (Device.isDevice) {
      userStore.setInUpdate(false);
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    }
  };

  const doNotUpdate = () => {
    userStore.setInUpdate(false);
    setShowUpdate(false);
  };

  return (
    <Box>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Actionsheet isOpen={showUpdate}>
          <ActionsheetBackdrop bg='$borderLight200' />
          <ActionsheetContent bg='white' maxHeight='75%'>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <VStack w='$full' p={20}>
              <Box space='lg' pt='$4' m='$7' alignItems='center'>
                <RobotoSemiBoldText fontSize={18}>
                  {t('update.action.header')}
                </RobotoSemiBoldText>
              </Box>

              <HStack py={20} px={20} flex={1} space='md'>
                <Box flex={1}>
                  <WrapButton
                    bg='black'
                    borderColor='#8A8A8A'
                    borderRadius='$lg'
                    borderWidth='$1'
                    onPress={() => doNotUpdate()}>
                    <RobotoMediumText
                      style={{
                        fontWeight: 500,
                        lineHeight: 16,
                        fontSize: 15,
                        color: '#fff',
                      }}>
                      {t('skip')}
                    </RobotoMediumText>
                  </WrapButton>
                </Box>
                <Box flex={1}>
                  <WrapButton
                    bg='black'
                    borderColor='#8A8A8A'
                    borderRadius='$lg'
                    borderWidth='$1'
                    onPress={() => doUpdate()}>
                    <RobotoMediumText
                      style={{
                        fontWeight: 500,
                        lineHeight: 16,
                        fontSize: 15,
                        color: '#fff',
                      }}>
                      {t('update')}
                    </RobotoMediumText>
                  </WrapButton>
                </Box>
              </HStack>

              <Box space='sm' pt='$1' m='$7'></Box>
            </VStack>
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
    </Box>
  );
});

export default UpdateActionSheet;
