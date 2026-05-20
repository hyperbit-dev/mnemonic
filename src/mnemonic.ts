import { btc } from '@hyperbitjs/chains';
import CoinKey from '@hyperbitjs/coinkey';
import HDKey from '@hyperbitjs/hdkey';
import { encrypt, decrypt } from '@metamask/browser-passworder';
import * as bip39 from 'bip39';

import {
  GenerateAddresses,
  GenerateAddressSet,
  Address,
  Options,
  ToSeedOptions,
  Language,
  Inspect,
  EncryptedObject,
  MnemonicNetwork,
} from './types';

/**
 * Mnemonic class for generating and managing hierarchical deterministic wallets
 * following BIP32/BIP39/BIP44 standards.
 *
 * @class Mnemonic
 * @example
 * ```typescript
 * import Mnemonic from '@hyperbitjs/mnemonic';
 *
 * // Create with default options (Bitcoin mainnet, English)
 * const mnemonic = new Mnemonic();
 *
 * // Create with custom mnemonic phrase
 * const mnemonic = new Mnemonic({
 *   mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about',
 *   network: btc.mainnet,
 *   language: 'english'
 * });
 * ```
 */
export class Mnemonic {
  private _hdKey: HDKey;
  private _coinKey: CoinKey;
  private _passphrase?: string;

  private _mnemonic: string;
  private _language: Language;
  private _network: MnemonicNetwork;
  private _seed?: Buffer;
  private _words: string[];

  /**
   * Initialize a new Mnemonic instance
   *
   * @param {Options} options - Configuration options
   * @param {string} [options.mnemonic] - BIP39 mnemonic phrase (auto-generated if not provided)
   * @param {MnemonicNetwork} [options.network=btc.mainnet] - Blockchain network configuration
   * @param {Language} [options.language='english'] - BIP39 word list language
   * @param {string} [options.passphrase] - Optional passphrase for additional security
   *
   * @throws {Error} If mnemonic validation fails
   *
   * @example
   * ```typescript
   * // Default Bitcoin mainnet
   * const m1 = new Mnemonic();
   *
   * // Litecoin with Spanish words
   * const m2 = new Mnemonic({
   *   network: ltc.mainnet,
   *   language: 'spanish'
   * });
   *
   * // Custom mnemonic with passphrase
   * const m3 = new Mnemonic({
   *   mnemonic: 'your twelve word mnemonic phrase here',
   *   passphrase: 'secure-passphrase'
   * });
   * ```
   */
  constructor(options: Options = {}) {
    this._network = (options?.network as MnemonicNetwork) ?? btc.mainnet;
    this._language = options.language ?? 'english';

    bip39.setDefaultWordlist(this._language);

    const strength = options.strength ?? 128;
    this._mnemonic = options.mnemonic || bip39.generateMnemonic(strength);
    this._passphrase = options.passphrase;

    this._seed = this.toSeed({
      mnemonic: this._mnemonic,
      passphrase: this._passphrase,
    });
    this._words = this._mnemonic.split(' ');

    this.isValid();

    this._hdKey = this.toHDPrivateKey();
    if (!this._hdKey.privateKey) {
      throw new Error('Failed to generate private key from seed');
    }
    this._coinKey = new CoinKey(this._hdKey.privateKey, this._network.versions);
  }

  /**
   * Convert mnemonic phrase to seed buffer
   *
   * @param {ToSeedOptions} options - Seed generation options
   * @param {string} [options.mnemonic] - Override mnemonic for seed generation
   * @param {string} [options.passphrase] - Override passphrase for seed generation
   * @returns {Buffer} 64-byte seed buffer
   *
   * @throws {Error} If mnemonic is not provided
   *
   * @example
   * ```typescript
   * const mnemonic = new Mnemonic({ mnemonic: 'abandon...' });
   *
   * // Generate seed with same passphrase
   * const seed = mnemonic.toSeed({});
   *
   * // Generate seed with different passphrase
   * const seedWithPass = mnemonic.toSeed({ passphrase: 'newpass' });
   * ```
   */
  public toSeed(options: ToSeedOptions = {}): Buffer {
    const mn = options.mnemonic || this._mnemonic;
    const p = options.passphrase || this._passphrase || '';
    
    if (!mn) {
      throw new Error('Mnemonic is required to generate seed');
    }
    
     // Use bip39 to generate seed
     const seed = bip39.mnemonicToSeedSync(mn, p);
     return Buffer.from(seed);
   }

