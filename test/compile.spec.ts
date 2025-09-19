/* global it, expect, describe */

import { Chuck } from "../src/index";

const chuck = new Chuck();

const fs = require("fs"),
  path = require("path"),
  filePath = path.join(__dirname, "templates/complex.eta");

const complexTemplate = fs.readFileSync(filePath, "utf8");

describe("Compile test", () => {
  it("parses a simple template", () => {
    const str = chuck.compile("hi {{ hey }}");
    expect(str).toBeTruthy();
  });

  it("works with plain string templates", () => {
    const str = chuck.compile("hi this is a template");
    expect(str).toBeTruthy();
  });

  it("compiles complex template", () => {
    const str = chuck.compile(complexTemplate);
    expect(str).toBeTruthy();
  });

  test("throws with bad inner JS syntax", () => {
    expect(() => {
      chuck.compile("{% hi (=h) %}");
    }).toThrow();
  });
});
