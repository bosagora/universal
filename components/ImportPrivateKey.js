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
  HStack,
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
import { truncateMiddleString } from '../utils/convert';

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

                <Input h={50} borderWidth={0}>
                  <InputField
                    pb={5}
                    fontSize={15}
                    fontWeight={500}
                    lightHeight={16}
                    fontFamily='Roboto-Medium'
                    color='#12121D'
                    style={{
                      borderWidth: 1,
                      borderRadius: 6,
                      borderColor: '#C0C0C0',
                      backgroundColor: '#E4E4E450',
                    }}
                    value={privateKey}
                    onChangeText={setPrivateKey}
                  />
                </Input>
              </FormControl>
            </VStack>

            <HStack flex={1}>
              <Box flex={1} mr={5}>
                <WrapWhiteButton
                  onPress={() => {
                    setShowModal(false);
                    setPrivateKey('');
                  }}>
                  <ActiveWhiteButtonText>
                    {t('button.press.b')}
                  </ActiveWhiteButtonText>
                </WrapWhiteButton>
              </Box>
              <Box flex={1} ml={5}>
                <WrapButton
                  onPress={() => {
                    setShowModal(false);
                    saveKey(privateKey);
                    setPrivateKey('');
                  }}>
                  <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
                </WrapButton>
              </Box>
            </HStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImportPrivateKey;
