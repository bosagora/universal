import { getSecureValue } from './secure.store';
import { LIVE_CONTRACTS, SupportedNetwork } from 'acc-sdk-client-v2';
import '@ethersproject/shims';
import { Wallet } from '@ethersproject/wallet';
global.XMLHttpRequest = require('xhr2');

import {
  Client,
  Context,
  ContextBuilder,
  ContextParams,
} from 'acc-sdk-client-v2';
export async function getClient(screen = 'unknown') {
  async function fetchKey() {
    let pKey = await getSecureValue('privateKey');
    if (pKey.includes('0x')) {
      // pKey = pKey.split('0x')[1];
      console.log(screen, ' client pKey :', pKey);
    }
    const address = await getSecureValue('address');

    return { pKey, address };
  }
  const { pKey, address } = await fetchKey();
  async function createClient(privateKey) {
    console.log('createClient > env network :', process.env.EXPO_PUBLIC_ENV);
    try {
      const contextParams =
        process.env.EXPO_PUBLIC_ENV === 'development' ||
        process.env.EXPO_PUBLIC_ENV === 'preview'
          ? ContextBuilder.buildContextParamsOfDevnet(privateKey)
          : process.env.EXPO_PUBLIC_ENV === 'test'
          ? ContextBuilder.buildContextParamsOfTestnet(privateKey)
          : ContextBuilder.buildContextParamsOfMainnet(privateKey);
      console.log(JSON.stringify(contextParams));

      const context =
        process.env.EXPO_PUBLIC_ENV === 'development' ||
        process.env.EXPO_PUBLIC_ENV === 'preview'
          ? ContextBuilder.buildContextOfDevnet(privateKey)
          : process.env.EXPO_PUBLIC_ENV === 'test'
          ? ContextBuilder.buildContextOfTestnet(privateKey)
          : ContextBuilder.buildContextOfMainnet(privateKey);

      const client = new Client(context);

      return client;
    } catch (e) {
      console.log('c e :', e);
    }
  }
  const client = await createClient(pKey);
  console.log('Client > client :', client);
  console.log('Client > address :', address);
  return { client, address };
}
