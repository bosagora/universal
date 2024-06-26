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
  const DMS_SDK_LINK = {
    development: SupportedNetwork.ACC_DEVNET,
    preview: SupportedNetwork.ACC_DEVNET,
    test: SupportedNetwork.ACC_TESTNET,
    product: SupportedNetwork.ACC_MAINNET,
  };

  const sdkLink =
    DMS_SDK_LINK[process.env.EXPO_PUBLIC_ENV || process.env.ENVIRONMENT];

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
    console.log('23423');
    try {
      const contextParams =
        ContextBuilder.buildContextParamsOfDevnet(privateKey);
      console.log(JSON.stringify(contextParams));

      const context = ContextBuilder.buildContextOfDevnet(privateKey);
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
