import React, { useEffect, useState } from 'react';

import { styled } from '@gluestack-style/react';
import {
  AddIcon,
  Box,
  Button,
  ButtonIcon,
  VStack,
  Heading,
  ButtonText,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  HStack,
  ActionsheetContent,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputSlot,
  InputIcon,
  InputField,
  Image,
  Text,
} from '@gluestack-ui/themed';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { getSecureValue } from '../../utils/secure.store';
import QRCode from 'react-native-qrcode-svg';

export default function QRActionSheet() {
  const [showActionsheet, setShowActionsheet] = React.useState(false);
  const [walletAddress, SetWalletAddress] = useState('');
  useEffect(() => {
    async function fetchWalletAddress() {
      const address = await getSecureValue('address');
      SetWalletAddress(address);
    }
    fetchWalletAddress();
  }, []);
  const handleClose = () => setShowActionsheet(!showActionsheet);
  return (
    <Box>
      <Button onPress={handleClose}>
        <ButtonText>Open</ButtonText>
      </Button>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Actionsheet isOpen={showActionsheet} onClose={handleClose}>
          <ActionsheetBackdrop />
          <ActionsheetContent maxHeight='75%'>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <VStack w='$full' p={20}>
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
                      bg: '$backgroundDark700',
                      borderColor: '$borderDark800',
                    },
                  }}>
                  <Box w='$full' p={20}>
                    {walletAddress ? (
                      <QRCode size={250} value={walletAddress} />
                    ) : null}
                  </Box>
                  <VStack px='$6' pt='$4' pb='$6'>
                    <Text
                      _dark={{ color: '$textLight200' }}
                      fontSize='$sm'
                      my='$1.5'>
                      User Address : {walletAddress}
                    </Text>
                  </VStack>
                </Box>
              </HStack>
            </VStack>
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
    </Box>
  );
}
