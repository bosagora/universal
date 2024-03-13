import { styled } from '@gluestack-style/react';
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  View,
  Divider,
  Button,
  ButtonText,
  Pressable,
  Modal,
  ModalBackdrop,
  ModalContent,
  ModalBody,
  ButtonGroup,
} from '@gluestack-ui/themed';
export const WrapButton = styled(Button, {
  h: 53,
  px: '$3',
  py: '$2.5',
  rounded: '$lg',
  bg: '#5C66D5',
  variants: {
    variant: {
      wallet: { bg: 'black' },
    },
  },
});
export const WrapWhiteButton = styled(Button, {
  h: 53,
  px: '$3',
  py: '$2.5',
  borderWidth: '$1',
  borderColor: '#8A8A8A',
  bg: '#FFF',
  variants: {
    variant: {
      wallet: { bg: 'black' },
    },
  },
});

export const WrapHistoryButton = styled(Button, {
  borderWidth: '$1',
  borderColor: '#C0C0C030',
  bg: '#E4E4E450',
});
