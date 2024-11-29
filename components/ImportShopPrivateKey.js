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
import { useStores } from '../stores';
import { observer } from 'mobx-react';
import { truncateMiddleString } from '../utils/convert';
import { useTranslation } from 'react-i18next';
import {
  ActiveButtonText,
  ActiveWhiteButtonText,
  HeaderText,
  ParaText,
  SubHeaderText,
} from './styled/text';
import { WrapButton, WrapWhiteButton } from './styled/button';

const ImportShopPrivateKey = observer(
  ({ saveKey, fromOtherWallet, afterSelectingShop, client }) => {
    const { t } = useTranslation();
    const [privateKey, setPrivateKey] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [shopIds, setShopIds] = useState([]);
    const [selectedShopId, setSelectedShopId] = useState([]);
    useEffect(() => {
      async function getList() {
        const length = await client.shop.getShopsCount();
        if (length > 0) {
          const shopList = await client.shop.getShops(0, length.toNumber());
          setShopIds(shopList);
          await saveShopInfo(userStore.shopId || shopList[0]);
        } else {
          setShopIds([]);
        }
      }
      if (client) getList();
    }, [fromOtherWallet, client]);

    const { userStore } = useStores();
    const onPressShop = async (id) => {
      await saveShopInfo(id);
    };

    const saveShopInfo = async (id) => {
      setSelectedShopId(id);
      const info = await client.shop.getShopInfo(id);
      userStore.setShopId(info.shopId);
      userStore.setShopName(info.name);
      userStore.setCurrency(info.currency);
    };

    const onPressSelectShop = async () => {
      await afterSelectingShop();
    };

    return (
      <Box mt={9}>
        <WrapWhiteButton
          onPress={() => {
            setShowModal(true);
          }}>
          <ActiveWhiteButtonText>{t('wallet.import')}</ActiveWhiteButtonText>
        </WrapWhiteButton>
        {fromOtherWallet === true ? (
          shopIds.length > 0 ? (
            <Box my='$5'>
              <FormControl size='md' isRequired={true}>
                <FormControlLabel mb='$1'>
                  <SubHeaderText style={{ color: '#8A8A8A' }}>
                    {t('import.shop.body.list')}
                  </SubHeaderText>
                </FormControlLabel>
                <Select
                  onValueChange={onPressShop}
                  selectedValue={
                    shopIds ? truncateMiddleString(shopIds[0], 12) : ''
                  }
                  selectedLabel={
                    shopIds ? truncateMiddleString(shopIds[0], 12) : ''
                  }>
                  <SelectTrigger
                    style={{
                      height: 48,
                      borderWidth: 1,
                      borderColor: '#E4E4E4',
                    }}>
                    <SelectInput
                      placeholder='Select option'
                      style={{
                        fontFamily: 'Roboto-Medium',
                        lineHeight: 16,
                        fontSize: 15,
                        color: '#12121D',
                      }}
                    />
                    <SelectIcon mr='$3'>
                      <Icon as={ChevronDownIcon} />
                    </SelectIcon>
                  </SelectTrigger>
                  <SelectPortal>
                    <SelectBackdrop />
                    <SelectContent>
                      <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                      </SelectDragIndicatorWrapper>
                      {shopIds.map((id) => {
                        return (
                          <SelectItem
                            key={id}
                            label={truncateMiddleString(id.toString(), 12)}
                            value={id}
                          />
                        );
                      })}
                    </SelectContent>
                  </SelectPortal>
                </Select>
                <WrapButton
                  mt={10}
                  onPress={() => {
                    onPressSelectShop();
                  }}>
                  <ActiveButtonText>
                    {t('import.shop.body.select')}
                  </ActiveButtonText>
                </WrapButton>
              </FormControl>
            </Box>
          ) : (
            <Text pt='$4' size='sm'>
              {t('import.shop.body.none')}
            </Text>
          )
        ) : null}
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
                      lightHeight={16}
                      fontFamily='Roboto-Medium'
                      color='#12121D'
                      style={{
                        borderWidth: 1,
                        fontWeight: '500',
                        borderRadius: 6,
                        borderColor: '#C0C0C0',
                        backgroundColor: '#E4E4E450',
                      }}
                      value={privateKey}
                      onChangeText={setPrivateKey}
                    />
                  </Input>

                  {/*<Textarea*/}
                  {/*  size='md'*/}
                  {/*  isReadOnly={false}*/}
                  {/*  isInvalid={false}*/}
                  {/*  isDisabled={false}*/}
                  {/*  w='$64'>*/}
                  {/*  <TextareaInput*/}
                  {/*    placeholder='Your text goes here...'*/}
                  {/*    value={privateKey}*/}
                  {/*    onChangeText={setPrivateKey}*/}
                  {/*  />*/}
                  {/*</Textarea>*/}
                </FormControl>

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
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      </Box>
    );
  },
);

export default ImportShopPrivateKey;
