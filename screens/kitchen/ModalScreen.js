import React from 'react';
import {
  ButtonText,
  Center,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  VStack,
  Modal,
  ModalFooter,
  ModalBody,
  Heading,
  ModalCloseButton,
  CloseIcon,
  Icon,
  Text,
  Button,
} from '@gluestack-ui/themed';

export default function ModalScreen() {
  const [showModal, setShowModal] = React.useState(false);
  const [size, setSize] = React.useState(undefined);
  const sizes = ['xs', 'sm', 'md', 'lg', 'full'];
  const ref = React.useRef(null);
  const handleClick = (currentSize) => {
    setShowModal(true);
    setSize(currentSize);
  };
  return (
    <Center h={400}>
      <VStack space='md'>
        {sizes.map((currentSize) => {
          return (
            <Button key={currentSize} onPress={() => handleClick(currentSize)}>
              <ButtonText>{currentSize}</ButtonText>
            </Button>
          );
        })}
      </VStack>
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
        }}
        size={size}
        finalFocusRef={ref}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Heading size='lg'>Delete Folder</Heading>
            <ModalCloseButton>
              <Icon as={CloseIcon} />
            </ModalCloseButton>
          </ModalHeader>
          <ModalBody>
            <Text size='sm'>
              Whoa, slow down there! This modal is like a red light at an
              intersection, reminding you to stop and think before you proceed.
              Is deleting this folder the right choice?
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant='outline'
              size='sm'
              action='secondary'
              mr='$3'
              onPress={() => {
                setShowModal(false);
              }}>
              <ButtonText>Cancel</ButtonText>
            </Button>
            <Button
              size='sm'
              action='primary'
              borderWidth='$0'
              onPress={() => {
                setShowModal(false);
              }}
              sx={{
                bg: '$error700',
                ':hover': {
                  bg: '$error800',
                },
                ':active': {
                  bg: '$error900',
                },
              }}>
              <ButtonText>Explore</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Center>
  );
}
