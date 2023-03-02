# Examples

## Create Mnemonic Object

Defaults to Bitcoin mainnet with English words.

```javascript
const code = new Mnemonic();
```

## Get string phrase from Mnemonic Object

```javascript
const code = new Mnemonic();
code.toString();

// Example output: job shop small once merit ethics enhance direct lobster else copper cotton
```

## Set network as mainnet

```javascript
import { ltc } from '@hyperbitjs/chains';

const code = new Mnemonic({ network: ltc.main });
code.toString();
```

## Check if Mnemonic Object is valid in Spanish

```javascript
const code = new Mnemonic({ language: 'spanish' });
const isValid = Mnemonic.isValid(code.toString());
```

## Generate a seed based on the code and optional passphrase.

```javascript
const passphrase = '';
const code = new Mnemonic({ passphrase });

const seedBuffer = code.toSeed();
```

## Get current HD Private Key

```javascript
const code = new Mnemonic();
const hdPrivateKey1 = code.getHDPrivateKey();
```

## Get word list in English

```javascript
const words = Mnemonic.words('english');
```

## Generate Addresses

```javascript
const code = new Mnemonic();
const addresses = code.generateAddresses();
// Example output: [{ external: {...}, change: {...} }]

console.log(code.accounts);
// Example output: { 0: {}, 1: {} }

console.log(code.accounts['0']);
// Example output: { external: {...}, change: {...} }

console.log(code.accounts['0'].external.get(1));
// Example output:
// privateKey: '';
// address: '';
// path: '';
// wif: '';
```
