import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  AppState,
  Button,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';

import DetailsScreen from '../screens/kitchen/Detail';
import Kitchen from '../screens/kitchen/Kitchen';
import SignIn from '../screens/kitchen/SignIn';
import Test from '../screens/kitchen/Test';
import About from '../screens/kitchen/About';
import ActionSheetScreen from '../screens/kitchen/ActionSheet';
import LocalNotification from '../screens/kitchen/LocalNotification';
import BiometricAuthScreen from '../screens/kitchen/BiometricAuthScreen';
import HandelAuthentication from '../screens/kitchen/HandelAuthentication';
import ModalScreen from '../screens/kitchen/ModalScreen';
import PinCodeScreen from '../screens/PinCodeScreen';
import Term from '../screens/initScreens/Term';
import ShopReg from '../screens/initScreens/ShopReg';
import Secret from '../screens/initScreens/Secret';
import { AUTH_STATE } from '../stores/user.store';
import InitPinCodeScreen from '../screens/initScreens/InitPinCodeScreen';
import Temp from '../screens/Temp';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { config } from '../gluestack-style.config.js';
import { useStores, StoreProvider, trunk } from '../stores';

import { observer } from 'mobx-react';
import QRActionSheet from '../screens/QRActionSheet';
import Configuration from '../screens/configuration';
import WalletManager from '../screens/configuration/WalletManager';
import { navigationRef } from '../utils/root.navigation';
import Wallet from '../screens/wallet';
import MileageProvideHistory from '../screens/wallet/MileageProvideHistory';
import MileageCancelNotification from '../screens/wallet/MileageCancelNotification';
import 'react-native-url-polyfill/auto';
import { usePushNotification } from '../hooks/usePushNotification';
import Permissions from '../screens/initScreens/Permissions';

import ko from '../langs/ko.json';
import en from '../langs/en.json';

import * as I18N from 'i18next';
import { useTranslation, initReactI18next } from 'react-i18next';
import ModalActivityIndicator from 'react-native-modal-activityindicator';
import MileageAdjustmentHistory from '../screens/wallet/MileageAdjustmentHistory';
import TermActionSheet from '../screens/TermActionSheet';
import PrivacyActionSheet from '../screens/PrivacyActionSheet';
import { getLocales } from 'expo-localization';
import * as Updates from 'expo-updates';
import * as Device from 'expo-device';
import ShopNotification from '../screens/wallet/ShopNotification';
import * as SystemUI from 'expo-system-ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getName } from '../utils/convert';
import UserWallet from '../screens/wallet/UserWallet';
import MileageHistory from '../screens/wallet/MileageHistory';
import MileageRedeemNotification from '../screens/wallet/MileageRedeemNotification';
import PhoneAuth from '../screens/initScreens/PhoneAuth';
import { useFonts } from 'expo-font';
import { SplashScreen } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import RootPaddingBox from '../components/RootPaddingBox';
import { LinearGradient } from 'expo-linear-gradient';
import DepositHistory from '../screens/wallet/DepositHistory';
import PointAgentHistory from '../screens/wallet/PointAgentHistory';
import Deposit from '../screens/wallet/Deposit';
import Transfer from '../screens/wallet/Transfer';
import TransferMainChainHistory from '../screens/wallet/TransferMainChainHistory';
import { RobotoSemiBoldText } from '../components/styled/text';
import UpdateActionSheet from '../screens/UpdateActionSheet';
import secretStore from '../stores/secret.store';
import Network from '../screens/initScreens/Network';

const InitStack = createNativeStackNavigator();
const MainStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const routeNameRef = React.createRef();
// Text 적용
Text.defaultProps = Text.defaultProps || {};
Text.defaultProps.allowFontScaling = false;

// TextInput 적용
TextInput.defaultProps = TextInput.defaultProps || {};
TextInput.defaultProps.allowFontScaling = false;

I18N.use(initReactI18next) // passes i18n down to react-i18next
  .init({
    compatibilityJSON: 'v3',
    resources: {
      en: {
        translation: {
          ...en,
          'app.name': getName(
            'en',
            'appName',
            process.env.EXPO_PUBLIC_TOKEN_NAME,
          ),
        },
      },
      ko: {
        translation: {
          ...ko,
          'app.name': getName(
            'ko',
            'appName',
            process.env.EXPO_PUBLIC_TOKEN_NAME,
          ),
        },
      },
    },
    lng: 'en', // if you're using a language detector, do not define the lng option
    fallbackLng: 'en',

    interpolation: {
      escapeValue: false, // react already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
    },
  });

// SplashScreen.preventAutoHideAsync();
global.Buffer = require('buffer').Buffer;

