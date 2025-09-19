/* global it, expect, describe */

import {
  Chuck,
  ChuckError,
  ChuckParseError,
  ChuckRuntimeError,
  ChuckNameResolutionError,
} from "../src/index";

describe("ParseErr", () => {
  const chuck = new Chuck();

  it("error while parsing - renderString", () => {
    try {
      chuck.renderString("template {%", {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(ChuckError);
      expect(ex).toBeInstanceOf(ChuckParseError);
      expect((ex as ChuckParseError).name).toBe("ChuckParser Error");
      expect((ex as ChuckParseError).message).toBe(`unclosed tag at line 1 col 10:

  template {%
           ^`);
      expect(ex instanceof Error).toBe(true);
    }
  });

  it("error while parsing - compile", () => {
    try {
      chuck.compile("template {%");
    } catch (ex) {
      expect(ex).toBeInstanceOf(ChuckError);
      expect(ex).toBeInstanceOf(ChuckParseError);
      expect((ex as ChuckParseError).name).toBe("ChuckParser Error");
      expect((ex as ChuckParseError).message).toBe(`unclosed tag at line 1 col 10:

  template {%
           ^`);
      expect(ex instanceof Error).toBe(true);
    }
  });
});

describe("RuntimeErr", () => {
  const chuck = new Chuck({ debug: true });

  it("error throws correctly", () => {
    // Load the template manually since we don't have file system access
    chuck.loadTemplate("runtime-error", "{{ undefinedVariable }}\nLorem Ipsum");

    try {
      chuck.render("runtime-error", {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(ChuckError);
      expect(ex).toBeInstanceOf(ChuckRuntimeError);
      expect((ex as ChuckRuntimeError).name).toBe("ReferenceError");
      expect((ex as ChuckRuntimeError).message).toBe(`line 1
 >> 1| {{ undefinedVariable }}
    2| Lorem Ipsum

undefinedVariable is not defined`);
    }
  });
});


describe("ChuckNameResolutionError", () => {
  const chuck = new Chuck({ debug: true });

  it("error throws correctly", () => {
    const template = "@not-existing-tp";

    try {
      chuck.render(template, {});
    } catch (ex) {
      expect(ex).toBeInstanceOf(ChuckNameResolutionError);
      expect((ex as ChuckNameResolutionError).name).toBe("ChuckNameResolution Error");
      expect((ex as ChuckNameResolutionError).message).toBe(`Failed to get template '${template}'`);
    }
  });
});