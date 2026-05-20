/**
 * Type declarations for CoinKey module
 * @link https://github.com/hyperbit-dev/coinkey
 */

declare module '@hyperbitjs/coinkey' {
  export interface Versions {
    public: number;
    private: number;
  }

  export class CoinKey {
    constructor(privateKey: Buffer | Uint8Array | number[], versions?: Versions);
    
    versions: Versions;
    privateKey: Buffer;
    publicKey: Buffer;
    publicAddress: string;
    privateWif: string;
    compressed: boolean;
    pubKeyHash: Buffer;
    privateExportKey: Buffer;
    publicExportKey: Buffer;
    
    toString(): string;
  }

  export default CoinKey;
}
