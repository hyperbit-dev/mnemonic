/**
 * Type declarations for HDKey module
 * @link https://github.com/hyperbit-dev/hdkey
 */

declare module '@hyperbitjs/hdkey' {
  export interface Versions {
    private: number;
    public: number;
  }

  export interface HDKeyJSON {
    xpriv: string | null;
    xpub: string;
  }

  export class HDKey {
    versions: Versions;
    depth: number;
    index: number;
    parentFingerprint: number;
    chainCode: Buffer | null;
    
    fingerprint: number;
    identifier: Buffer | null;
    pubKeyHash: Buffer | null;
    privateKey: Buffer | null;
    publicKey: Buffer | null;
    privateExtendedKey: string;
    publicExtendedKey: string;
    
    constructor(versions?: Versions);
    
    static fromMasterSeed(seedBuffer: Buffer | Uint8Array | number[], versions?: Versions): HDKey;
    static fromExtendedKey(base58key: string, versions?: Versions): HDKey;
    static fromJSON(json: HDKeyJSON, versions?: Versions): HDKey;
    
    derive(path: string): HDKey;
    deriveChild(index: number): HDKey;
    
    toJSON(): HDKeyJSON;
    toString(): string;
  }

  export default HDKey;
}
