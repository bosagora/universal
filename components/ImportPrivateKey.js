import React, { useState } from 'react';
import {
  ButtonText,
  Center,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  HStack,
  Input,
  InputField,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  VStack,
  Text,
  Button,
  Switch,
  Textarea,
  TextareaInput,
  FormControlHelper,
  FormControlHelperText,
  ButtonGroup,
  Box,
} from '@gluestack-ui/themed';

const ImportPrivateKey = ({ saveKey }) => {
  const [privateKey, setPrivateKey] = useState('');
  const [showModal, setShowModal] = useState(false);
  return (
    <Box>
      <Button
        py='$2.5'
        px='$3'
        onPress={() => {
          setShowModal(true);
        }}>
        <ButtonText>다른 지갑 불러오기</ButtonText>
      </Button>
      <Modal
        avoidKeyboard={true}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}>
        <ModalBackdrop />
        <ModalContent maxWidth='$96'>
          <ModalBody p='$5'>
            <VStack space='xs' mb='$4'>
              <Heading>지갑 가져오기</Heading>
              <Text size='sm'>
                사용하던 기기에서 복사한 비공개 키를 아래 빈 칸에 입력해주세요.
                사용하시던 지갑을 이 기기에서도 그대로 사용이 가능합니다.
              </Text>
            </VStack>
            <VStack py='$2' space='xl'>
              <FormControl>
                <FormControlHelper>
                  <FormControlHelperText>
                    여기에 비공개 키 문자열을 붙여넣으세요.
                  </FormControlHelperText>
                </FormControlHelper>

                <Input>
                  <InputField value={privateKey} onChangeText={setPrivateKey} />
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
                  No
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
                  Yes
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
