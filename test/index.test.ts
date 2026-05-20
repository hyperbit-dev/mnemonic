import Mnemonic from '../src';
import { ltc } from '@hyperbitjs/chains';

describe('Mnemonic', () => {
  describe('Initialization', () => {
    it('should initialize the class', () => {
      const m = new Mnemonic();
      expect(m).toBeDefined();
    });

    it('should return mainnet Bitcoin network by default', () => {
      const m = new Mnemonic();
      const inspect = m.inspect();
      expect(inspect.network.name).toBe('Bitcoin');
    });

    it('should initialize with custom network', () => {
      const m = new Mnemonic({ network: ltc.mainnet });
      const inspect = m.inspect();
      expect(inspect.network.name).toBe('Litecoin');
    });
  });

  describe('Mnemonic Generation', () => {
    it('should generate a new mnemonic if not provided', () => {
      const m = new Mnemonic();
      const inspect = m.inspect();
      expect(inspect.words.length).toBe(12);
    });

    it('should generate 24-word mnemonic with strength 256', () => {
      const m = new Mnemonic({ strength: 256 });
      const inspect = m.inspect();
      expect(inspect.words.length).toBe(24);
    });
  });

  describe('Validation', () => {
    it('should validate correct mnemonic', () => {
      const m = new Mnemonic();
      expect(m.isValid()).toBe(true);
    });
  });

  describe('Seed Generation', () => {
    it.skip('should generate seed from mnemonic', () => {
      const m = new Mnemonic();
      const seed = m.toSeed();
      expect(seed).toBeDefined();
      expect(seed.length).toBe(64);
    });
  });
});
