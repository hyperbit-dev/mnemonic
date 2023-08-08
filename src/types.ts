import { MainNet, TestNet, RegTest, SimNet } from '@hyperbitjs/chains';

export type Language =
  | 'chinese_simplified'
  | 'english'
  | 'japanese'
  | 'spanish'
  | 'italian'
  | 'french'
  | 'korean'
  | 'czech'
  | 'portuguese'
  | 'chinese_traditional';

export type Options = {
  /**
   * Set of strings that will generate private and public keys for wallet/address.
   * @example
   * // seed sock milk update focus rotate barely fade car face mechanic mercy
   */
  mnemonic?: string;
  /**
   * Network object cotaining information about the blockchain. See [@hyperbitjs/chains](https://github.com/hyperbit-dev/chains).
   * @example
   * import { btc } from '@hyperbitjs/chains';
   * new Mnemonic({network: btc.mainnet});
   */
  network?: MainNet | TestNet | RegTest | SimNet;
  /**
   * Additional word/string to securely your mnemonic string.
   */
  passphrase?: string;
  /**
   * Language word list used to generate mnemonic string.
   */
  language?: Language;
  /**
   * https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#account
   * Default = 0 for discoverying all wallet addresses starting from the root.
   */
  account?: number;
};

export type ToSeedOptions = {
  mnemonic?: string;
  passphrase?: string;
};

export type GenerateAddresses = {
  count?: number;
  index?: number;
  account?: number;
};

export type GenerateAddressSet = {
  external: Address;
  change: Address;
};

export type Address = {
  privateKey: string;
  address: string;
  path: string;
  wif: string;
};
