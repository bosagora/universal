import { Platform } from 'react-native';
import { MobileType } from 'acc-sdk-client-v2';

export async function registerPushTokenWithClient(cc, userStore, appKind) {
  if (
    userStore.expoPushToken === '' ||
    userStore.enableNotification === false
  ) {
    userStore.setRegisteredPushToken(false);
    return false;
  }
  // alert(
  //   'registerPushTokenWithClient > userStore : ' + JSON.stringify(userStore),
  // );
  const token = userStore.expoPushToken;
  // alert('expo token :' + token);
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
    // await Clipboard.setStringAsync(JSON.stringify(e));
    alert('register push ' + JSON.stringify(e.message));
    console.log('error : ', e);
    return false;
  }
}
