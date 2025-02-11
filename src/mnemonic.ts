import { btc, MainNet, TestNet, RegTest, SimNet } from "@hyperbitjs/chains";
import CoinKey from "@hyperbitjs/coinkey";
import HDKey from "@hyperbitjs/hdkey";
import { encrypt, decrypt } from "@metamask/browser-passworder";
import * as bip39 from "bip39";

import {
  GenerateAddresses,
  GenerateAddressSet,
  Address,
  Options,
  ToSeedOptions,
  Language,
  Inspect,
} from "./types";

export class Mnemonic {
  private _hdKey: typeof HDKey;
  private _coinKey: CoinKey;
  private _passphrase?: string;

  private _mnemonic: string;
  private _language: Language;
  private _network: MainNet | TestNet | RegTest | SimNet;
  private _seed?: Buffer;
  private _words: string | string[];
  public encrypted: boolean = false;

  constructor(options: Options = {}) {
    this._network = options?.network ?? btc.mainnet;
    this._language = options.language ?? "english";

    bip39.setDefaultWordlist(this._language);

    this._mnemonic = options.mnemonic || bip39.generateMnemonic();
    this._passphrase = options.passphrase;

    this._seed = this.toSeed({
      mnemonic: this._mnemonic,
      passphrase: this._passphrase,
    });
    this._words = this._mnemonic.split(" ");

    this.isValid();

    this._hdKey = this.toHDPrivateKey();
    this._coinKey = new CoinKey(this._hdKey.privateKey, this._network.versions);
  }

  public toSeed(options: ToSeedOptions): Buffer {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    const mn = options.mnemonic || this._mnemonic;
    const p = options.passphrase || this._passphrase;
    if (mn) {
      this._seed = bip39.mnemonicToSeedSync(mn, p);
      return this._seed!;
    } else {
      throw new Error("Invalid arguments: mnemonic");
    }
  }

  static generateMnemonic(language?: Language) {
    if (language) {
      bip39.setDefaultWordlist(language);
    }
    return bip39.generateMnemonic();
  }

  public getHDPrivateKey(): typeof HDKey {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    return this._hdKey;
  }

  public getCoinKey(): CoinKey {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    return this._coinKey;
  }

  public toHDPrivateKey(): typeof HDKey {
    if (this.encrypted) {
      throw new Error("Mnemonic is encrypted");
    }
    const _seed = this.toHexString();

    const hDPrivateKey = HDKey.fromMasterSeed(
      Buffer.from(_seed, "hex"),
      this._network.versions.bip32
    );

    return hDPrivateKey;
  }

  /**
   * Return seed words (mnemonic) phrase
   * @returns string
   */
  public toString(): string {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    return this._mnemonic;
  }

  public toHexString(): string {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    if (!this._seed) {
      throw new Error("Seed not available or encrypted");
    }
    return this._seed.toString("hex");
  }

  /**
   * Check if mnemonic is a valid phrase
   * @param {string} mnemonic Seed words (mnemonic) phrase
   * @param {Array<string>=} wordlist A list of words to validate against
   * @returns boolean
   */
  public isValid(): boolean {
    if (!this._mnemonic) {
      throw new Error("Mnemonic not provided");
    }
    const wordlist = Mnemonic.words(this._language);
    return bip39.validateMnemonic(this._mnemonic, wordlist);
  }

  /**
   * Deep cloned object of the wallet.
   */
  public inspect(): Inspect {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    return structuredClone({
      hdKey: this._hdKey,
      coinKey: this._coinKey,
      passphrase: this._passphrase,
      mnemonic: this._mnemonic,
      network: this._network,
      seed: this._seed,
      words: this._words,
      hexString: !this.encrypted ? this.toHexString() : undefined,
      // entropy: !this.encrypted
      //   ? bip39.mnemonicToEntropy(this._mnemonic as string)
      //   : undefined,
    });
  }

  public async lock(passphrase?: string) {
    return this.encrypt(passphrase);
  }

  public async unlock(passphrase?: string) {
    return this.decrypt(passphrase);
  }

  public async encrypt(passphrase?: string) {
    if (this.encrypted) {
      throw new Error("Already locked. Please unlock to continue.");
    }
    const p = passphrase || "";
    this._hdKey = await encrypt(p, this._hdKey);
    this._coinKey = await encrypt(p, this._coinKey);
    if (this._passphrase) {
      this._passphrase = await encrypt(p, this._passphrase);
    }
    this._mnemonic = await encrypt(p, this._mnemonic);
    this._seed = this._seed = undefined;
    this._words = await encrypt(p, this._words);
    this.encrypted = true;
  }

  public async decrypt(passphrase?: string) {
    if (!this.encrypted) {
      throw new Error("Unlocked. Please lock to continue.");
    }
    const p = passphrase || "";
    this._coinKey = await decrypt(p, this._coinKey);
    if (this._passphrase) {
      this._passphrase = (await decrypt(p, this._passphrase)) as string;
    }
    this._mnemonic = (await decrypt(p, this._mnemonic)) as string;
    if (this._words) {
      this._words = (await decrypt(p, this._words as string)) as string[];
    }
    this.encrypted = false;
    this._seed = this.toSeed({
      mnemonic: this._mnemonic,
      passphrase: this._passphrase,
    });
    this._hdKey = this.toHDPrivateKey();
  }

  /**
   * Generate external and change addresses for the submitted index.
   *
   * @param {number=} count Amount of addresses to generate starting from zero or index.
   * @param {number=} index Address index to generate.
   * @param {number=} account Default = 0. Set Account to generate addresses for.
   * @return {GenerateAddressSet}
   */
  public generateAddresses(params: GenerateAddresses): GenerateAddressSet[] {
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    const _index =
      typeof params?.index === "number" ? Math.abs(params.index) : 0;

    const _count =
      typeof params?.count === "number" && params.count > 0
        ? Math.abs(params.count) + _index
        : 1 + _index;

    const _defaultAcount =
      typeof params?.account === "number" ? Math.abs(params.account) : 0;

    const addressPairs = [];

    // https://github.com/satoshilabs/slips/blob/master/slip-0044.md
    const coinType = this._network.versions.bip44;

    for (let i = _index; i < _count; i++) {
      const recievePath = `m/44'/${coinType}'/${_defaultAcount}'/0/${i}`;
      const external = this.generateAddress(recievePath);

      const changePath = `m/44'/${coinType}'/${_defaultAcount}'/1/${i}`;
      const change = this.generateAddress(changePath);

      addressPairs.push({
        external,
        change,
      });
    }

    return addressPairs;
  }

  /**
   * Generate a single address for external or change.
   * m / purpose' / coin_type' / account' / change / address_ind
   *
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
    if (this.encrypted) {
      throw new Error("Locked. Please unlock to continue.");
    }
    const derived = this._hdKey.derive(path);
    const ck = new CoinKey(derived.privateKey, this._network.versions);

    return {
      privateKey: ck.privateKey.toString("hex"),
      publicKey: ck.publicKey.toString("hex"),
      address: ck.publicAddress,
      compressed: ck.compressed,
      path,
      wif: ck.privateWif,
    };
  }

  static words(language: Language): string[] {
    return bip39.wordlists[language];
  }
}
