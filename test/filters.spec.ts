/* global it, expect, describe */

import { Chuck } from "../src/index";

describe("Twig-like Filters", () => {
  const chuck = new Chuck();

  describe("Basic filter functionality", () => {
    it("applies single filter", () => {
      expect(chuck.renderString("{{ it.name | upper }}", { name: "john" })).toEqual("JOHN");
    });

    it("applies multiple chained filters", () => {
      expect(chuck.renderString("{{ it.name | upper | trim }}", { name: " john " })).toEqual("JOHN");
    });

    it("works without filters", () => {
      expect(chuck.renderString("{{ it.name }}", { name: "john" })).toEqual("john");
    });
  });

  describe("String filters", () => {
    it("upper filter", () => {
      expect(chuck.renderString("{{ it.text | upper }}", { text: "hello world" })).toEqual("HELLO WORLD");
    });

    it("lower filter", () => {
      expect(chuck.renderString("{{ it.text | lower }}", { text: "HELLO WORLD" })).toEqual("hello world");
    });

    it("capitalize filter", () => {
      expect(chuck.renderString("{{ it.text | capitalize }}", { text: "hello WORLD" })).toEqual("Hello world");
    });

    it("trim filter", () => {
      expect(chuck.renderString("{{ it.text | trim }}", { text: "  hello world  " })).toEqual("hello world");
    });
  });

  describe("Number filters", () => {
    it("round filter with default precision", () => {
      expect(chuck.renderString("{{ it.num | round }}", { num: 3.7 })).toEqual("4");
    });

    it("round filter with custom precision", () => {
      expect(chuck.renderString("{{ it.num | round(2) }}", { num: 3.14159 })).toEqual("3.14");
    });

    it("abs filter", () => {
      expect(chuck.renderString("{{ it.num | abs }}", { num: -5.5 })).toEqual("5.5");
    });
  });

  describe("Array and object filters", () => {
    it("length filter for arrays", () => {
      expect(chuck.renderString("{{ it.items | length }}", { items: [1, 2, 3] })).toEqual("3");
    });

    it("length filter for objects", () => {
      expect(chuck.renderString("{{ it.obj | length }}", { obj: { a: 1, b: 2 } })).toEqual("2");
    });

    it("join filter", () => {
      expect(chuck.renderString("{{ it.items | join(' - ') }}", { items: ["a", "b", "c"] })).toEqual("a - b - c");
    });

    it("join filter with default separator", () => {
      expect(chuck.renderString("{{ it.items | join }}", { items: ["a", "b", "c"] })).toEqual("a,b,c");
    });
  });

  describe("Utility filters", () => {
    it("default filter with empty value", () => {
      expect(chuck.renderString("{{ it.empty | default('fallback') }}", { empty: "" })).toEqual("fallback");
    });

    it("default filter with null value", () => {
      expect(chuck.renderString("{{ it.empty | default('fallback') }}", { empty: null })).toEqual("fallback");
    });

    it("default filter with valid value", () => {
      expect(chuck.renderString("{{ it.name | default('fallback') }}", { name: "john" })).toEqual("john");
    });

    it("json filter (escaped)", () => {
      expect(chuck.renderString("{{ it.obj | json }}", { obj: { name: "test" } })).toEqual('{&quot;name&quot;:&quot;test&quot;}');
    });

    it("json filter (raw output)", () => {
      expect(chuck.renderString("{%~ it.obj | json %}", { obj: { name: "test" } })).toEqual('{"name":"test"}');
    });
  });

  describe("Custom filters", () => {
    it("allows adding custom filters", () => {
      chuck.addFilter('reverse', (str: string) => str.split('').reverse().join(''));
      expect(chuck.renderString("{{ it.text | reverse }}", { text: "hello" })).toEqual("olleh");
    });

    it("custom filter with arguments", () => {
      chuck.addFilter('repeat', (str: string, times: number) => str.repeat(times));
      expect(chuck.renderString("{{ it.text | repeat(3) }}", { text: "hi" })).toEqual("hihihi");
    });
  });

  describe("Raw interpolation filters", () => {
    it("applies filters to raw interpolation", () => {
      expect(chuck.renderString("{%~ it.html | upper %}", { html: "<b>bold</b>" })).toEqual("<B>BOLD</B>");
    });
  });

  describe("Filter error handling", () => {
    it("throws error for non-existent filter", () => {
      expect(() => {
        chuck.renderString("{{ it.name | nonexistent }}", { name: "test" });
      }).toThrow("Filter 'nonexistent' not found");
    });
  });

  describe("Complex filter chains", () => {
    it("handles complex filter chains", () => {
      const result = chuck.renderString(
        "{{ it.items | join(' ') | upper | trim }}",
        { items: [" hello ", " world "] }
      );
      expect(result).toEqual("HELLO   WORLD");
    });

    it("filters with multiple arguments", () => {
      chuck.addFilter('slice', (str: string, start: number, end?: number) => {
        return str.slice(start, end);
      });
      expect(chuck.renderString("{{ it.text | slice(1, 4) }}", { text: "hello" })).toEqual("ell");
    });
  });

  describe("Filters in assignments", () => {
    it("applies filter with Twig-style set syntax", () => {
      const result = chuck.renderString(
        "{% set name = it.name | upper %}{{ name }}",
        { name: "john" }
      );
      expect(result).toEqual("JOHN");
    });

    it("applies filter with JS-style let syntax", () => {
      const result = chuck.renderString(
        "{% let name = it.name | upper %}{{ name }}",
        { name: "jane" }
      );
      expect(result).toEqual("JANE");
    });

    it("applies filter with const syntax", () => {
      const result = chuck.renderString(
        "{% const name = it.name | capitalize %}{{ name }}",
        { name: "alice" }
      );
      expect(result).toEqual("Alice");
    });

    it("applies multiple chained filters in assignment", () => {
      const result = chuck.renderString(
        "{% set text = it.text | trim | upper %}{{ text }}",
        { text: "  hello world  " }
      );
      expect(result).toEqual("HELLO WORLD");
    });

    it("applies filter with arguments in assignment", () => {
      const result = chuck.renderString(
        "{% let items = it.items | join(' - ') %}{{ items }}",
        { items: ["a", "b", "c"] }
      );
      expect(result).toEqual("a - b - c");
    });

    it("works with assignment followed by conditional", () => {
      const result = chuck.renderString(
        "{% set name = it.name | upper %}{% if name === 'JOHN' %}Hello {{ name }}{% endif %}",
        { name: "john" }
      );
      expect(result).toEqual("Hello JOHN");
    });

    it("works without filters (regular assignment unchanged)", () => {
      const result = chuck.renderString(
        "{% let x = it.value + 1 %}{{ x }}",
        { value: 5 }
      );
      expect(result).toEqual("6");
    });
  });
});