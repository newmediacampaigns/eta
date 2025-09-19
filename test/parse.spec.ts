/* global it, expect, describe */

import { Chuck } from "../src/index";

const chuck = new Chuck();

const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "templates/complex.eta");

const complexTemplate = fs.readFileSync(filePath, "utf8");

describe("parse test", () => {
  it("parses a simple template", () => {
    const buff = chuck.parse("hi {{ hey }}");
    expect(buff).toEqual(["hi ", { val: "hey", t: "i" }]);
  });

  it("parses a raw tag", () => {
    const buff = chuck.parse("hi {%~ hey %}");
    expect(buff).toEqual(["hi ", { val: "hey", t: "r" }]);
  });

  it("parses basic interpolation", () => {
    const buff = chuck.parse("hi {{ hey }} there");
    expect(buff).toEqual(["hi ", { val: "hey", t: "i", filters: undefined }, " there"]);
  });

  it("works with multiline comments", () => {
    const buff = chuck.parse("hi {% /* comment contains delimiter %> */ %}");
    expect(buff).toEqual(["hi ", { val: "/* comment contains delimiter %> */", t: "e" }]);
  });

  it("parses with simple template literal", () => {
    const buff = chuck.parse("hi {{ `template %> ${value}` }}");
    expect(buff).toEqual(["hi ", { val: "`template %> ${value}`", t: "i" }]);
  });

  it("compiles complex template", () => {
    const buff = chuck.parse(complexTemplate);
    expect(buff).toEqual([
      "Hi\\n",
      { t: "e", val: 'console.log("Hope you like Eta!")' },
      "\\n",
      { t: "i", val: "it.htmlstuff" },
      "\\n\\n",
      { t: "e", val: "for (var key in it.obj) {" },
      "\\nValue: ",
      { t: "i", val: "it.obj[key]" },
      ", Key: ",
      { t: "i", val: "key" },
      "\\n\\n",
      { t: "e", val: "if (key === 'thirdchild') {" },
      "\\n  ",
      {
        t: "e",
        val: "for (var i = 0, arr = it.obj[key]; i < arr.length; i++) {",
      },
      "\\n      Salutations! Index: ",
      { t: "i", val: "i" },
      ", parent key: ",
      { t: "i", val: "key" },
      "\\n      \\n  ",
      { t: "e", val: "}" },
      "\\n",
      { t: "e", val: "}" },
      "\\n",
      { t: "e", val: "}" },
      "\\n\\nThis is a partial: ",
      { t: "r", val: 'include("mypartial")' },
      "\\n",
    ]);
  });

  test("throws with unclosed tag", () => {
    expect(() => {
      chuck.parse('{%hi("hey")');
    }).toThrowError("hi");
  });

  test("throws with unclosed single-quote string", () => {
    expect(() => {
      chuck.parse("{{ ' }}");
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ ' }}
     ^`);
  });

  test("throws with unclosed double-quote string", () => {
    expect(() => {
      chuck.parse('{{ " }}');
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ " }}
     ^`);
  });

  test("throws with unclosed template literal", () => {
    expect(() => {
      chuck.parse("{{ ` }}");
    }).toThrowError(`unclosed string at line 1 col 4:

  {{ \` }}
     ^`);
  });

  test("throws with unclosed multi-line comment", () => {
    expect(() => {
      chuck.parse("{{ /* }}");
    }).toThrowError(`unclosed comment at line 1 col 4:

  {{ /* }}
     ^`);
  });
});
