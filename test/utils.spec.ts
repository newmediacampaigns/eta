/* global it, expect, describe */

import { XMLEscape } from "../src/utils";

describe("HTML Escape", () => {
  it("properly escapes HTML characters", () => {
    expect(XMLEscape("<p>HTML</p>")).toBe("&lt;p&gt;HTML&lt;/p&gt;");
    expect(XMLEscape("no html here")).toBe("no html here");
  });
});