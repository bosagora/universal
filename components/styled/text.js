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

export const BaseText = styled(Text, {
  color: 'black',
  variants: {
    variant: {
      wallet: { color: 'white' },
    },
  },
});

export const HeaderText = styled(BaseText, {
  fontFamily: 'Roboto-Medium',
  fontWeight: 500,
  lineHeight: 28,
  fontSize: 25,
});

export const Header2Text = styled(BaseText, {
  fontFamily: 'Roboto-Medium',
  fontWeight: 500,
  lineHeight: 24,
  fontSize: 16,
});

export const SubHeaderText = styled(BaseText, {
  fontFamily: 'Roboto-Medium',
  fontWeight: 400,
  lineHeight: 20,
  fontSize: 14,
  color: '#707070',
});

export const ParaText = styled(BaseText, {
  fontFamily: 'Roboto-Regular',
  fontWeight: 400,
  lineHeight: 18,
  fontSize: 13,
  color: '#8A8A8A',
});

export const Para2Text = styled(BaseText, {
  fontFamily: 'Roboto-Regular',
  fontWeight: 400,
  lineHeight: 18,
  fontSize: 13,
  color: '#555555',
});
export const Para3Text = styled(BaseText, {
  fontFamily: 'Roboto-Regular',
  fontWeight: 500,
  lineHeight: 16,
  fontSize: 15,
  color: '#8A8A8A',
});

export const ActiveButtonText = styled(ButtonText, {
  fontFamily: 'Roboto-Bold',
  fontWeight: 600,
  lineHeight: 25,
  fontSize: 17,
  color: 'white',
});
export const ActiveWhiteButtonText = styled(ButtonText, {
  fontFamily: 'Roboto-Bold',
  fontWeight: 600,
  lineHeight: 25,
  fontSize: 17,
  color: '#555555',
});

export const PinButtonText = styled(ButtonText, {
  fontFamily: 'Roboto-Regular',
  fontWeight: 400,
  lineHeight: 28,
  fontSize: 32,
  color: 'white',
});

export const NumberText = styled(ButtonText, {
  fontFamily: 'Roboto-SemiBold',
  fontWeight: 600,
  lineHeight: 25,
  fontSize: 18,
  color: '#12121D',
});
