import React, { useState } from 'react';
import {
  ButtonText,
  FormControl,
  Heading,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  VStack,
  Text,
  Button,
  FormControlHelper,
  FormControlHelperText,
  ButtonGroup,
  Box,
} from '@gluestack-ui/themed';
import { useTranslation } from 'react-i18next';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  HeaderText,
  ParaText,
  SubHeaderText,
} from './styled/text';
import { WrapButton, WrapWhiteButton } from './styled/button';

const ImportPrivateKey = ({ saveKey }) => {
  const { t } = useTranslation();
  const [privateKey, setPrivateKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  return (
    <Box mt={9}>
      <WrapWhiteButton
        onPress={() => {
          setShowModal(true);
        }}>
        <ActiveWhiteButtonText>{t('wallet.import')}</ActiveWhiteButtonText>
      </WrapWhiteButton>
      <Modal
        size='lg'
        avoidKeyboard={true}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}>
        <ModalBackdrop />
        <ModalContent bg='#FFFFFF'>
          <ModalBody mt={30} mb={10} mx={10}>
            <VStack>
              <HeaderText>{t('wallet.import')}</HeaderText>
              <ParaText mt={7}>{t('import.body.text.a')}</ParaText>
            </VStack>
            <VStack py='$2' space='xl'>
              <FormControl>
                <FormControlHelper>
                  <SubHeaderText style={{ color: '#555555' }}>
                    {t('import.body.text.b')}
                  </SubHeaderText>
                </FormControlHelper>

                <Input>
                  <InputField
                    bg='#C0C0C0'
                    style={{
                      fontFamily: 'Roboto-Medium',
                      lineHeight: 16,
                      fontSize: 15,
                      color: '#12121D',
                      borderWidth: 1,
                      borderColor: '#8A8A8A',
                    }}
                    value={privateKey}
                    onChangeText={setPrivateKey}
                  />
                </Input>
              </FormControl>
            </VStack>

            <ButtonGroup space='md' alignSelf='center'>
              <Button
                variant='outline'
                py='$2.5'
                action='secondary'
                onPress={() => {
                  setShowModal(false);
                  setPrivateKey('');
                }}>
                <ButtonText fontSize='$sm' fontWeight='$medium'>
                  {t('button.press.b')}
                </ButtonText>
              </Button>
              <Button
                variant='solid'
                bg='$success700'
                borderColor='$success700'
                onPress={() => {
                  setShowModal(false);
                  saveKey(privateKey);
                  setPrivateKey('');
                }}>
                <ButtonText fontSize='$sm' fontWeight='$medium'>
                  {t('button.press.a')}
                </ButtonText>
              </Button>
            </ButtonGroup>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImportPrivateKey;
