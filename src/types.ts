import { MainNet, TestNet, RegTest, SimNet } from "@hyperbitjs/chains";
import CoinKey from "@hyperbitjs/coinkey";
import HDKey from "@hyperbitjs/hdkey";

export const languages: Record<Language, { name: string; label: string }> = {
  chinese_simplified: { name: "Chinese Simplified", label: "简体中文" },
  english: { name: "English", label: "English" },
  japanese: { name: "Japanese", label: "日本語" },
  spanish: { name: "Spanish", label: "Español" },
  italian: { name: "Italian", label: "Italiano" },
  french: { name: "French", label: "Français" },
  korean: { name: "Korean", label: "한국어" },
  czech: { name: "Czech", label: "Čeština" },
  portuguese: { name: "Portuguese", label: "Português" },
  chinese_traditional: { name: "Chinese Traditional", label: "繁體中文" },
};

export type Language =
  | "chinese_simplified"
  | "english"
  | "japanese"
  | "spanish"
  | "italian"
  | "french"
  | "korean"
  | "czech"
  | "portuguese"
  | "chinese_traditional";

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
   * @deprecated
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
  publicKey: string;
  address: string;
  compressed: boolean;
  path: string;
  wif: string;
};

export type Inspect = {
  hdKey: typeof HDKey;
  coinKey: CoinKey;
  passphrase?: string;
  mnemonic: string;
  network: MainNet | TestNet | RegTest | SimNet;
  seed?: Buffer;
  words: string | string[];
  hexString?: string;
  entropy?: string;
};
