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
  px: 14,
  py: 129,
  rounded: '$lg',
  bg: '#5C66D5',
  variants: {
    variant: {
      wallet: { bg: 'black' },
    },
  },
});
