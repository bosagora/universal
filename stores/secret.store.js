import { makeAutoObservable } from 'mobx';
import { getClient } from '../utils/client';

class SecretStore {
  pKey = '';
  address = '';
  mnemonic = '';
  client = null;

  showQRSheet = false;
  showTermSheet = false;
  showPrivacySheet = false;

  constructor() {
    makeAutoObservable(this);
    getClient().then((it) => {
      this.client = it.client;
      this.address = it.address;
    });
  }
  reset() {
    this.pKey = '';
    this.address = '';
    this.mnemonic = '';

    this.showQRSheet = false;
    this.showTermSheet = false;
    this.showPrivacySheet = false;
  }
  setPKey = (key) => {
    this.pKey = key;
  };

  setAddress = (address) => {
    this.address = address;
  };
  setClient = (client) => {
    this.client = client;
  };
  setMnemonic = (mnemonic) => {
    this.mnemonic = mnemonic;
  };

  setShowQRSheet = (show) => {
    this.showQRSheet = show;
  };
  setShowTermSheet = (show) => {
    this.showTermSheet = show;
  };
  setShowPrivacySheet = (show) => {
    this.showPrivacySheet = show;
  };
}

export default SecretStore;