  /**
   * Generate a random mnemonic phrase
   *
   * @static
   * @param {Language} [language='english'] - Word list language
   * @param {number} [strength=128] - Entropy strength in bits (must be 128-256, divisible by 32)
   * @returns {string} BIP39 mnemonic phrase
   *
   * @example
   * ```typescript
   * // Generate 12-word English mnemonic (128 bits)
   * const phrase12 = Mnemonic.generateMnemonic('english', 128);
   *
   * // Generate 24-word Spanish mnemonic (256 bits)
   * const phrase24 = Mnemonic.generateMnemonic('spanish', 256);
   */

  static generateMnemonic(language: Language = 'english', strength: number = 128): string {
    if (language) {
      bip39.setDefaultWordlist(language);
    }
    return bip39.generateMnemonic(strength);
  }

  /**
   * Get the HD (Hierarchical Deterministic) private key
   *
   * @returns {HDKey} HDKey instance with private key data
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const hdKey = m.getHDPrivateKey();
   * console.log(hdKey.privateKey.toString('hex'));
   * ```
   */
  public getHDPrivateKey(): HDKey {
    return this._hdKey;
  }

  /**
   * Get the coin key for address generation
   *
   * @returns {CoinKey} CoinKey instance for generating addresses
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const coinKey = m.getCoinKey();
   * console.log(coinKey.publicAddress);
   * ```
   */
  public getCoinKey(): CoinKey {
    return this._coinKey;
  }

  /**
   * Generate HD private key from mnemonic seed
   *
   * @returns {HDKey} New HDKey instance derived from seed
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const hdKey = m.toHDPrivateKey();
   * const derivedKey = hdKey.derive("m/44'/0'/0'/0/0");
   * ```
   */
  public toHDPrivateKey(): HDKey {
    const _seed = this.toHexString();

    const hDPrivateKey = HDKey.fromMasterSeed(
      Buffer.from(_seed, 'hex'),
      this._network.versions.bip32
    );

    return hDPrivateKey;
  }

  /**
   * Return seed words (mnemonic) phrase
   *
   * @returns {string} Space-separated BIP39 mnemonic phrase
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const phrase = m.toString();
   * console.log(phrase); // 'abandon ability able about absent absorb abstract ...'
   * ```
   */
  public toString(): string {
    return this._mnemonic;
  }

  /**
   * Convert seed to hexadecimal string representation
   *
   * @returns {string} 128-character hex string (64 bytes)
   *
   * @throws {Error} If seed has not been generated
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const hex = m.toHexString();
   * console.log(hex.length); // 128
   * ```
   */
  public toHexString(): string {
    if (!this._seed) {
      throw new Error('Seed not available');
    }
    return this._seed.toString('hex');
  }

  /**
   * Check if mnemonic phrase is valid according to BIP39
   *
   * @param {string} [mnemonic] - Mnemonic phrase to validate (uses current if not provided)
   * @returns {boolean} True if mnemonic is valid
   *
   * @throws {Error} If mnemonic is not provided
   *
   * @example
   * ```typescript
   * const m = new Mnemonic({ mnemonic: 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about' });
   * console.log(m.isValid()); // true
   *
   * // Validate external phrase
   * console.log(Mnemonic.isValid('invalid phrase')); // false
   * ```
   */
  public isValid(mnemonic?: string): boolean {
    const mn = mnemonic || this._mnemonic;
    if (!mn) {
      throw new Error('Mnemonic not provided');
    }
    const wordlist = Mnemonic.words(this._language);
    return bip39.validateMnemonic(mn, wordlist);
  }

  /**
   * Validate a mnemonic phrase (static method)
   *
   * @static
   * @param {string} mnemonic - Mnemonic phrase to validate
   * @param {Language} [language='english'] - Word list language
   * @returns {boolean} True if mnemonic is valid
   *
   * @example
   * ```typescript
   * console.log(Mnemonic.isValid('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about'));
   * // true
   * ```
   */
  static isValid(mnemonic: string, language: Language = 'english'): boolean {
    const wordlist = Mnemonic.words(language);
    return bip39.validateMnemonic(mnemonic, wordlist);
  }

