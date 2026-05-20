# @hyperbitjs/mnemonic

![Hyperbit Mnemonic Banner](https://github.com/hyperbit-dev/mnemonic/blob/master/media/repo-banner.png)

# Hyperbit - Mnemonic

[![NPM Package](https://img.shields.io/npm/v/@hyperbitjs/mnemonic.svg?style=flat-square)](https://www.npmjs.org/package/@hyperbitjs/mnemonic)

**A Hyperbit module for UTXO coins that implements BIP32/BIP39/BIP44 Mnemonic code for generating deterministic hierarchical wallets.**

## Features

- 🔐 **BIP32/BIP39/BIP44 Compliant** - Full hierarchical deterministic key generation
- 🌐 **Multi-Language Support** - 10 supported BIP39 languages
- 🪙 **Multi-Coin Support** - Bitcoin, Litecoin, Dogecoin, Ravencoin, Dash, ZCash, DigiByte, and more
- 🔑 **HD Wallet Generation** - Generate unlimited addresses from a single seed
- 🔒 **Encrypted Backup** - Password-protected encryption for sensitive data
- ⚡ **Modern TypeScript** - Full type safety with comprehensive JSDoc
- ✅ **Well Tested** - Extensive test coverage with 50+ test cases

## Getting Started

```sh
# Using npm
npm install @hyperbitjs/mnemonic

# Using yarn
yarn add @hyperbitjs/mnemonic

# Using pnpm
pnpm add @hyperbitjs/mnemonic
```

## Quick Start

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';
import { btc, ltc, rvn } from '@hyperbitjs/chains';

// Create a new wallet with random mnemonic (Bitcoin mainnet, English)
const wallet = new Mnemonic();
console.log(wallet.toString()); // 'abandon ability able ...'

// Create with custom mnemonic and network
const ltcWallet = new Mnemonic({
  mnemonic: 'your twelve word mnemonic phrase here...',
  network: ltc.mainnet,
  language: 'english',
  passphrase: 'optional-security-passphrase'
});

// Generate addresses (BIP44 standard)
const addresses = ltcWallet.generateAddresses({ count: 5 });
console.log(addresses[0].external); // First external address
// {
//   address: 'LXfKHZMmwP2C28n4RTCo4i9zHhKjRmwhF8',
//   privateKey: '...',
//   publicKey: '...',
//   wif: '...',
//   path: "m/44'/2'/0'/0/0"
// }

// Generate a specific address
const addr = ltcWallet.generateAddress("m/44'/2'/0'/0/0");

// Access keys
const hdKey = ltcWallet.getHDPrivateKey();
const coinKey = ltcWallet.getCoinKey();
```

## Supported Networks

Supports all chains available in [@hyperbitjs/chains](https://github.com/hyperbit-dev/chains):

**Major Networks:**
- Bitcoin (mainnet, testnet, regtest)
- Litecoin
- Dogecoin
- Ravencoin
- Dash
- Bitcoin Cash
- Decred
- DigiByte
- ZCash
- And 40+ more...

## Available Languages

- 🇬🇧 English
- 🇪🇸 Spanish
- 🇫🇷 French
- 🇮🇹 Italian
- 🇨🇿 Czech
- 🇵🇹 Portuguese
- 🇨🇳 Chinese (Simplified)
- 🇹🇼 Chinese (Traditional)
- 🇯🇵 Japanese
- 🇰🇷 Korean

## API Documentation

### Constructor

```typescript
new Mnemonic(options?: Options)
```

**Options:**
- `mnemonic?: string` - BIP39 mnemonic phrase (auto-generated if not provided)
- `network?: MnemonicNetwork` - Blockchain network (default: Bitcoin mainnet)
- `language?: Language` - BIP39 word list language (default: 'english')
- `passphrase?: string` - Optional BIP39 passphrase for additional security

### Methods

#### Generating Mnemonics

```typescript
// Generate random mnemonic (12 words by default)
const phrase = Mnemonic.generateMnemonic();
const phrase24 = Mnemonic.generateMnemonic('english', 256); // 24 words

// Get word list for a language
const words = Mnemonic.words('english'); // 2048 words

// List all supported languages
const languages = Mnemonic.languages();
```

#### Seed & Key Management

```typescript
const wallet = new Mnemonic();

// Get mnemonic phrase
wallet.toString(); // Returns mnemonic string

// Get seed data
wallet.toSeed();       // Returns Buffer
wallet.toHexString();  // Returns hex string

// Get entropy
wallet.getEntropy(); // Returns hex entropy

// Access keys
wallet.getHDPrivateKey();  // Returns HDKey instance
wallet.getCoinKey();       // Returns CoinKey instance
```

#### Address Generation (BIP44)

```typescript
const wallet = new Mnemonic({ network: btc.mainnet });

// Generate multiple address pairs
const addressPairs = wallet.generateAddresses({
  count: 5,           // Generate 5 pairs
  index: 0,           // Starting from index 0
  account: 0          // Account 0
});

// Generate single address at specific path
const address = wallet.generateAddress("m/44'/0'/0'/0/0");
// Returns:
// {
//   address: '1A1z7agoat...',
//   privateKey: '...',   // Hex format
//   publicKey: '...',    // Hex format
//   wif: '...',          // Wallet Import Format
//   path: "m/44'/0'/0'/0/0",
//   compressed: true
// }
```

#### Validation

```typescript
const wallet = new Mnemonic();

// Validate current mnemonic
wallet.isValid(); // true/false

// Validate external phrase
Mnemonic.isValid('abandon abandon abandon...', 'english');
```

#### Encryption & Backup

```typescript
const wallet = new Mnemonic();

// Encrypt wallet data
const encrypted = await wallet.encrypt('my-password');
// encrypted contains: { mnemonic, hdkey, coinKey, passphrase, words }

// Decrypt wallet data
const decrypted = await wallet.decrypt(encrypted, 'my-password');
// decrypted.mnemonic === original mnemonic
```

#### Utility Methods

```typescript
const wallet = new Mnemonic();

// Get configuration
wallet.getWords();       // Returns string[]
wallet.getNetwork();     // Returns network config
wallet.getLanguage();    // Returns language code
wallet.getPassphrase();  // Returns passphrase or undefined

// Deep clone with inspection
const data = wallet.inspect(); // Returns complete wallet state
// { hdKey, coinKey, mnemonic, seed, words, entropy, hexString, network }
```

## Examples

### Multi-Network Wallet

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';
import { btc, ltc, doge, rvn } from '@hyperbitjs/chains';

const mnemonic = 'your seed phrase here...';

// Create wallets for different coins with same mnemonic
const btcWallet = new Mnemonic({ mnemonic, network: btc.mainnet });
const ltcWallet = new Mnemonic({ mnemonic, network: ltc.mainnet });
const dogeWallet = new Mnemonic({ mnemonic, network: doge.mainnet });
const rvnWallet = new Mnemonic({ mnemonic, network: rvn.mainnet });

// Generate addresses
const btcAddr = btcWallet.generateAddresses({ count: 1 });
const ltcAddr = ltcWallet.generateAddresses({ count: 1 });
// Addresses will be different due to different coin types!
```

### Secure Wallet with Passphrase

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';

const userMnemonic = 'user twelve word seed phrase...';
const userPassword = 'user-secure-password';

// Create wallet with passphrase - adds security layer
const wallet = new Mnemonic({
  mnemonic: userMnemonic,
  passphrase: userPassword
});

// Encrypt entire wallet
const backup = await wallet.encrypt('backup-encryption-password');
// Save backup to secure storage

// Later: restore from backup
const restored = new Mnemonic();
const decrypted = await restored.decrypt(backup, 'backup-encryption-password');
// Now you have the original mnemonic, passphrase, keys, etc.
```

### Generate Large Address Batch

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';

const wallet = new Mnemonic();

// Generate 1000 addresses efficiently
const addresses = wallet.generateAddresses({ count: 1000 });

// Use for multi-address wallet functionality
addresses.forEach((pair, index) => {
  console.log(`Pair ${index}:`);
  console.log(`  External: ${pair.external.address}`);
  console.log(`  Change:   ${pair.change.address}`);
});
```

### Language-Specific Mnemonic

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';

// Generate Spanish mnemonic
const spanishWallet = new Mnemonic({
  language: 'spanish'
});
console.log(spanishWallet.toString());
// Output: activar ábaco abadejo ... (Spanish words)

// Validate it was created correctly
console.log(spanishWallet.isValid()); // true
```

### Custom Derivation Paths

```typescript
import Mnemonic from '@hyperbitjs/mnemonic';

const wallet = new Mnemonic();

// Standard BIP44 path (automatic with generateAddresses)
const standard = wallet.generateAddress("m/44'/0'/0'/0/0");

// Custom paths
const custom1 = wallet.generateAddress("m/44'/0'/1'/0/0");  // Account 1
const custom2 = wallet.generateAddress("m/44'/0'/0'/1/10");  // Change index 10
const custom3 = wallet.generateAddress("m/44'/1'/0'/0/0");   // Bitcoin testnet

// Different coin types
const ltcPath = wallet.generateAddress("m/44'/2'/0'/0/0");   // Litecoin
const dogeP = wallet.generateAddress("m/44'/3'/0'/0/0");     // Dogecoin
```

## BIP Standards

This module implements:

- **BIP32** - Hierarchical Deterministic Wallets
- **BIP39** - Mnemonic code for generating deterministic keys
- **BIP44** - Multi-Account Hierarchy for Deterministic Wallets
- **BIP49** - Derivation scheme for P2WPKH-nested-in-P2SH based accounts
- **BIP84** - Derivation scheme for P2WPKH based accounts

## Type Safety

Full TypeScript support with comprehensive type definitions:

```typescript
import Mnemonic, {
  Address,
  GenerateAddressSet,
  MnemonicNetwork,
  Language,
  Inspect,
  EncryptedObject,
} from '@hyperbitjs/mnemonic';
```

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) at base of repo for information about how to contribute.

## Security Considerations

⚠️ **Important:**

1. **Never commit seed phrases** to version control
2. **Use strong passphrases** (20+ characters, mix of upper/lower/numbers/symbols)
3. **Encrypt backups** with strong passwords before storing
4. **Use hardware wallets** for production use
5. **Validate all addresses** before sending funds
6. **Keep dependencies updated** for security patches

## License

Code released under [the MIT license](./LICENSE.md).

## Overview
This project lives at `mnemonic` and is part of the broader multi-project workspace.
**Description:** No description provided yet.
## Purpose
- Deliver the core capability owned by this project.
- Provide stable commands and interfaces for other apps/packages in the workspace.
- Keep implementation details localized so changes stay maintainable.
## Architecture Notes
- Type: **Project**
- Package manager metadata source: `package.json`
- Runtime entry hints: `dist/index.cjs`
## Setup
1. Install dependencies from this directory:
```bash
npm install
```
2. Run key scripts as needed (see script table below).
## NPM Scripts
| Script | Command |
|---|---|
| `build` | `vite build` |
| `type-check` | `tsc --noEmit` |
| `lint` | `eslint . --max-warnings 0` |
| `lint:fix` | `eslint . --fix && prettier --write .` |
| `format` | `prettier --write .` |
| `format:check` | `prettier --check .` |
| `test` | `vitest --run` |
| `test:watch` | `vitest` |
| `validate` | `npm run type-check && npm run lint && npm run test` |
| `prepublishOnly` | `npm run build && npm run validate` |
## Dependencies
### Production
- `@hyperbitjs/chains`: `^1.10.2`
- `@hyperbitjs/coinkey`: `*`
- `@hyperbitjs/hdkey`: `*`
- `@metamask/browser-passworder`: `*`
- `bip39`: `*`
### Development
- `@types/node`: `^20.10.0`
- `@typescript-eslint/eslint-plugin`: `^7.0.0`
- `@typescript-eslint/parser`: `^7.0.0`
- `eslint`: `^8.56.0`
- `prettier`: `^3.3.3`
- `typescript`: `^5.3.3`
- `vite`: `^5.4.21`
- `vitest`: `^1.6.1`
## Configuration
- Primary config source: `package.json`
- No `.env.example` detected in this directory.
- Add project-specific operational notes to `MEMORY_BANK.md`.
## Development Workflow
1. Make changes in focused modules.
2. Run the smallest relevant script/test first.
3. Run full validation scripts before merging.
4. Update this README and memory bank whenever behavior/contracts change.
## Testing and Validation
- Prefer script-driven checks from the table above (for example: `test`, `build`, `lint`).
- If this project has no tests yet, add smoke checks and document them in `MEMORY_BANK.md`.
## LLM Context
When using an LLM coding assistant in this folder, always include:
- Exact target file paths and expected behavior changes.
- Validation command(s) run after edits.
- Runtime/config assumptions (.env, API keys, ports, external services).

## Memory Bank
See `MEMORY_BANK.md` for operational context, commands, and troubleshooting notes.
