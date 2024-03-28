import { getSecureValue } from './secure.store';
import {
  Client,
  Context,
  LIVE_CONTRACTS,
  SupportedNetwork,
} from 'dms-sdk-client';
import '@ethersproject/shims';
import { Wallet } from 'ethers';

export async function getClient(screen = 'unknown') {
  const DMS_SDK_LINK = {
    development: SupportedNetwork.LOYALTY_TESTNET,
    preview: SupportedNetwork.LOYALTY_TESTNET,
    product: SupportedNetwork.LOYALTY_MAINNET,
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
  function createClient(privateKey) {
    const ctx = new Context({
      network: LIVE_CONTRACTS[sdkLink].network,
      signer: new Wallet(privateKey),
      web3Providers: LIVE_CONTRACTS[sdkLink].web3Endpoint,
      relayEndpoint: LIVE_CONTRACTS[sdkLink].relayEndpoint,
      graphqlNodes: [{ url: LIVE_CONTRACTS[sdkLink].graphqlEndpoint }],
      ledgerAddress: LIVE_CONTRACTS[sdkLink].LedgerAddress,
      tokenAddress: LIVE_CONTRACTS[sdkLink].LoyaltyTokenAddress,
      phoneLinkAddress: LIVE_CONTRACTS[sdkLink].PhoneLinkCollectionAddress,
      validatorAddress: LIVE_CONTRACTS[sdkLink].ValidatorAddress,
      currencyRateAddress: LIVE_CONTRACTS[sdkLink].CurrencyRateAddress,
      shopAddress: LIVE_CONTRACTS[sdkLink].ShopAddress,
      loyaltyProviderAddress: LIVE_CONTRACTS[sdkLink].LoyaltyProviderAddress,
      loyaltyConsumerAddress: LIVE_CONTRACTS[sdkLink].LoyaltyConsumerAddress,
      loyaltyExchangerAddress: LIVE_CONTRACTS[sdkLink].LoyaltyExchangerAddress,
      loyaltyTransferAddress: LIVE_CONTRACTS[sdkLink].LoyaltyTransferAddress,
      loyaltyBridgeAddress: LIVE_CONTRACTS[sdkLink].LoyaltyBridgeAddress,
    });
    console.log('web3Endpoint :', LIVE_CONTRACTS[sdkLink].web3Endpoint,)
    console.log('network :', LIVE_CONTRACTS[sdkLink].network,)
    console.log('LoyaltyTokenAddress :', LIVE_CONTRACTS[sdkLink].LoyaltyTokenAddress,)
    return new Client(ctx);
  }
  const client = createClient(pKey);
  console.log('client :', client)
  return { client, address };
}
