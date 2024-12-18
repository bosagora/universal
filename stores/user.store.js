import { makeAutoObservable } from 'mobx';

export const AUTH_STATE = {
  INIT: 'INIT',
  PERMISSIONS: 'PERMISSIONS',
  TERM: 'TERM',
  PIN: 'PIN',
  SECRET: 'SECRET',
  PHONE: 'PHONE',
  DONE: 'DONE',
};

class UserStore {
  state = '';
  name = '';
  email = '';
  phone = '';
  countryPhoneCode = '';
  phoneFormatted = '';
  country = '';
  lang = '';
  langTag = '';
  currency = '';

  shopId = '00000';
  shopName = 'unknown';

  enableBio = false;
  enableNotification = false;
  registeredPushToken = false;

  permissionsCount = 0;
  expoPushToken = '';

  loading = false;
  walletInterval = 0;
  quickApproval = false;
  contentColor = '#ffffff';
  backgroundColor = '#ffffff';
  isDeposit = true;
  isMainChainTransfer = true;
  inUpdate = false;
  currentRoute = '';

  constructor(secureStore) {
    makeAutoObservable(this);
  }

  reset() {
    this.state = '';
    this.name = '';
    this.email = '';
    this.phone = '';
    this.countryPhoneCode = '';
    this.phoneFormatted = '';
    this.country = '';
    this.lang = '';
    this.langTag = '';
    this.currency = '';
    this.shopId = '00000';
    this.shopName = 'unknown';
    this.enableBio = false;
    this.enableNotification = false;
    this.registeredPushToken = false;
    this.permissionsCount = 0;
    this.expoPushToken = '';
    this.loading = false;
    this.walletInterval = 0;
    this.quickApproval = false;
    this.contentColor = '#ffffff';
    this.backgroundColor = '#ffffff';
    this.isDeposit = true;
    this.isMainChainTransfer = true;
    this.inUpdate = false;
    this.currentRoute = '';
  }

  setInUpdate = (update) => {
    this.inUpdate = update;
  };
  setAuthState = (state) => {
    this.state = state;
  };
  setUserName = (name) => {
    this.name = name;
  };

  setEmail = (email) => {
    this.email = email;
  };

  setPhone = (phone) => {
    this.phone = phone;
  };
  setCountryPhoneCode = (code) => {
    this.countryPhoneCode = code;
  };
  setCountry = (country) => {
    this.country = country;
  };

  setCurrency = (currency) => {
    this.currency = currency;
  };
  setLang = (lang) => {
    this.lang = lang;
  };
  setLangTag = (langTag) => {
    this.langTag = langTag;
  };
  setEnableBio = (enable) => {
    this.enableBio = enable;
  };
  setEnableNotification = (enable) => {
    this.enableNotification = enable;
  };
  setRegisteredPushToken = (enable) => {
    this.registeredPushToken = enable;
  };

  setPermissionsCount = () => {
    this.permissionsCount = this.permissionsCount + 1;
  };

  setExpoPushToken = (token) => {
    this.expoPushToken = token;
  };
  setLoading = (loading) => {
    this.loading = loading;
  };

  setShopId = (id) => {
    this.shopId = id;
  };

  setShopName = (name) => {
    this.shopName = name;
  };
  setWalletInterval = (intv) => {
    this.walletInterval = intv;
  };
  setQuickApproval = (appr) => {
    this.quickApproval = appr;
  };
  setPhoneFormatted = (pf) => {
    this.phoneFormatted = pf;
  };

  setContentColor = (color) => {
    this.contentColor = color;
  };
  setBackgroundColor = (color) => {
    this.backgroundColor = color;
  };

  setIsDeposit = (flag) => {
    this.isDeposit = flag;
  };
  setIsMainChainTransfer = (flag) => {
    this.isMainChainTransfer = flag;
  };
  setCurrentRoute = (route) => {
    this.currentRoute = route;
  };
}
export default UserStore;