  /**
   * Deep clone the mnemonic and all internal state
   *
   * @returns {Inspect} Object containing cloned internal data
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const clone = m.inspect();
   * console.log(clone.mnemonic === m.toString()); // true
   * console.log(clone.hdKey); // HDKey instance
   * console.log(clone.entropy); // hex entropy string
   * ```
   */
  public inspect(): Inspect {
    return structuredClone({
      hdKey: this._hdKey,
      coinKey: this._coinKey,
      passphrase: this._passphrase,
      mnemonic: this._mnemonic,
      network: this._network,
      seed: this._seed,
      words: this._words,
      hexString: this.toHexString(),
      entropy: bip39.mnemonicToEntropy(this._mnemonic as string),
    });
  }

  /**
   * Encrypt sensitive internal data with a password
   *
   * @param {string} [passphrase=''] - Password for encryption
   * @returns {Promise<EncryptedObject>} Encrypted data object
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const encrypted = await m.encrypt('my-secure-password');
   * // encrypted.mnemonic, encrypted.hdkey, encrypted.coinKey, etc. are encrypted
   * ```
   */
  public async encrypt(passphrase: string = ''): Promise<EncryptedObject> {
    return {
      hdkey: await encrypt(passphrase, this._hdKey),
      coinKey: await encrypt(passphrase, this._coinKey),
      passphrase: this._passphrase
        ? await encrypt(passphrase, this._passphrase)
        : undefined,
      mnemonic: await encrypt(passphrase, this._mnemonic),
      words: await encrypt(passphrase, this._words),
    };
  }

  /**
   * Decrypt encrypted mnemonic data
   *
   * @param {string | EncryptedObject} value - Encrypted data or string
   * @param {string} passphrase - Password for decryption
   * @returns {Promise<any>} Decrypted data
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const encrypted = await m.encrypt('password');
   * const decrypted = await m.decrypt(encrypted, 'password');
   * console.log(decrypted.mnemonic); // original mnemonic phrase
   * ```
   */
  public async decrypt(value: string | EncryptedObject, passphrase: string) {
    const p = passphrase || '';

    if (typeof value === 'string') {
      return decrypt(p, value);
    }

    return {
      hdkey: await decrypt(p, value.hdkey),
      coinKey: await decrypt(p, value.coinKey),
      passphrase: value.passphrase
        ? ((await decrypt(p, value.passphrase)) as string)
        : undefined,
      mnemonic: (await decrypt(p, value.mnemonic)) as string,
      words: value.words ? ((await decrypt(p, value.words)) as string[]) : [],
    };
  }

