/* global it, expect, describe */

import { Eta } from "../src/index";

const eta = new Eta();

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "templates/complex.eta");

const complexTemplate = fs.readFileSync(filePath, "utf8");

describe("parse test", () => {
  it("parses a simple template", () => {
    const buff = eta.parse("hi {{ hey }}");
    expect(buff).toEqual(["hi ", { val: "hey", t: "i" }]);
  });

  it("parses a raw tag", () => {
    const buff = eta.parse("hi {%~ hey %}");
    expect(buff).toEqual(["hi ", { val: "hey", t: "r" }]);
  });

  it("works with whitespace trimming", () => {
    const buff = eta.parse("hi\n{%- = hey-%} {%_ = hi _%}");
    expect(buff).toEqual(["hi", { val: "hey", t: "i" }, { val: "hi", t: "i" }]);
  });

  it("works with multiline comments", () => {
    const buff = eta.parse("hi {% /* comment contains delimiter %> */ %}");
    expect(buff).toEqual(["hi ", { val: "/* comment contains delimiter %> */", t: "e" }]);
  });

  it("parses with simple template literal", () => {
    const buff = eta.parse("hi {{ `template %> ${value}` }}");
    expect(buff).toEqual(["hi ", { val: "`template %> ${value}`", t: "i" }]);
  });

  it("compiles complex template", () => {
    const buff = eta.parse(complexTemplate);
    expect(buff).toEqual([
      "Hi\\n",
      { t: "e", val: 'console.log("Hope you like Eta!")' },
      { t: "i", val: "it.htmlstuff" },
      "\\n",
      { t: "e", val: "for (var key in it.obj) {" },
      "Value: ",
      { t: "i", val: "it.obj[key]" },
      ", Key: ",
      { t: "i", val: "key" },
      "\\n",
      { t: "e", val: "if (key === 'thirdchild') {" },
      "  ",
      {
        t: "e",
        val: "for (var i = 0, arr = it.obj[key]; i < arr.length; i++) {",
      },
      "      Salutations! Index: ",
      { t: "i", val: "i" },
      ", parent key: ",
      { t: "i", val: "key" },
      "      \\n  ",
      { t: "e", val: "}" },
      { t: "e", val: "}" },
      { t: "e", val: "}" },
      "\\nThis is a partial: ",
      { t: "r", val: 'include("mypartial")' },
    ]);
  });

  test("throws with unclosed tag", () => {
    expect(() => {
      eta.parse('{%hi("hey")');
    }).toThrowError("hi");
  });

  test("throws with unclosed single-quote string", () => {
    expect(() => {
      eta.parse("{{ ' }}");
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ ' }}
     ^`);
  });

  test("throws with unclosed double-quote string", () => {
    expect(() => {
      eta.parse('{{ " }}');
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ " }}
     ^`);
  });

  test("throws with unclosed template literal", () => {
    expect(() => {
      eta.parse("{{ ` }}");
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ \` }}
     ^`);
  });

  test("throws with unclosed multi-line comment", () => {
    expect(() => {
      eta.parse("{{ /* }}");
    }).toThrowError(`unclosed comment at line 1 col 4:

  {{ /* }}
     ^`);
  });
});
