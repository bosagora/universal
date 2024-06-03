import React from 'react';
import {
  Box,
  VStack,
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetDragIndicatorWrapper,
  ActionsheetDragIndicator,
  HStack,
  ActionsheetContent,
  Text,
} from '@gluestack-ui/themed';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import { useTranslation } from 'react-i18next';
import { WrapButton } from '../components/styled/button';
import { ActiveButtonText } from '../components/styled/text';

const TermActionSheet = observer(() => {
  const { t } = useTranslation();
  const { secretStore } = useStores();

  const handleClose = () =>
    secretStore.setShowTermSheet(!secretStore.showTermSheet);
  return (
    <Box>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Actionsheet isOpen={secretStore.showTermSheet} onClose={handleClose}>
          <ActionsheetBackdrop bg='$borderLight200' />
          <ActionsheetContent bg='white' maxHeight='75%'>
            <ActionsheetDragIndicatorWrapper>
              <ActionsheetDragIndicator />
            </ActionsheetDragIndicatorWrapper>
            <ScrollView>
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
                        bg: '$borderLight0',
                        borderColor: '$borderLight0',
                      },
                    }}>
                    <Box w='$full' p={20}></Box>
                    <VStack px='$6' pt='$4' pb='$6'>
                      <Text
                        color='black'
                        _dark={{ color: '$black' }}
                        size='sm'
                        p='$1.5'>
                        {t('term.term.detail', { appName: t('app.name') })}
                      </Text>
                      <WrapButton
                        onPress={async () => {
                          handleClose();
                        }}>
                        <ActiveButtonText>{t('term.read')}</ActiveButtonText>
                      </WrapButton>
                    </VStack>
                  </Box>
                </HStack>
              </VStack>
            </ScrollView>
          </ActionsheetContent>
        </Actionsheet>
      </KeyboardAvoidingView>
    </Box>
  );
});

export default TermActionSheet;
