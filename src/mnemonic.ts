import { btc, Network } from '@hyperbitjs/chains';
import * as bip39 from 'bip39';
import CoinKey from 'coinkey';
import HDKey from 'hdkey';

import {
  GenerateAddresses,
  GenerateAddressSet,
  Address,
  Options,
  ToSeedOptions,
  Language,
} from './types';

export class Mnemonic {
  private _defaultAcount: number = 0;
  private _hdKey: HDKey;
  private _passphrase?: string;

  public mnemonic: string;
  public network: Network;
  public seed?: Buffer;
  public words: string[];
  public accounts: Record<string, Record<string, Map<number, Address>>> = {
    0: {
      external: new Map(),
      change: new Map(),
    },
  };

  constructor(options: Options = {}) {
    this.network = options.network || btc.main;
    if (options.language) {
      bip39.setDefaultWordlist(options.language);
    }

    this.mnemonic = options.mnemonic || bip39.generateMnemonic();
    this._defaultAcount = options.account || 0;
    this._passphrase = options.passphrase;

    this.seed = this.toSeed({
      mnemonic: this.mnemonic,
      passphrase: this._passphrase,
    });
    this.words = this.mnemonic.split(' ');

    Mnemonic.isValid(this.mnemonic);

    this._hdKey = this.toHDPrivateKey();
  }

  public toSeed(options: ToSeedOptions): Buffer {
    const mn = options.mnemonic || this.mnemonic;
    const p = options.passphrase || this._passphrase;
    if (mn) {
      this.seed = bip39.mnemonicToSeedSync(mn, p);
      return this.seed;
    } else {
      throw new Error('Invalid arguments: mnemonic');
    }
  }

  static generateMnemonic(language?: Language) {
    if (language) {
      bip39.setDefaultWordlist(language);
    }
    return bip39.generateMnemonic();
  }

  public getHDPrivateKey(): HDKey {
    return this._hdKey;
  }

  public toHDPrivateKey(): HDKey {
    const seed = this.toHexString(bip39.mnemonicToSeedSync(this.mnemonic));

    const hDPrivateKey = HDKey.fromMasterSeed(
      Buffer.from(seed, 'hex'),
      this.network.versions.bip32
    );

    return hDPrivateKey;
  }

  /**
   * Return seed words (mnemonic) phrase
   * @returns string
   */
  public toString(): string {
    return this.mnemonic;
  }

  public toHexString(seed?: Buffer): string {
    if (!seed) {
      throw new Error('Seed Buffer not provided');
    }
    return seed.toString('hex');
  }

  /**
   * Check if mnemonic is a valid phrase
   * @param {string} mnemonic Seed words (mnemonic) phrase
   * @param {Array<string>=} wordlist A list of words to validate against
   * @returns boolean
   */
  static isValid(mnemonic?: string, wordlist?: string[]): boolean {
    if (!mnemonic) {
      throw new Error('Mnemonic not provided');
    }
    return bip39.validateMnemonic(mnemonic, wordlist);
  }

  public inspect(): Record<string, string | Buffer | undefined> {
    return {
      mnemonic: this.mnemonic,
      seed: this.seed,
      hexString: this.toHexString(this.seed),
      entropy: bip39.mnemonicToEntropy(this.mnemonic as string),
    };
  }

  /**
   * Generate and store a external and change address for the submitted index.
   *
   * If not specified, index will be autogenerated from the last highest index.
   *
   * If index is defined, it is expected that the user wants to generate or retrieve an existing addresses information.
   * @param {number=} count Amount of addresses to generate starting from zero or index.
   * @param {number=} index Address index to generate.
   * @return {GenerateAddressSet}
   */
  public generateAddresses(params: GenerateAddresses): GenerateAddressSet[] {
    const _index = params?.index || 0;
    const _count = params?.count || 1;
    const _defaultAcount = params?.account || this._defaultAcount;
    const _account = this.accounts[_defaultAcount];

    const addressPairs = [];

    // Get sorted external addresses.
    const externalAddresses = Array.from(_account.external).sort(
      (a, b) => a[0] - b[0]
    );

    // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    const coinType = this.network.versions.bip44;

    for (let i = _index; i < _count; i++) {
      // Find last external address and its' index.
      const lastReceiveAddress =
        externalAddresses[externalAddresses.length - 1];
      const lastIndex = lastReceiveAddress?.[i];
      if (lastIndex !== undefined) {
        continue;
      }

      const recievePath = `m/44'/${coinType}'/${_account}'/0/${i}`;
      const changePath = `m/44'/${coinType}'/${_account}'/1/${i}`;

      const external = this.generateAddress(recievePath);
      const change = this.generateAddress(changePath);

      const mappedReceiveAddress = _account.external.get(i);
      if (!mappedReceiveAddress) {
        _account.external.set(i, external);
      }

      const mappedChangeAddress = _account.change.get(i);
      if (!mappedChangeAddress) {
        _account.change.set(i, change);
      }

      addressPairs.push({
        external,
        change,
      });
    }

    return addressPairs;
  }

  /**
   * Generate a single address for external or change.
   *
   * Is not automatically stored in the class.
   * @example
   * // First Wallet Receive Address
   * mnemonic.generateAddress('`m/44'/1'/0'/0/0`)
   * @example
   * // First Wallet Change Address
   * mnemonic.generateAddress('`m/44'/1'/0'/1/0`)
   * @param path The derive path of the address.
   * @returns {Address}
   */
  public generateAddress(path: string): Address {
    const derived = this._hdKey.derive(path);
    const ck = new CoinKey(derived.privateKey, this.network.versions);

    return {
      privateKey: ck.privateKey.toString('hex'),
      address: ck.publicAddress,
      path,
      wif: ck.privateWif,
    };
  }

  static words(language: Language): string[] {
    return bip39.wordlists[language];
  }
}
