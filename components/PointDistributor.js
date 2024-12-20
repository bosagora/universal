import React, { useEffect, useState } from 'react';
import {
  FormControl,
  FormControlLabel,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  VStack,
  Text,
  FormControlHelper,
  Box,
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  Icon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
  HStack,
} from '@gluestack-ui/themed';
import { ChevronDownIcon } from 'lucide-react-native';
import Feather from '@expo/vector-icons/Feather';
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import { truncateMiddleString } from '../utils/convert';
import { useTranslation } from 'react-i18next';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  AppleSDGothicNeoH,
  HeaderText,
  ParaText,
  RobotoMediumText,
  SubHeaderText,
  Para2Text,
} from './styled/text';
import { WrapButton, WrapWhiteButton, WrapHistoryButton } from './styled/button';
import * as yup from 'yup';
import { useFormik } from 'formik';
import { isAddress } from '@ethersproject/address';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';

const PointDistributor = observer(() => {
  const { t } = useTranslation();
  const { secretStore, userStore } = useStores();
  const [distributor, setDistributor] = useState('');
  const [validDistributorInput, setValidDistributorInput] = useState(false);
  const [showRegisterDistributorModal, setShowRegisterDistributorModal] =
    useState(false);
  const [showRemoveDistributorModal, setShowRemoveDistributorModal] =
    useState(false);
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const navigation = useNavigation();
  useEffect(() => {
    async function getList() {
      const assistance = await secretStore.client.ledger.getAssistant();
      console.log('assistance :', assistance);
      setDistributor(assistance);
    }
    getList();
  }, [distributor]);

  const registerInitialDistributor = {
    distributor: '',
  };
  const registerDistributorSchema = yup.object().shape({
    distributor: yup.string().required(),
  });
  const distributorFormik = useFormik({
    initialValues: registerInitialDistributor,
    validationSchema: registerDistributorSchema,
    onSubmit: (values, { resetForm }) => {
      console.log('distributor values:', values.distributor);
      if (!validDistributorInput) return;
      registerDistributor(values.distributor).then((ret) => {
        if (ret) {
          resetForm();
          setValidDistributorInput(false);
          setShowRegisterDistributorModal(false);
        }
      });
    },
  });
  const setDistributorInput = async (v) => {
    console.log('distributor address :', v);
    distributorFormik.setFieldValue('distributor', v);
    const isEthAddress = isAddress(v);
    console.log('isEthAddress :', isEthAddress);
    if (isEthAddress) {
      // show check icon
      // set the flag to register
      setValidDistributorInput(true);
    } else {
      // hide check icon
      // set the flag
      setValidDistributorInput(false);
    }
  };

  const registerDistributor = async (v) => {
    const steps = [];
    try {
      userStore.setLoading(true);
      for await (const step of secretStore.client.ledger.registerAssistant(v)) {
        console.log('registerAssistant step :', step);
        steps.push(step);
      }
      setDistributor(v);
      userStore.setLoading(false);
      return true;
    } catch (e) {
      userStore.setLoading(false);
      alert('e: ' + JSON.stringify(e.message));
      return false;
    }
  };
  const removeDistributor = async () => {
    const steps = [];
    try {
      userStore.setLoading(true);
      for await (const step of secretStore.client.ledger.unregisterAssistant()) {
        console.log('removeDistributor step :', step);
        steps.push(step);
      }
      userStore.setLoading(false);
      setShowRemoveDistributorModal(false);
      setDistributor(zeroAddress);
      return true;
    } catch (e) {
      userStore.setLoading(false);
      setShowRemoveDistributorModal(false);
      alert('e: ' + JSON.stringify(e.message));
      return false;
    }
  };

  return (
    <Box mt={10} bg='white' rounded='$xl'>
      <HStack
        mt={20}
        mx={18}
        alignItems='center'
        justifyContent='space-between'>
        <AppleSDGothicNeoH color='#5C66D5'>
          {t('user.wallet.point.transfer.agent.title')}
        </AppleSDGothicNeoH>
        <WrapHistoryButton
          borderRadius='$full'
          h={24}
          pt={-2}
          onPress={() =>
            navigation.navigate('PointAgentHistory')
          }>
          <Para2Text
            style={{
              fontSize: 12,
              color: '#707070',
            }}>
            {t('wallet.link.history.provide')}
          </Para2Text>
        </WrapHistoryButton>
      </HStack>
      <Box py={20}>
        {distributor === zeroAddress ? (
          <WrapButton
            mx={18}
            bg='black'
            borderColor='#8A8A8A'
            borderRadius='$lg'
            borderWidth='$1'
            onPress={() => setShowRegisterDistributorModal(true)}>
            <RobotoMediumText
              style={{
                fontWeight: 500,
                lineHeight: 16,
                fontSize: 15,
                color: '#fff',
              }}>
              {t('register')}
            </RobotoMediumText>
          </WrapButton>
        ) : (
          <HStack mx={18} alignItems='center' justifyContent='space-between'>
            <RobotoMediumText
              fontSize={15}
              fontWeight={500}
              lightHeight={16}
              color='#707070'>
              {truncateMiddleString(distributor || '', 22)}
            </RobotoMediumText>
            <Box>
              <Feather
                name='delete'
                size={24}
                color='black'
                onPress={() => setShowRemoveDistributorModal(true)}
              />
            </Box>
          </HStack>
        )}
        <Modal
          isOpen={showRegisterDistributorModal}
          size='lg'
          onOpen={() => {
            distributorFormik.setFieldValue('distributor', '');
          }}
          onClose={() => {
            setShowRegisterDistributorModal(false);
          }}>
          <ModalBackdrop />
          <ModalContent bg='#FFFFFF'>
            <ModalBody mt={30} mb={10} mx={10}>
              <VStack>
                <HeaderText>
                  {t('user.wallet.point.transfer.agent.title')}
                </HeaderText>
                <ParaText mt={7}>
                  {t('Register a Point Transfer Agent')}
                </ParaText>
              </VStack>

              <Box py={30}>
                <FormControl
                  size='md'
                  isInvalid={!!distributorFormik.errors.distributor}>
                  <VStack space='xs'>
                    <HStack
                      alignItems='center'
                      justifyContent='space-between'
                      space='sm'>
                      <Input
                        flex={1}
                        mt={5}
                        style={{
                          height: 48,
                          borderWidth: 1,
                          borderColor: '#E4E4E4',
                        }}>
                        <InputField
                          style={{
                            fontFamily: 'Roboto-Medium',
                            lineHeight: 20,
                            fontSize: 19,
                            color: '#12121D',
                          }}
                          placeholder='Enter Address here'
                          onChangeText={setDistributorInput}
                          onBlur={distributorFormik.handleBlur('distributor')}
                          value={distributorFormik.values?.distributor}
                        />
                      </Input>
                      {validDistributorInput ? (
                        <FontAwesome6
                          name='check-circle'
                          size={24}
                          color='black'
                        />
                      ) : null}
                    </HStack>
                  </VStack>
                </FormControl>
              </Box>

              <HStack pt={20} flex={1}>
                <Box flex={1} mr={5}>
                  <WrapWhiteButton
                    onPress={() => {
                      distributorFormik.setFieldValue('distributor', '');
                      setShowRegisterDistributorModal(false);
                    }}>
                    <ActiveWhiteButtonText>
                      {t('button.press.b')}
                    </ActiveWhiteButtonText>
                  </WrapWhiteButton>
                </Box>
                <Box flex={1} ml={5}>
                  <WrapButton
                    bg={validDistributorInput ? '#5C66D5' : '#E4E4E4'}
                    onPress={distributorFormik.handleSubmit}>
                    <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
                  </WrapButton>
                </Box>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>

        <Modal isOpen={showRemoveDistributorModal} size='lg'>
          <ModalBackdrop />
          <ModalContent bg='#FFFFFF'>
            <ModalBody mt={30} mb={10} mx={10}>
              <VStack>
                <HeaderText>
                  {t('user.wallet.point.transfer.agent.remove.title')}
                </HeaderText>
                <ParaText mt={7}>
                  {t('user.wallet.point.transfer.agent.description.remove')}
                </ParaText>
              </VStack>

              <HStack pt={20} flex={1}>
                <Box flex={1} mr={5}>
                  <WrapWhiteButton
                    onPress={() => {
                      setShowRemoveDistributorModal(false);
                    }}>
                    <ActiveWhiteButtonText>
                      {t('button.press.b')}
                    </ActiveWhiteButtonText>
                  </WrapWhiteButton>
                </Box>
                <Box flex={1} ml={5}>
                  <WrapButton
                    bg={'#5C66D5'}
                    onPress={async () => await removeDistributor()}>
                    <ActiveButtonText>{t('button.press.a')}</ActiveButtonText>
                  </WrapButton>
                </Box>
              </HStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  );
});

export default PointDistributor;
