import React from 'react';

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

export default function ActionSheetScreen() {
  const [showActionsheet, setShowActionsheet] = React.useState(false);
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
                  w={50}
                  h='$full'
                  px='$2'
                  borderWidth={1}
                  borderStyle='solid'
                  borderColor='$borderLight300'
                  rounded='$sm'>
                  <Image
                    role='img'
                    source={{ uri: 'https://i.imgur.com/UwTLr26.png' }}
                    alt='kk'
                    flex={1}
                    resizeMode='contain'
                  />
                </Box>
                <VStack flex={1}>
                  <Text fontWeight='$bold'>Mastercard</Text>
                  <Text>Card ending in 2345</Text>
                </VStack>
              </HStack>
              <FormControl mt={36}>
                <FormControlLabel>
                  <FormControlLabelText>
                    Confirm security code
                  </FormControlLabelText>
                </FormControlLabel>
                <Input w='$full'>
                  <InputSlot>
                    <InputIcon as={AddIcon} ml='$2' />
                  </InputSlot>
                  <InputField placeholder='CVC/CVV' />
                </Input>
                <Button onPress={handleClose} mt={20}>
                  <ButtonText>Pay $1000</ButtonText>
                </Button>
              </FormControl>
            </VStack>
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
    </Box>
  );
}
