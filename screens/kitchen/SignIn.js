import {
  Input,
  InputField,
  Button,
  Heading,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControl,
  ButtonText,
  FormControlError,
  FormControlLabelText,
  FormControlLabel,
  AlertCircleIcon,
  useToast,
  Toast,
  ToastTitle,
  VStack,
  Box,
  InputIcon,
  InputSlot,
  EyeIcon,
  EyeOffIcon,
} from '@gluestack-ui/themed';
import { SafeAreaView } from 'react-native';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { useState } from 'react';
import { config } from '@gluestack-ui/config';

const registerSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character',
    )
    .required('Password is required'),
});

const registerInitialValues = {
  email: '',
  password: '',
};
export default function SignIn() {
  const toast = useToast();
  const formik = useFormik({
    initialValues: registerInitialValues,
    validationSchema: registerSchema,

    onSubmit: (values, { resetForm }) => {
      toast.show({
        placement: 'bottom right',
        render: ({ id }) => {
          return (
            <Toast nativeID={id} variant='accent' action='success'>
              <ToastTitle>Signed in successfully</ToastTitle>
            </Toast>
          );
        },
      });
      resetForm();
    },
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };
  return (
    <SafeAreaView>
      <Box
        sx={{
          _dark: { bg: '$backgroundDark800' },
          _web: {
            height: '100vh',
            w: '100vw',
            overflow: 'hidden',
          },
        }}
        height='$full'
        bg='$backgroundLight0'>
        <Box
          p='$4'
          flex={1}
          maxWidth='$96'
          alignSelf='center'
          justifyContent='center'
          w='$full'>
          <Heading mb='$4'>Sign in form using formik -:</Heading>
          <VStack>
            <FormControl
              size='md'
              isRequired={true}
              isInvalid={!!formik.errors.email}>
              <FormControlLabel>
                <FormControlLabelText>Email</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  type='text'
                  placeholder='email'
                  onChangeText={formik.handleChange('email')}
                  onBlur={formik.handleBlur('email')}
                  value={formik.values?.email}
                />
              </Input>

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {formik?.errors?.email}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>
            <FormControl
              size='md'
              isRequired={true}
              my='$4'
              isInvalid={!!formik.errors.password}>
              <FormControlLabel>
                <FormControlLabelText>Password</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder='password'
                  onChangeText={formik.handleChange('password')}
                  onBlur={formik.handleBlur('password')}
                  value={formik.values?.password}
                  type={showPassword ? 'text' : 'password'}
                />
                <InputSlot onPress={handleState} pr='$3'>
                  <InputIcon as={showPassword ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>

              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>
                  {formik?.errors?.password}
                </FormControlErrorText>
              </FormControlError>
            </FormControl>

            <Button onPress={formik.handleSubmit} my='$4'>
              <ButtonText>Sign in</ButtonText>
            </Button>
          </VStack>
        </Box>
      </Box>
    </SafeAreaView>
  );
}
