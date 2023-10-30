import { makeAutoObservable } from 'mobx';

class LoyaltyStore {
  boa = {};
  kios = {};
  payment = {};

  lastUpdateTime = 1608854400;

  constructor() {
    makeAutoObservable(this);
  }

  setBoa = (boa) => {
    this.boa = boa;
  };

  setKios = (kios) => {
    this.kios = kios;
  };

  setPayment = (payment) => {
    this.payment = payment;
  };

  setLastUpdateTime = (time) => {
    this.lastUpdateTime = time;
  };
}

export default LoyaltyStore;
