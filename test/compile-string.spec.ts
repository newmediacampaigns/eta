/* global it, expect, describe */

import { Chuck } from "../src/index";

const chuck = new Chuck();

const fs = require("fs"),
  path = require("path"),
  filePath = path.join(__dirname, "templates/complex.eta");

const complexTemplate = fs.readFileSync(filePath, "utf8");

describe("Compile to String test", () => {
  it("compiles a simple template", () => {
    const str = chuck.compileToString("hi {{ it.name }}");
    expect(str).toEqual(`
let include = (template, data) => this.render(template, data, options);

let __chuck = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction};

function layout(path, data) {
  __chuck.layout = path;
  __chuck.layoutData = data;
}

__chuck.res+='hi '
__chuck.res+=__chuck.e(it.name)

if (__chuck.layout) {
  __chuck.res = include (__chuck.layout, {...it, body: __chuck.res, ...__chuck.layoutData});
}

return __chuck.res;
`);
  });

  it("compiles a simple template with a raw tag", () => {
    const str = chuck.compileToString("hi {%~ it.name %}");
    expect(str).toEqual(`
let include = (template, data) => this.render(template, data, options);

let __chuck = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction};

function layout(path, data) {
  __chuck.layout = path;
  __chuck.layoutData = data;
}

__chuck.res+='hi '
__chuck.res+=it.name

if (__chuck.layout) {
  __chuck.res = include (__chuck.layout, {...it, body: __chuck.res, ...__chuck.layoutData});
}

return __chuck.res;
`);
  });

  it("works with basic interpolation", () => {
    const str = chuck.compileToString("hi {{ it.firstname }} {{ it.lastname }}");
    expect(str).toEqual(`
let include = (template, data) => this.render(template, data, options);

let __chuck = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction};

function layout(path, data) {
  __chuck.layout = path;
  __chuck.layoutData = data;
}

__chuck.res+='hi '
__chuck.res+=__chuck.e(it.firstname)
__chuck.res+=' '
__chuck.res+=__chuck.e(it.lastname)

if (__chuck.layout) {
  __chuck.res = include (__chuck.layout, {...it, body: __chuck.res, ...__chuck.layoutData});
}

return __chuck.res;
`);
  });

  it("compiles complex template", () => {
    const str = chuck.compileToString(complexTemplate);
    expect(str).toEqual(`
let include = (template, data) => this.render(template, data, options);

let __chuck = {res: "", e: this.config.escapeFunction, f: this.config.filterFunction};

function layout(path, data) {
  __chuck.layout = path;
  __chuck.layoutData = data;
}

__chuck.res+='Hi\\n'
console.log("Hope you like Eta!")
__chuck.res+='\\n'
__chuck.res+=__chuck.e(it.htmlstuff)
__chuck.res+='\\n\\n'
for (var key in it.obj) {
__chuck.res+='\\nValue: '
__chuck.res+=__chuck.e(it.obj[key])
__chuck.res+=', Key: '
__chuck.res+=__chuck.e(key)
__chuck.res+='\\n\\n'
if (key === 'thirdchild') {
__chuck.res+='\\n  '
for (var i = 0, arr = it.obj[key]; i < arr.length; i++) {
__chuck.res+='\\n      Salutations! Index: '
__chuck.res+=__chuck.e(i)
__chuck.res+=', parent key: '
__chuck.res+=__chuck.e(key)
__chuck.res+='\\n      \\n  '
}
__chuck.res+='\\n'
}
__chuck.res+='\\n'
}
__chuck.res+='\\n\\nThis is a partial: '
__chuck.res+=include("mypartial")
__chuck.res+='\\n'

if (__chuck.layout) {
  __chuck.res = include (__chuck.layout, {...it, body: __chuck.res, ...__chuck.layoutData});
}

return __chuck.res;
`);
  });
});
