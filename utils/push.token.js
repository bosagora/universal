import { Platform } from 'react-native';
import { MobileType } from 'dms-sdk-client';

export async function registerPushTokenWithClient(cc, userStore, appKind) {
  if (
    userStore.expoPushToken === '' ||
    userStore.enableNotification === false
  ) {
    userStore.setRegisteredPushToken(false);
    return false;
  }

  const token = userStore.expoPushToken;
  const language = userStore.lang.toLowerCase();
  const os = Platform.OS === 'android' ? 'android' : 'iOS';
  try {
    await cc.ledger.registerMobileToken(
      token,
      language,
      os,
      appKind === 'shop' ? MobileType.SHOP_APP : MobileType.USER_APP,
    );
    userStore.setRegisteredPushToken(true);
    return true;
  } catch (e) {
    await Clipboard.setStringAsync(JSON.stringify(e));
    console.log('error : ', e);
    return false;
  }
}
