/* global it, expect, describe */

import { Chuck } from "../src/index";

describe("Config Tests", () => {
  it("default tags work", () => {
    const chuck = new Chuck();
    const res = chuck.renderString("hi {{ it.name }}", { name: "Ben" });
    expect(res).toEqual("hi Ben");
  });

  it("no autoescape", () => {
    const chuck = new Chuck({ autoEscape: false });
    const res = chuck.renderString("{{ it.html }}", { html: "<p>Hi</p>" });
    expect(res).toEqual("<p>Hi</p>"); // not escaped
  });

  it("default filter function stringifies data", () => {
    const chuck = new Chuck();

    expect(chuck.config.filterFunction({ a: 1 })).toEqual("[object Object]");
  });

  it("filter function", () => {
    const template = "My favorite food is {{ it.fav }}";
    const baseChuck = new Chuck();

    expect(baseChuck.renderString(template, {})).toEqual("My favorite food is undefined");

    const chuckWithSimpleFilter = new Chuck({
      autoFilter: true,
      // turn every value into "apples"
      filterFunction: (_val) => "apples",
    });

    expect(chuckWithSimpleFilter.renderString(template, {})).toEqual("My favorite food is apples");
  });

  it("complex filter function", () => {
    let timesFilterCalled = 0;
    const chuck = new Chuck({
      autoFilter: true,
      filterFunction: function () {
        timesFilterCalled++;
        if (timesFilterCalled <= 1) {
          return "The first";
        } else {
          return "another";
        }
      },
    });

    expect(chuck.renderString("{{ it.val1 }}, {%~ it.val2 %}, {%~ it.val3 %}", {})).toEqual(
      "The first, another, another"
    );
  });

  it("withConfig", () => {
    const chuck = new Chuck();

    const res = chuck
      .withConfig({ autoEscape: false })
      .renderString("{{ it.html }}", { html: "<p>Test</p>" });

    expect(res).toEqual("<p>Test</p>");

    // the original config should remain unchanged
    expect(chuck.config.autoEscape).toEqual(true);
  });

  it("configure", () => {
    const chuck = new Chuck();

    chuck.configure({ autoEscape: false });

    const res = chuck.renderString("{{ it.html }}", { html: "<p>Test</p>" });

    expect(res).toEqual("<p>Test</p>");

    // the original config should have changed
    expect(chuck.config.autoEscape).toEqual(false);
  });
});