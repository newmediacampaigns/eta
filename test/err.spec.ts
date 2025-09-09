/* global it, expect, describe */

import {
  Eta,
  EtaError,
  EtaParseError,
  EtaRuntimeError,
  EtaNameResolutionError,
} from "../src/index";

describe("ParseErr", () => {
  const eta = new Eta();

  it("error while parsing - renderString", () => {
    try {
      eta.renderString("template {%", {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(EtaError);
      expect(ex).toBeInstanceOf(EtaParseError);
      expect((ex as EtaParseError).name).toBe("EtaParser Error");
      expect((ex as EtaParseError).message).toBe(`unclosed tag at line 1 col 10:

  template {%
           ^`);
      expect(ex instanceof Error).toBe(true);
    }
  });

  it("error while parsing - compile", () => {
    try {
      eta.compile("template {%");
    } catch (ex) {
      expect(ex).toBeInstanceOf(EtaError);
      expect(ex).toBeInstanceOf(EtaParseError);
      expect((ex as EtaParseError).name).toBe("EtaParser Error");
      expect((ex as EtaParseError).message).toBe(`unclosed tag at line 1 col 10:

  template {%
           ^`);
      expect(ex instanceof Error).toBe(true);
    }
  });
});

describe("RuntimeErr", () => {
  const eta = new Eta({ debug: true });

  it("error throws correctly", () => {
    // Load the template manually since we don't have file system access
    eta.loadTemplate("runtime-error", "{{ undefinedVariable }}\nLorem Ipsum");
    
    try {
      eta.render("runtime-error", {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(EtaError);
      expect(ex).toBeInstanceOf(EtaRuntimeError);
      expect((ex as EtaRuntimeError).name).toBe("ReferenceError");
      expect((ex as EtaRuntimeError).message).toBe(`line 1
 >> 1| {{ undefinedVariable }}
    2| Lorem Ipsum

undefinedVariable is not defined`);
    }
  });
});


describe("EtaNameResolutionError", () => {
  const eta = new Eta({ debug: true });

  it("error throws correctly", () => {
    const template = "@not-existing-tp";

    try {
      eta.render(template, {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(EtaNameResolutionError);
      expect((ex as EtaNameResolutionError).name).toBe("EtaNameResolution Error");
      expect((ex as EtaNameResolutionError).message).toBe(`Failed to get template '${template}'`);
    }
  });
});
