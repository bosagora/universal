import { makeAutoObservable } from 'mobx';
import { getClient } from '../utils/client';
class LoyaltyStore {
  boa = {};
  kios = {};
  payment = {};
  tmpPayment = {};
  lastUpdateTime = 1608854400;

  shopData = {};
  balanceData = {};

  constructor() {
    makeAutoObservable(this);
  }
  reset() {
    this.boa = {};
    this.kios = {};
    this.tmpPayment = {};
    this.payment = {};
    this.shopData = {};
    this.balanceData = {};

    this.lastUpdateTime = 1608854400;
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
  setTmpPayment = (payment) => {
    this.tmpPayment = payment;
  };

  setLastUpdateTime = (time) => {
    this.lastUpdateTime = time;
  };
  setShopData = (data) => {
    this.shopData = data;
  };
  setBalanceData = (data) => {
    this.balanceData = data;
  };
}

export default LoyaltyStore;
