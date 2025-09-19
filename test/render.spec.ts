/* global it, expect, describe */

import { Chuck } from "../src/index";

describe("basic functionality", () => {
  const chuck = new Chuck();

  it("renderString: template compiles", () => {
    expect(chuck.renderString("Hi {{ it.name}}", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace"
    );
  });
  it("renderString: basic interpolation", () => {
    expect(chuck.renderString("Hi {{ it.name }}!", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace!"
    );
  });
  it("render: passing in a template function", () => {
    expect(chuck.render(chuck.compile("Hi {{ it.name }}!"), { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace!"
    );
  });
});

describe("render caching", () => {
  const chuck = new Chuck(); // caching is always enabled in browser-optimized version

  chuck.loadTemplate("@template1", "Hi {{it.name}}");

  it("Simple template caches", () => {
    expect(chuck.render("@template1", { name: "Ada Lovelace" })).toEqual("Hi Ada Lovelace");

    expect(chuck.templates.get("@template1")).toBeTruthy();
  });

  it("throws if template doesn't exist", () => {
    expect(() => {
      chuck.render("@should-error", {});
    }).toThrow(/Failed to get template/);
  });
});


describe("useWith", () => {
  it("Puts `it` in global scope with env.useWith", () => {
    const chuckWithUseWith = new Chuck({ useWith: true });

    expect(chuckWithUseWith.renderString("Hi {{name}}", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace"
    );
  });
});

describe("layouts", () => {
  const chuck = new Chuck();

  it("Layouts are called with arguments if they're provided", () => {
    chuck.loadTemplate(
      "@my-layout",
      `{{ it.title }} - {%~ it.body %} - {%~ it.content %} - {%~ it.randomNum %}`
    );

    const res = chuck.renderString(
      `{% layout("@my-layout", { title: 'Nifty title', content: 'Nice content'}) %}This is a layout`,
      { title: "Cool Title", randomNum: 3 }
    );

    // Note that layouts automatically accept the data of the template which called them,
    // after it is merged with `it` and { body:__chuck.res }

    expect(res).toEqual("Nifty title - This is a layout - Nice content - 3");
  });
});