  /**
   * Generate multiple external and change address pairs following BIP44
   *
   * Generates addresses using the derivation path: m/44'/coinType'/account'/change/index
   *
   * @param {GenerateAddresses} params - Generation parameters
   * @param {number} [params.count=1] - Number of address pairs to generate
   * @param {number} [params.index=0] - Starting index for address generation
   * @param {number} [params.account=0] - BIP44 account number
   * @returns {GenerateAddressSet[]} Array of address pair objects
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   *
   * // Generate 5 address pairs for account 0
   * const addresses = m.generateAddresses({ count: 5 });
   * console.log(addresses[0].external.address); // First receiving address
   * console.log(addresses[0].change.address);   // First change address
   *
   * // Generate from index 10 for account 1
   * const moreAddresses = m.generateAddresses({
   *   count: 3,
   *   index: 10,
   *   account: 1
   * });
   * ```
   */
  public generateAddresses(params: GenerateAddresses): GenerateAddressSet[] {
    const _index =
      typeof params?.index === 'number' ? Math.abs(params.index) : 0;

    const _count =
      typeof params?.count === 'number' && params.count > 0
        ? Math.abs(params.count) + _index
        : 1 + _index;

    const _defaultAcount =
      typeof params?.account === 'number' ? Math.abs(params.account) : 0;

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
   * Generate a single address at a specific derivation path
   *
   * Follows BIP32 path notation: m / purpose' / coin_type' / account' / change / address_index
   *
   * @param {string} path - BIP32 derivation path
   * @returns {Address} Address object with keys and metadata
   *
   * @example
   * ```typescript
   * const m = new Mnemonic({ network: btc.mainnet });
   *
   * // First receiving address of first account
   * const addr0 = m.generateAddress("m/44'/0'/0'/0/0");
   * console.log(addr0.address);     // Bitcoin address
   * console.log(addr0.privateKey);  // Hex private key
   * console.log(addr0.publicKey);   // Hex public key
   * console.log(addr0.wif);         // WIF format private key
   *
   * // First change address of second account
   * const change = m.generateAddress("m/44'/0'/1'/1/0");
   * ```
   */
  public generateAddress(path: string): Address {
    const derived = this._hdKey.derive(path);
    if (!derived.privateKey) {
      throw new Error(`Failed to derive private key at path: ${path}`);
    }
    const ck = new CoinKey(derived.privateKey, this._network.versions);

    return {
      privateKey: ck.privateKey.toString('hex'),
      publicKey: ck.publicKey.toString('hex'),
      address: ck.publicAddress,
      compressed: ck.compressed,
      path,
      wif: ck.privateWif,
    };
  }

  /**
   * Get word list for a specific language
   *
   * @static
   * @param {Language} language - BIP39 language code
   * @returns {string[]} Array of 2048 words in the specified language
   *
   * @example
   * ```typescript
   * const englishWords = Mnemonic.words('english');
   * console.log(englishWords.length); // 2048
   * console.log(englishWords[0]);     // 'abandon'
   *
   * const spanishWords = Mnemonic.words('spanish');
   * ```
   */
  static words(language: Language): string[] {
    return bip39.wordlists[language];
  }

  /**
   * Get all supported languages with metadata
   *
   * @static
   * @returns {Language[]} Array of supported language codes
   *
   * @example
   * ```typescript
   * const langs = Mnemonic.languages();
   * console.log(langs); // ['english', 'spanish', 'french', ...]
   * ```
   */
  static languages(): Language[] {
    return Object.keys(bip39.wordlists) as Language[];
  }

  /**
   * Get mnemonic phrase as array of words
   *
   * @returns {string[]} Array of individual words
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const wordArray = m.getWords();
   * console.log(wordArray.length); // 12 (or 24)
   * console.log(wordArray[0]);     // first word
   * ```
   */
  public getWords(): string[] {
    return [...this._words];
  }

  /**
   * Get the entropy bytes used to generate this mnemonic
   *
   * @returns {string} Hexadecimal entropy string
   *
   * @example
   * ```typescript
   * const m = new Mnemonic();
   * const entropy = m.getEntropy();
   * console.log(entropy.length); // 32 (128 bits) or 64 (256 bits)
   * ```
   */
  public getEntropy(): string {
    return bip39.mnemonicToEntropy(this._mnemonic);
  }

  /**
   * Get current passphrase (if set)
   *
   * @returns {string|undefined} Current passphrase or undefined
   *
   * @example
   * ```typescript
   * const m1 = new Mnemonic();
   * console.log(m1.getPassphrase()); // undefined
   *
   * const m2 = new Mnemonic({ passphrase: 'my-pass' });
   * console.log(m2.getPassphrase()); // 'my-pass'
   * ```
   */
  public getPassphrase(): string | undefined {
    return this._passphrase;
  }

  /**
   * Get the network configuration
   *
   * @returns {MnemonicNetwork} Current network configuration
   *
   * @example
   * ```typescript
   * const m = new Mnemonic({ network: ltc.mainnet });
   * const net = m.getNetwork();
   * console.log(net.name); // 'Litecoin'
   * ```
   */
  public getNetwork(): MnemonicNetwork {
    return this._network;
  }

  /**
   * Get the current language setting
   *
   * @returns {Language} Current BIP39 language code
   *
   * @example
   * ```typescript
   * const m = new Mnemonic({ language: 'spanish' });
   * console.log(m.getLanguage()); // 'spanish'
   * ```
   */
  public getLanguage(): Language {
    return this._language;
  }
}
