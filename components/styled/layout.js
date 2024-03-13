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
export const WrapBase = styled(Box, {
  flex: 1,
  h: '$full',
  px: 30,
  bg: 'white',
  variants: {
    variant: {
      wallet: { bg: 'black' },
    },
  },
});

export const WrapBox = styled(WrapBase, {
  pt: 100,
});
export const WrapDivider = styled(WrapBase, {
  flex: 'no',
  h: 1,
  mt: 10,
  mb: 10,
  bg: '#E4E4E4',
});
export const WrapBase2 = styled(Box, {
  h: '$full',
  px: 30,
  bg: 'white',
  variants: {
    variant: {
      wallet: { bg: 'black' },
    },
  },
});
