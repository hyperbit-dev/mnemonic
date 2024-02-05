import * as bip39 from "bip39";
import { describe, expect, it } from "vitest";
import Mnemonic from "../src";

describe("Mnemonic", () => {
  const mnemonic =
    "job shop small once merit ethics enhance direct lobster else copper cotton";

  const code = new Mnemonic({
    mnemonic,
  });

  it("should initialize the class", function() {
    expect(code).toBeInstanceOf(Mnemonic);
  });

  it("should return mainnet Bitcoin network", () => {
    expect(code.network.name).toBe("Bitcoin");
    expect(code.network.versions.private).toBe(0x80);
  });

  it("should have the same words", () => {
    expect(code.words).toEqual(mnemonic.split(" "));
  });

  it("should output words in Spanish", () => {
    const spanish = new Mnemonic({ language: "spanish" });
    expect(bip39.wordlists.spanish.includes(spanish.words[0]));
  });
});
