/* global it, expect, describe */

import { Eta } from "../src/index";

describe("basic functionality", () => {
  const eta = new Eta();

  it("renderString: template compiles", () => {
    expect(eta.renderString("Hi {{ it.name}}", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace"
    );
  });
  it("renderString: string trimming", () => {
    expect(eta.renderString("Hi \n{%- =it.name_%}  !", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace!"
    );
  });
  it("render: passing in a template function", () => {
    expect(eta.render(eta.compile("Hi \n{%- =it.name_%}  !"), { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace!"
    );
  });
});

describe("render caching", () => {
  const eta = new Eta(); // caching is always enabled in browser-optimized version

  eta.loadTemplate("@template1", "Hi {{it.name}}");

  it("Simple template caches", () => {
    expect(eta.render("@template1", { name: "Ada Lovelace" })).toEqual("Hi Ada Lovelace");

    expect(eta.templatesSync.get("@template1")).toBeTruthy();
  });

  it("throws if template doesn't exist", () => {
    expect(() => {
      eta.render("@should-error", {});
    }).toThrow(/Failed to get template/);
  });
});


describe("useWith", () => {
  it("Puts `it` in global scope with env.useWith", () => {
    const etaWithUseWith = new Eta({ useWith: true });

    expect(etaWithUseWith.renderString("Hi {{name}}", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace"
    );
  });
});

function resolveAfter2Seconds(val: string): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val);
    }, 20);
  });
}

async function asyncTest() {
  const result = await resolveAfter2Seconds("HI FROM ASYNC");
  return result;
}

describe("async", () => {
  const eta = new Eta();

  it("compiles asynchronously", async () => {
    expect(await eta.renderStringAsync("Hi {{ it.name }}", { name: "Ada Lovelace" })).toEqual(
      "Hi Ada Lovelace"
    );
  });

  it("async function works", async () => {
    expect(
      await eta.renderStringAsync("{{ await it.asyncTest() }}", {
        asyncTest: asyncTest,
      })
    ).toEqual("HI FROM ASYNC");
  });

  it("Async template w/ syntax error throws", async () => {
    await expect(async () => {
      await eta.renderStringAsync("{{ @#$%^ }}", {});
    }).rejects.toThrow();
  });
});

describe("layouts", () => {
  const eta = new Eta();

  it("Layouts are called with arguments if they're provided", async () => {
    eta.loadTemplate(
      "@my-layout",
      `{{ it.title }} - {%~ it.body %} - {%~ it.content %} - {%~ it.randomNum %}`
    );

    const res = await eta.renderString(
      `{%- layout("@my-layout", { title: 'Nifty title', content: 'Nice content'}) -%}
This is a layout`,
      { title: "Cool Title", randomNum: 3 }
    );

    // Note that layouts automatically accept the data of the template which called them,
    // after it is merged with `it` and { body:__eta.res }

    expect(res).toEqual("Nifty title - This is a layout - Nice content - 3");
  });
});