const App = observer(() => {
  const [isStoreLoaded, setIsStoreLoaded] = useState(false);
  const { pinStore, userStore, loyaltyStore, secretStore } = useStores();
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = useState(appState.current);
  const { i18n } = useTranslation();

  usePushNotification(userStore, loyaltyStore, pinStore);
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(userStore.backgroundColor);
    const rehydrate = async () => {
      await trunk.init();
      setIsStoreLoaded(true);

      userStore.setLoading(false);

      if (userStore.currency !== process.env.EXPO_PUBLIC_CURRENCY) {
        console.log('init locale');
        const deviceLocales = getLocales()[0];
        console.log('deviceLocales :', deviceLocales);

        // userStore.setCurrency(deviceLocales.currencyCode);
        userStore.setCurrency(process.env.EXPO_PUBLIC_CURRENCY);
        userStore.setLang(deviceLocales.languageCode);
        userStore.setCountry(deviceLocales.regionCode);
        userStore.setLangTag(deviceLocales.languageTag);
        userStore.setCountryPhoneCode(
          deviceLocales.regionCode == 'KR'
            ? '82'
            : deviceLocales.regionCode == 'PH'
            ? '63'
            : '',
        );
        i18n
          .changeLanguage(deviceLocales.languageCode, afterChangeLang)
          .then(() => {})
          .catch((error) => {
            console.log(error);
          });
      } else {
        console.log('userStore.lang :', userStore.lang);
        i18n
          .changeLanguage(userStore.lang, afterChangeLang)
          .then()
          .catch((error) => {
            console.log(error);
          });
      }
    };
    // async function onFetchUpdateAsync() {
    //   try {
    //     const update = await Updates.checkForUpdateAsync();
    //
    //     if (update.isAvailable) {
    //       await Updates.fetchUpdateAsync();
    //       await Updates.reloadAsync();
    //     }
    //   } catch (error) {
    //     // You can also add an alert() to see the error message in case of an error when fetching updates.
    //     alert(`Error fetching latest Expo update: ${error}`);
    //   }
    // }
    // if (Device.isDevice) onFetchUpdateAsync();
    //
    rehydrate();
  }, [userStore.currency]);
  function afterChangeLang(it) {
    console.log('afterChangeLang:', it);
    i18n
      .changeLanguage(userStore.lang)
      .then()
      .catch((error) => {
        console.log(error);
      });
  }
  let init = false;
  useEffect(() => {
    // 앱 초기 등록 화면이 아니고
    // 핀 코드 화면이 활성 상태 이고
    const initPincode = async () => {
      if (userStore.state === 'DONE' && init === false) {
        init = true;
        // pinStore.setNextScreen('Wallet');
        pinStore.setSuccessEnter(false);
        pinStore.setVisible(true);
        pinStore.setUseFooter(false);
        console.log('user state > visible:', pinStore.visible);
      }
    };
    initPincode();
  }, [userStore.state]);

  useEffect(() => {
    const focusEvent = 'change';
    const subscription = AppState.addEventListener(
      focusEvent,
      (nextAppState) => {
        console.log('Before AppState', appState.current);
        const screen = getCurrentRouteName();
        console.log('getCurrentRouteName :', screen);
        if (
          appState.current &&
          appState.current.match(/background/) &&
          nextAppState === 'active'
        ) {
          console.log(
            'App has come to the foreground! > backgroundAt :',
            pinStore.backgrounAt,
          );
          secretStore.setShowQRSheet(false);
          pinStore.setBackground(false);
          const time = Math.round(+new Date() / 1000);
          console.log('now :', time);

          const diff = time - pinStore.backgrounAt;

          if (userStore.state === 'DONE' && diff > 10) {
            if (
              pinStore.nextScreen !== 'MileageCancelNotification' &&
              pinStore.nextScreen !== 'ShopNotification'
            ) {
              // alert('go wallet');
              pinStore.setNextScreen('Wallet');
            }
            pinStore.setSuccessEnter(false);
            pinStore.setVisible(true);
            pinStore.setUseFooter(false);
          }
        }
        if (
          appState.current &&
          appState.current.match(/active/) &&
          nextAppState === 'background'
        ) {
          console.log('App has come to the background!');

          const time = Math.round(+new Date() / 1000);
          pinStore.setBackgroundAt(time);
        }
        pinStore.setBackground(true);
        secretStore.setShowQRSheet(false);
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log('After AppState', appState.current);
      },
    );
    onLayoutRootView();
    return () => {
      subscription.remove();
    };
  }, []);

  const [fontsLoaded, fontError] = useFonts({
    'AppleSDGothic-NeoH': require('../assets/fonts/AppleSDGothic/AppleSDGothicNeoH.ttf'),
    'AppleSDGothic-NeoB': require('../assets/fonts/AppleSDGothic/AppleSDGothicNeoB.ttf'),
    'AppleSDGothic-NeoEB': require('../assets/fonts/AppleSDGothic/AppleSDGothicNeoEB.ttf'),
    'AppleSDGothic-NeoSB': require('../assets/fonts/AppleSDGothic/AppleSDGothicNeoSB.ttf'),
    'Roboto-Bold': require('../assets/fonts/Roboto/Roboto-Bold.ttf'),
    'Roboto-Medium': require('../assets/fonts/Roboto/Roboto-Medium.ttf'),
    'Roboto-Regular': require('../assets/fonts/Roboto/Roboto-Regular.ttf'),
    'Roboto-SemiBold': require('../assets/fonts/Roboto/roboto-semibold-webfont.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // if (!fontsLoaded && !fontError) {
  //   return null;
  // }

  if (!isStoreLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size='large' />
      </View>
    );
  } else {
    // userStore.setLoading(false);

    return (
      <>
        <RootPaddingBox></RootPaddingBox>
        <BottomSheetModalProvider>
          <NavigationContainer
            independent={true}
            ref={navigationRef}
            onReady={() =>
              (routeNameRef.current =
                navigationRef.current.getCurrentRoute().name)
            }
            onStateChange={() => {
              const previousRouteName = routeNameRef.current;
              const currentRouteName =
                navigationRef.current.getCurrentRoute().name;

              userStore.setCurrentRoute(currentRouteName);
              if (previousRouteName !== currentRouteName) {
                // Do something here with it
              }
              console.log('current RouteName :', currentRouteName);
              if (currentRouteName === 'Wallet') {
                if (process.env.EXPO_PUBLIC_APP_KIND === 'shop')
                  userStore.setContentColor('#F3F3F4');
                else userStore.setContentColor('#12121D');
              } else {
                userStore.setContentColor('white');
              }

              // Save the current route name for later comparision
              routeNameRef.current = currentRouteName;
            }}>
            <GluestackUIProvider config={config} colorMode='light'>
              {userStore.state !== AUTH_STATE.DONE ? (
                <InitStackScreen />
              ) : (
                <MainStackScreen userStore={userStore} />
              )}

              <QRActionSheet />
              <UpdateActionSheet />
              <TermActionSheet />
              <PrivacyActionSheet />
              <ShopNotification />
              <MileageCancelNotification />
              <MileageRedeemNotification />
            </GluestackUIProvider>
          </NavigationContainer>
          <PinCodeScreen />
          <View
            style={{
              flex: 1,
              backgroundColor: '#00000044',
              zIndex: userStore.loading ? 999999 : -99999,
              position: 'absolute',
              left: 0,
              top: 0,
              width: userStore.loading ? '100%' : 0,
              height: userStore.loading ? '120%' : 0,
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ActivityIndicator size={'large'} color={'white'} />
            </View>
          </View>
        </BottomSheetModalProvider>
      </>
    );
  }
});

function InitStackScreen() {
  return (
    <InitStack.Navigator>
      <InitStack.Screen
        name='Permissions'
        component={Permissions}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='Term'
        component={Term}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='Secret'
        component={Secret}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='Network'
        component={Network}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='InitPinCodeScreen'
        component={InitPinCodeScreen}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='ShopReg'
        component={ShopReg}
        options={{ headerShown: false }}
      />
      <InitStack.Screen
        name='PhoneAuth'
        component={PhoneAuth}
        options={{ headerShown: false }}
      />
    </InitStack.Navigator>
  );
}

function MainStackScreen(userStore) {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerTintColor: 'black',
        headerStyle: { backgroundColor: userStore.contentColor },
      }}>
      <MainStack.Group>
        <MainStack.Screen
          name='TabScreens'
          component={TabScreens}
          options={{ headerShown: false, title: 'back' }}
        />
        <MainStack.Screen
          name='Temp'
          component={Temp}
          options={{ headerShown: false }}
        />
        <MainStack.Screen
          name='WalletManager'
          component={WalletManager}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen name='QRActionSheet' component={QRActionSheet} />
        <MainStack.Screen
          name='PointAgentHistory'
          component={PointAgentHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='DepositHistory'
          component={DepositHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='Deposit'
          component={Deposit}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='Transfer'
          component={Transfer}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='MileageHistory'
          component={MileageHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='TransferMainChainHistory'
          component={TransferMainChainHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='MileageProvideHistory'
          component={MileageProvideHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='MileageAdjustmentHistory'
          component={MileageAdjustmentHistory}
          options={{
            title: '',
          }}
        />
        <MainStack.Screen
          name='LocalNotification'
          component={LocalNotification}
        />
        <MainStack.Screen name='Detail' component={DetailsScreen} />
        <MainStack.Screen
          name='ActionSheetScreen'
          component={ActionSheetScreen}
        />
        <MainStack.Screen name='About' component={About} />
        <MainStack.Screen name='Test' component={Test} />
        <MainStack.Screen name='SignIn' component={SignIn} />
        <MainStack.Screen name='ModalScreen' component={ModalScreen} />
        <MainStack.Screen
          name='HandelAuthentication'
          component={HandelAuthentication}
        />
        <MainStack.Screen
          name='BiometricAuthScreen'
          component={BiometricAuthScreen}
        />
      </MainStack.Group>
      {/*<MainStack.Group screenOptions={{ presentation: 'modal' }}>*/}
      {/*  <MainStack.Screen*/}
      {/*    name='ShopNotification'*/}
      {/*    component={ShopNotification}*/}
      {/*    options={{*/}
      {/*      title: '',*/}
      {/*      headerStyle: {*/}
      {/*        backgroundColor: '#1f2937',*/}
      {/*      },*/}
      {/*      headerTintColor: '#fff',*/}
      {/*    }}*/}
      {/*  />*/}
      {/*</MainStack.Group>*/}
    </MainStack.Navigator>
  );
}

const TabScreens = observer(() => {
  const { secretStore } = useStores();
  function SearchScreen() {
    return <Text>Search</Text>;
  }

  function NotificationScreen() {
    return <Text>Notification</Text>;
  }

  function MessageScreen({ navigation }) {
    return (
      <View>
        <Button
          title='Go to Details... again'
          onPress={() => navigation.navigate('Detail')}
        />
      </View>
    );
  }
  const handleQRSheet = () => {
    secretStore.setShowQRSheet(!secretStore.showQRSheet);
  };
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      initialRouteName='Wallet'
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 80,
          backgroundColor: '#fff',
          paddingTop: 10,
          paddingBottom: 15,
          borderTopWidth: 0,
          borderBottomWidth: 0,
        },
        tabBarItemStyle: {
          margin: 2,
          borderRadius: 10,
        },
        tabBarLabelStyle: {
          margin: 3,
          color: 'pink',
        },
        position: 'absolute',
        tabBarBackground: () => (
          <View style={{ flex: 1 }}>
            <LinearGradient
              start={{ x: 0.0, y: 0.5 }}
              end={{ x: 0, y: 1 }}
              style={{
                height: 3,
                // borderTopLeftRadius: 15,
                // borderTopRightRadius: 15,
              }}
              colors={['#1C1B1F20', '#FFFFFF']}
            />
          </View>
        ),
      }}>
      <Tab.Screen
        name='Wallet'
        component={
          // process.env.EXPO_PUBLIC_APP_KIND === 'shop' ? Wallet : UserWallet
          UserWallet
        }
        options={{
          title: 'wallet',
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={
                focused
                  ? {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 13,
                      color: '#5C66D5',
                    }
                  : {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 13,
                      color: '#8A8A8A',
                    }
              }>
              wallet
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name='account-balance-wallet'
              size={25}
              color={focused ? '#5C66D5' : '#707070'}
            />
          ),
        }}
      />

      <Tab.Screen
        name='Message'
        component={MessageScreen}
        options={{
          title: 'QR',
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={
                focused
                  ? {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 12,
                      color: '#5C66D5',
                    }
                  : {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 12,
                      color: '#8A8A8A',
                    }
              }>
              QR
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name='qr-code'
              size={25}
              color={focused ? '#5C66D5' : '#707070'}
            />
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} onPress={() => handleQRSheet()} />
          ),
        }}
      />
      <Tab.Screen
        name='Configuration'
        component={Configuration}
        options={{
          title: 'settings',
          tabBarLabel: ({ color, focused }) => (
            <Text
              style={
                focused
                  ? {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 12,
                      color: '#5C66D5',
                    }
                  : {
                      fontFamily: 'Roboto-Regular',
                      fontWeight: 400,
                      lineHeight: 18,
                      fontSize: 12,
                      color: '#8A8A8A',
                    }
              }>
              settings
            </Text>
          ),
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialIcons
              name='settings'
              size={25}
              color={focused ? '#5C66D5' : '#707070'}
            />
          ),
        }}
      />
      {/*<Tab.Screen*/}
      {/*  name='Kitchen'*/}
      {/*  component={Kitchen}*/}
      {/*  options={{*/}
      {/*    title: '홈',*/}
      {/*    tabBarIcon: ({ color, size, focused }) => (*/}
      {/*      <MaterialIcons*/}
      {/*        name='kitchen'*/}
      {/*        size={focused ? 34 : 24}*/}
      {/*        color={focused ? '#4ade80' : 'white'}*/}
      {/*      />*/}
      {/*    ),*/}
      {/*  }}*/}
      {/*/>*/}
    </Tab.Navigator>
  );
});
export function getCurrentRouteName(action) {
  return routeNameRef;
}
export default App;
