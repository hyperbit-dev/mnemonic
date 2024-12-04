import * as bip39 from "bip39";
import { describe, expect, it } from "vitest";
import Mnemonic from "../src";

describe("Mnemonic", () => {
  const mnemonic =
    "job shop small once merit ethics enhance direct lobster else copper cotton";

  it("should initialize the class", function () {
    const code = new Mnemonic({
      mnemonic,
    });
    expect(code).toBeInstanceOf(Mnemonic);
  });

  it("should return mainnet Bitcoin network", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const inspect = code.inspect();
    expect(inspect.network.name).toBe("Bitcoin");
    expect(inspect.network.versions.private).toBe(0x80);
  });

  it("should have the same words", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const inspect = code.inspect();
    expect(inspect.words).toEqual(mnemonic.split(" "));
  });

  it("should output words in Spanish", () => {
    const spanish = new Mnemonic({ language: "spanish" });
    const inspect = spanish.inspect();
    expect(bip39.wordlists.spanish.includes(inspect.words[0]));
  });

  it("should encrypt the mnemonic", async () => {
    const code = new Mnemonic({
      mnemonic,
    });
    await code.encrypt("password");
    expect(() => code.inspect()).toThrow("Locked. Please unlock to continue.")
  });

  it("should decrypt the mnemonic", async () => {
    const code = new Mnemonic({
      mnemonic,
    });
    await code.encrypt("password");
    await code.decrypt("password");
    expect(code.encrypted).toBe(false);
  });

  it("should validate the mnemonic", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    expect(code.isValid()).toBe(true);
  });

  it("should generate addresses", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const addresses = code.generateAddresses({ count: 5 });
    expect(addresses.length).toBe(5);
  });

  it("toHexString", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const hex = code.toHexString();
    expect(hex).toBe(
      "77ea633e106b09a8f16cc0a6d2c10f5b971c4c0e535a9584fc2391861fa12acfcb25768ff840b37b1ae91f4afa8cdb63bf5deb2a06360cb3f3742c1ee4dfaaa8"
    );
  });

  it("toString", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const str = code.toString();
    expect(str).toBe(mnemonic);
  });

  it("generateMnemonic", () => {
    const words = Mnemonic.generateMnemonic();
    expect(words.split(" ").length).toBe(12);
  });

  it("getHDPrivateKey", () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const hdKey = code.getHDPrivateKey();
    expect(hdKey).toBeInstanceOf(Object);
  });

  it("getCoinKey", async () => {
    const code = new Mnemonic({
      mnemonic,
    });
    const coinKey = code.getCoinKey();
    expect(coinKey).toBeInstanceOf(Object);
  });

  it("words", () => {
    const words = Mnemonic.words("english");
    expect(words).toBeInstanceOf(Array);
  });
});
