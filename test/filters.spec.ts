/* global it, expect, describe */

import { Eta } from "../src/index";

describe("Twig-like Filters", () => {
  const eta = new Eta();

  describe("Basic filter functionality", () => {
    it("applies single filter", () => {
      expect(eta.renderString("{{ it.name | upper }}", { name: "john" })).toEqual("JOHN");
    });

    it("applies multiple chained filters", () => {
      expect(eta.renderString("{{ it.name | upper | trim }}", { name: " john " })).toEqual("JOHN");
    });

    it("works without filters", () => {
      expect(eta.renderString("{{ it.name }}", { name: "john" })).toEqual("john");
    });
  });

  describe("String filters", () => {
    it("upper filter", () => {
      expect(eta.renderString("{{ it.text | upper }}", { text: "hello world" })).toEqual("HELLO WORLD");
    });

    it("lower filter", () => {
      expect(eta.renderString("{{ it.text | lower }}", { text: "HELLO WORLD" })).toEqual("hello world");
    });

    it("capitalize filter", () => {
      expect(eta.renderString("{{ it.text | capitalize }}", { text: "hello WORLD" })).toEqual("Hello world");
    });

    it("trim filter", () => {
      expect(eta.renderString("{{ it.text | trim }}", { text: "  hello world  " })).toEqual("hello world");
    });
  });

  describe("Number filters", () => {
    it("round filter with default precision", () => {
      expect(eta.renderString("{{ it.num | round }}", { num: 3.7 })).toEqual("4");
    });

    it("round filter with custom precision", () => {
      expect(eta.renderString("{{ it.num | round(2) }}", { num: 3.14159 })).toEqual("3.14");
    });

    it("abs filter", () => {
      expect(eta.renderString("{{ it.num | abs }}", { num: -5.5 })).toEqual("5.5");
    });
  });

  describe("Array and object filters", () => {
    it("length filter for arrays", () => {
      expect(eta.renderString("{{ it.items | length }}", { items: [1, 2, 3] })).toEqual("3");
    });

    it("length filter for objects", () => {
      expect(eta.renderString("{{ it.obj | length }}", { obj: { a: 1, b: 2 } })).toEqual("2");
    });

    it("join filter", () => {
      expect(eta.renderString("{{ it.items | join(' - ') }}", { items: ["a", "b", "c"] })).toEqual("a - b - c");
    });

    it("join filter with default separator", () => {
      expect(eta.renderString("{{ it.items | join }}", { items: ["a", "b", "c"] })).toEqual("a,b,c");
    });
  });

  describe("Utility filters", () => {
    it("default filter with empty value", () => {
      expect(eta.renderString("{{ it.empty | default('fallback') }}", { empty: "" })).toEqual("fallback");
    });

    it("default filter with null value", () => {
      expect(eta.renderString("{{ it.empty | default('fallback') }}", { empty: null })).toEqual("fallback");
    });

    it("default filter with valid value", () => {
      expect(eta.renderString("{{ it.name | default('fallback') }}", { name: "john" })).toEqual("john");
    });

    it("json filter (escaped)", () => {
      expect(eta.renderString("{{ it.obj | json }}", { obj: { name: "test" } })).toEqual('{&quot;name&quot;:&quot;test&quot;}');
    });

    it("json filter (raw output)", () => {
      expect(eta.renderString("{%~ it.obj | json %}", { obj: { name: "test" } })).toEqual('{"name":"test"}');
    });
  });

  describe("Custom filters", () => {
    it("allows adding custom filters", () => {
      eta.addFilter('reverse', (str: string) => str.split('').reverse().join(''));
      expect(eta.renderString("{{ it.text | reverse }}", { text: "hello" })).toEqual("olleh");
    });

    it("custom filter with arguments", () => {
      eta.addFilter('repeat', (str: string, times: number) => str.repeat(times));
      expect(eta.renderString("{{ it.text | repeat(3) }}", { text: "hi" })).toEqual("hihihi");
    });
  });

  describe("Raw interpolation filters", () => {
    it("applies filters to raw interpolation", () => {
      expect(eta.renderString("{%~ it.html | upper %}", { html: "<b>bold</b>" })).toEqual("<B>BOLD</B>");
    });
  });

  describe("Filter error handling", () => {
    it("throws error for non-existent filter", () => {
      expect(() => {
        eta.renderString("{{ it.name | nonexistent }}", { name: "test" });
      }).toThrow("Filter 'nonexistent' not found");
    });
  });

  describe("Complex filter chains", () => {
    it("handles complex filter chains", () => {
      const result = eta.renderString(
        "{{ it.items | join(' ') | upper | trim }}",
        { items: [" hello ", " world "] }
      );
      expect(result).toEqual("HELLO   WORLD");
    });

    it("filters with multiple arguments", () => {
      eta.addFilter('slice', (str: string, start: number, end?: number) => {
        return str.slice(start, end);
      });
      expect(eta.renderString("{{ it.text | slice(1, 4) }}", { text: "hello" })).toEqual("ell");
    });
  });
});