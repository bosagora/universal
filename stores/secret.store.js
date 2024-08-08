import { makeAutoObservable } from 'mobx';
import { getClient } from '../utils/client';

class SecretStore {
  pKey = '';
  address = '';
  mnemonic = '';
  client = null;
  network = 'testnet';

  showQRSheet = false;
  showTermSheet = false;
  showPrivacySheet = false;

  constructor() {
    makeAutoObservable(this);
    console.log('secret store > constructor > network :', this.network);
    // getClient('store', this.network).then((it) => {
    //   this.client = it.client;
    //   this.address = it.address;
    // });
  }
  reset() {
    this.pKey = '';
    this.address = '';
    this.mnemonic = '';
    this.client = null;
    this.network = 'testnet';

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
  setClient = async () => {
    console.log('secret store > setClient > network :', this.network);
    const it = await getClient('store', this.network);
    this.client = it.client;
    this.address = it.address;
  };
  setMnemonic = (mnemonic) => {
    this.mnemonic = mnemonic;
  };
  setNetwork = (network) => {
    this.network = network;
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
