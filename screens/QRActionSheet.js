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
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { RobotoSemiBoldText } from '../components/styled/text';

const QRActionSheet = observer(() => {
  const { t } = useTranslation();
  const { secretStore } = useStores();
  const [temporaryAccount, setTemporaryAccount] = useState('00000');
  useEffect(() => {
    try {
      async function fetchTemporaryAccount() {
        const account = await secretStore.client.ledger.getTemporaryAccount();
        console.log('account :', account);
        setTemporaryAccount(account);
      }

      if (secretStore.showQRSheet) fetchTemporaryAccount();
      else setTemporaryAccount('00000');
    } catch (e) {
      console.log('e :', e);
    }
  }, [secretStore.showQRSheet]);
  const handleClose = () => {
    secretStore.setShowQRSheet(!secretStore.showQRSheet);
    setTemporaryAccount('00000');
  };
  return (
    <Box>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Actionsheet isOpen={secretStore.showQRSheet} onClose={handleClose}>
          <ActionsheetBackdrop bg='$borderLight200' />
          <ActionsheetContent bg='white' maxHeight='75%'>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <VStack w='$full' p={20}>
              <Box space='lg' pt='$4' m='$7' alignItems='center'>
                <RobotoSemiBoldText fontSize={18}>
                  {t('wallet.bottom.qr')}
                </RobotoSemiBoldText>
              </Box>
              <HStack justifyContent='center' alignItems='center' space='md'>
                <Box
                  // maxWidth='$64'
                  borderColor='$borderLight200'
                  borderRadius='$lg'
                  borderWidth='$1'
                  my='$4'
                  overflow='hidden'
                  sx={{
                    '@base': {
                      mx: '$5',
                    },
                    _dark: {
                      bg: '$borderLight0',
                      borderColor: '$borderLight0',
                    },
                  }}>
                  <Box w='$full' p={20}>
                    {secretStore.address ? (
                      temporaryAccount == '00000' ? (
                        <Box w={150} height={150} pt={60}>
                          <ActivityIndicator size='large' />
                        </Box>
                      ) : (
                        <QRCode size={150} value={temporaryAccount} />
                      )
                    ) : null}
                  </Box>
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

export default QRActionSheet;
