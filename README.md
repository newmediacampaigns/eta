<p align="center">
  <img align="center" width="50%" src="https://github.com/eta-dev/eta/assets/25597854/041dbe34-883b-459b-8607-c787815c441a">
</p>

<h1 align="center" style="text-align: center; width: fit-content; margin-left: auto; margin-right: auto;">eta (η)</h1>

<p align="center">
  <a href="https://eta.js.org">Documentation</a> -
  <a href="https://discord.gg/27gGncJYE2">Chat</a> -
  <a href="https://runkit.com/nebrelbug/eta-v3">RunKit Demo</a> -
  <a href="https://eta.js.org/playground">Playground</a>
</p>

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[logo]: https://img.shields.io/badge/all_contributors-10-orange.svg "Number of contributors on All-Contributors"

<!-- ALL-CONTRIBUTORS-BADGE:END -->

<span align="center">

[![GitHub package.json version (main)](https://img.shields.io/github/package-json/v/eta-dev/eta/main?label=current%20version)](https://www.npmjs.com/package/eta)
[![GitHub Actions Status](https://github.com/eta-dev/eta/actions/workflows/test.yml/badge.svg)](https://github.com/eta-dev/eta/actions)
[![All Contributors][logo]](#contributors-)
[![Coveralls](https://img.shields.io/coveralls/eta-dev/eta.svg?branch=main)](https://coveralls.io/github/eta-dev/eta?branch=main)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg)](https://paypal.me/bengubler)

</span>

<span align="center">

**🚀 Browser-Optimized Fork: This is a customized version of Eta v3 specifically optimized for browser-only usage with unified includes and simplified template resolution.**

</span>

## Summary

Eta is a lightweight and blazing fast embedded JS templating engine optimized for browser use. This fork is specifically tailored for browser-only usage with simplified APIs and smaller bundle sizes. It's written in TypeScript and emphasizes great performance, configurability, and ease of use.

### 🌟 Features

- 📦 0 dependencies
- 💡 Only ~3.7 KB minzipped (browser-optimized)
- ⚡️ Written in TypeScript
- 🌐 **Browser-first design** with simplified APIs
- 🚀 Super Fast
- 🔧 Configurable
  - Plugins, custom delimiters
  - **Always-on caching** (no configuration needed)
- 🔨 Powerful
  - Precompilation, **unified includes**, async support
  - **Layout support**!
  - **No @ prefix required** for template names
  - **Twig-like syntax** for familiar for loops and conditionals
  - **Twig-inspired filters** with pipe syntax
  - **Simplified error handling** for browser environments
- 🔥 Reliable
  - Better quotes/comments support
    - _ex._ `{{ someval + "string }}" }}` compiles correctly, while it fails with doT or EJS
  - Great error reporting
- ⚡️ Exports ES Modules as well as UMD
- 📝 Easy template syntax

## Template Syntax

Eta uses Twig-inspired delimiters:

- `{{ }}` - Output/interpolation (escapes HTML by default)
- `{% %}` - Tags/expressions/code blocks  
- `{%~ %}` - Raw output (no HTML escaping)

```eta
<h1>{{ it.title }}</h1>

{% for (var i = 0; i < it.items.length; i++) { %}
  <p>{{ it.items[i].name }}: {%~ it.items[i].description %}</p>
{% } %}

{% if (it.user.isAdmin) { %}
  <p>Welcome, admin!</p>
{% } %}
```

## Twig-like Syntax Support

This fork includes Twig-inspired syntax for more familiar templating patterns alongside the existing JavaScript syntax:

### ✨ For Loops

**Simple Iteration:**
```eta
{% for item in items %}
  <li>{{ item }}</li>
{% endfor %}
```

**Key-Value Iteration:**
```eta
{% for key, value in data %}
  <p>{{ key }}: {{ value }}</p>
{% endfor %}
```

**Complex Expressions:**
```eta
{% for pagenum in it.middle %}
  <span>Page {{ pagenum }}</span>
{% endfor %}

{% for item in it.getPages() %}
  <div>{{ item }}</div>
{% endfor %}

{% for page in it.pages %}
  <li>{{ page.title }}</li>
{% endfor %}
```

### 🔀 Conditionals

**Basic If Statement:**
```eta
{% if it.user.isAdmin %}
  <p>Admin Panel</p>
{% endif %}
```

**If-Else:**
```eta
{% if it.user.isActive %}
  <span>Active User</span>
{% else %}
  <span>Inactive User</span>
{% endif %}
```

**If-Elsif-Else:**
```eta
{% if it.user.role === 'admin' %}
  <p>Administrator</p>
{% elsif it.user.role === 'moderator' %}
  <p>Moderator</p>
{% else %}
  <p>Regular User</p>
{% endif %}
```

**Compound Expressions:**
```eta
{% if (it.user.isActive && it.user.role === 'admin') || it.user.isSuperUser %}
  <p>Admin Access Granted</p>
{% elsif it.user.isActive && (it.user.role === 'moderator' || it.user.role === 'editor') %}
  <p>Staff Access Granted</p>
{% else %}
  <p>Regular Access</p>
{% endif %}
```

**Function Calls:**
```eta
{% if it.user.hasMethod() || it.user.isAdmin() %}
  <p>Permission Granted</p>
{% elsif it.items.length > 0 && it.hasPermission('view') %}
  <p>Content Available</p>
{% else %}
  <p>No Access</p>
{% endif %}
```

### 💬 Comments

**Twig-style Comments (Single & Multi-line):**
```eta
{# This is a single-line comment #}

{#
  This is a multi-line comment
  that can span multiple lines
  and won't appear in output
#}

Hello {# inline comment #} World
<!-- Outputs: Hello  World -->

{# Comments can contain {{ variables }} and {% code %} that won't be processed #}
```

### 🔄 Backward Compatibility

Both syntaxes work seamlessly together:

```eta
<!-- Twig-style loops -->
{% for item in items %}
  <!-- JavaScript-style conditions -->
  {% if (item.featured) { %}
    <strong>{{ item.name }}</strong>
  {% } else { %}
    {{ item.name }}
  {% } %}
{% endfor %}
```

### 🎯 Complete Example

Here's a comprehensive example combining Twig syntax with filters:

```javascript
const eta = new Eta();

const template = `
<div class="user-profile">
  <h1>{{ it.user.name | upper }}</h1>

  {% if it.user.isActive %}
    <span class="badge active">{{ it.user.status | capitalize }}</span>
  {% else %}
    <span class="badge inactive">Inactive</span>
  {% endif %}

  <div class="stats">
    <p>Posts: {{ it.user.posts | length }}</p>
    <p>Joined: {{ it.user.joinDate | default('Unknown') }}</p>
  </div>

  {% if it.user.posts | length > 0 %}
    <h2>Recent Posts</h2>
    <ul>
      {% for post in posts %}
        <li>
          <strong>{{ post.title | trim }}</strong>
          <small>({{ post.views | default(0) }} views)</small>
          {% if post.featured %}
            <span class="featured">⭐ Featured</span>
          {% endif %}
        </li>
      {% endfor %}
    </ul>
  {% else %}
    <p>No posts yet.</p>
  {% endif %}
</div>
`;

const result = eta.renderString(template, {
  user: {
    name: 'john doe',
    isActive: true,
    status: 'verified',
    joinDate: '2024-01-15',
    posts: [
      { title: '  My First Post  ', views: 42, featured: true },
      { title: 'Another Article', views: null, featured: false }
    ]
  },
  posts: [
    { title: '  My First Post  ', views: 42, featured: true },
    { title: 'Another Article', views: null, featured: false }
  ]
});
```

## Twig-like Filters

This fork includes powerful Twig-inspired filter support with pipe syntax for data transformation:

### ✨ Basic Filter Usage

```eta
{{ it.name | upper }}
{{ it.price | round(2) }}
{{ it.text | trim | capitalize }}
```

### 🔧 Built-in Filters

**String Filters:**
- `upper` - Convert to uppercase
- `lower` - Convert to lowercase
- `capitalize` - Capitalize first letter
- `trim` - Remove whitespace

**Number Filters:**
- `round(decimals)` - Round to specified decimal places
- `abs` - Absolute value

**Array/Object Filters:**
- `length` - Get length of arrays or object keys
- `join(separator)` - Join array elements with separator

**Utility Filters:**
- `default(value)` - Use fallback value if empty/null
- `json` - Convert to JSON string

### 📝 Filter Examples

```eta
<!-- String transformations -->
<h1>{{ it.title | upper }}</h1>
<p>{{ it.description | trim | capitalize }}</p>

<!-- Number formatting -->
<span>Price: ${{ it.price | round(2) }}</span>

<!-- Array operations -->
<p>Items: {{ it.tags | join(', ') }}</p>
<span>Total: {{ it.items | length }} items</span>

<!-- Fallback values -->
<p>{{ it.username | default('Guest') }}</p>

<!-- Raw JSON output -->
<script>const data = {%~ it.config | json %};</script>
```

### 🎯 Custom Filter Registration

```javascript
const eta = new Eta();

// Simple filter
eta.addFilter('reverse', (text) => {
  return String(text).split('').reverse().join('');
});

// Filter with arguments
eta.addFilter('repeat', (text, times) => {
  return String(text).repeat(times);
});

// Advanced filters
eta.addFilter('slugify', (text) => {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
});

eta.addFilter('currency', (value, symbol = '$', decimals = 2) => {
  return symbol + parseFloat(value).toFixed(decimals);
});

// Usage in templates
eta.renderString('{{ it.title | slugify }}', { title: 'Hello World!' });
// Output: "hello-world"

eta.renderString('{{ it.price | currency("€") }}', { price: 19.99 });
// Output: "€19.99"
```

### 🔗 Filter Chaining

Combine multiple filters for complex transformations:

```eta
{{ it.userInput | trim | lower | capitalize }}
{{ it.items | join(' ') | upper | trim }}
{{ it.tags | length | default(0) }}
```

### 📋 Filter Management API

```javascript
// Add custom filter
eta.addFilter(name, function);

// Check if filter exists
eta.hasFilter(name);

// Get filter function
eta.getFilter(name);

// Remove filter
eta.removeFilter(name);
```

### 💡 Advanced Filter Example

```javascript
const eta = new Eta();

// Register multiple custom filters
eta.addFilter('excerpt', (text, length = 100) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
});

eta.addFilter('fileSize', (bytes) => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
});

// Use in complex template
const template = `
<article>
  <h1>{{ it.title | upper }}</h1>
  <p>{{ it.content | excerpt(150) }}</p>
  <small>Size: {{ it.fileSize | fileSize }}</small>
</article>
`;

const result = eta.renderString(template, {
  title: "my blog post",
  content: "Lorem ipsum dolor sit amet...",
  fileSize: 1048576
});
```

## Get Started

_For more thorough documentation, visit [https://eta.js.org](https://eta.js.org)_

### Browser Usage

Eta is optimized for browser use with **only ~3.7KB** minified+gzipped:

#### ✨ Browser-Optimized Features

This fork includes special optimizations for browser-only usage:

- **🔗 Unified Include Directive**: No more `includeAsync` - just use `include()` for both sync and async templates
- **📝 No @ Prefix Required**: Templates can be referenced by simple names like `"header"` instead of `"@header"`
- **🔄 Backward Compatible**: Existing code with `@` prefixes still works
- **💾 Always-On Caching**: Templates are automatically cached - no configuration needed
- **⚡ Simplified Errors**: Browser-optimized error handling without filepath dependencies
- **📦 Smaller Bundle**: Removed server-side filesystem resolution and unnecessary features

**ES Modules (Recommended):**
```html
<script type="module">
  import { Eta } from './dist/browser.module.mjs';
  
  const eta = new Eta();
  
  // Direct string rendering
  const result = eta.renderString('Hi {{ it.name }}!', { name: 'World' });
  document.body.innerHTML = result;
  
  // Pre-load templates for reuse (no @ prefix needed!)
  eta.loadTemplate('greeting', 'Hello {{ it.name }}, welcome to {{ it.site }}!');
  eta.loadTemplate('header', 'Header: {{ it.title }}');
  eta.loadTemplate('page', 'Page: {%~ include("header", {title: "My Site"}) %} - Content: {{ it.content }}');
  
  const greeting = eta.render('greeting', { name: 'Alice', site: 'our site' });
  const page = eta.render('page', { content: 'Welcome!' });
  
  // Templates are automatically cached - no configuration needed!
</script>
```

**UMD (Universal):**
```html
<script src="./dist/browser.umd.js"></script>
<script>
  const eta = new window.eta.Eta();
  
  // Simple rendering
  const result = eta.renderString('Hi {{ it.name }}!', { name: 'World' });
  
  // Template with includes (unified directive)
  eta.loadTemplate('nav', 'Nav: {{ it.links }}');
  const withInclude = eta.renderString('Page: {%~ include("nav", {links: "Home | About"}) %}', {});
  
  document.body.innerHTML = result + '<br>' + withInclude;
</script>
```


## FAQs

<details>
  <summary>
    <b>Where did Eta's name come from?</b>
  </summary>

"Eta" means tiny in Esperanto. Plus, it can be used as an acronym for all sorts of cool phrases: "ECMAScript Template Awesomeness", "Embedded Templating Alternative", etc....

Additionally, Eta is a letter of the Greek alphabet (it stands for all sorts of cool things in various mathematical fields, including efficiency) and is three letters long (perfect for a file extension).

</details>

<br />

## Browser Integrations

<details>
  <summary>
    <b>Visual Studio Code</b>
  </summary>

[@shadowtime2000](https://github.com/shadowtime2000) created [eta-vscode](https://marketplace.visualstudio.com/items?itemName=shadowtime2000.eta-vscode) for syntax highlighting and template editing.

</details>

<details>
  <summary>
    <b>ESLint</b>
  </summary>

[eslint-plugin-eta](https://github.com/eta-dev/eslint-plugin-eta) was created to provide an ESLint processor so you can lint your Eta templates.

</details>

<details>
  <summary>
    <b>Webpack</b>
  </summary>

For Webpack integration in browser applications, you can use Eta templates as part of your build process:

```javascript
// Use Eta to process templates at build time
import { Eta } from 'eta';

const eta = new Eta();
const template = eta.renderString(templateString, data);
```

</details>

<br />

## Browser Projects using `eta`

- [html-bundler-webpack-plugin](https://github.com/webdiscus/html-bundler-webpack-plugin): Webpack plugin to bundle HTML pages from templates, styles and scripts
- Frontend applications using Eta for client-side template rendering
- Browser-based code generators and dynamic content systems
- Single-page applications (SPAs) with dynamic templating needs
- [Add your browser project!](https://github.com/eta-dev/eta/edit/master/README.md)

## Contributors

Made with ❤ by [@nebrelbug](https://github.com/eta-dev) and all these wonderful contributors ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.bengubler.com"><img src="https://avatars3.githubusercontent.com/u/25597854?v=4?s=100" width="100px;" alt="Ben Gubler"/><br /><sub><b>Ben Gubler</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=nebrelbug" title="Code">💻</a> <a href="#question-nebrelbug" title="Answering Questions">💬</a> <a href="https://github.com/eta-dev/eta/commits?author=nebrelbug" title="Documentation">📖</a> <a href="https://github.com/eta-dev/eta/commits?author=nebrelbug" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/clitetailor"><img src="https://avatars1.githubusercontent.com/u/16368559?v=4?s=100" width="100px;" alt="Clite Tailor"/><br /><sub><b>Clite Tailor</b></sub></a><br /><a href="#ideas-clitetailor" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/eta-dev/eta/commits?author=clitetailor" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://twitter.com/ioan_chiriac"><img src="https://avatars2.githubusercontent.com/u/173203?v=4?s=100" width="100px;" alt="Ioan CHIRIAC"/><br /><sub><b>Ioan CHIRIAC</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=ichiriac" title="Code">💻</a> <a href="#ideas-ichiriac" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.linkedin.com/in/craig-morten/"><img src="https://avatars1.githubusercontent.com/u/46491566?v=4?s=100" width="100px;" alt="Craig Morten"/><br /><sub><b>Craig Morten</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=asos-craigmorten" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/trojanh"><img src="https://avatars0.githubusercontent.com/u/22974490?v=4?s=100" width="100px;" alt="Rajan Tiwari"/><br /><sub><b>Rajan Tiwari</b></sub></a><br /><a href="#example-trojanh" title="Examples">💡</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://shadowtime2000.github.io"><img src="https://avatars1.githubusercontent.com/u/66655515?v=4?s=100" width="100px;" alt="shadowtime2000"/><br /><sub><b>shadowtime2000</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=shadowtime2000" title="Code">💻</a> <a href="#ideas-shadowtime2000" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/eta-dev/eta/commits?author=shadowtime2000" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://hamidihamza.com"><img src="https://avatars0.githubusercontent.com/u/22576950?v=4?s=100" width="100px;" alt="Hamza Hamidi"/><br /><sub><b>Hamza Hamidi</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=hamzahamidi" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://calumk.com"><img src="https://avatars1.githubusercontent.com/u/1183991?v=4?s=100" width="100px;" alt="Calum Knott"/><br /><sub><b>Calum Knott</b></sub></a><br /><a href="#ideas-calumk" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nhaef"><img src="https://avatars.githubusercontent.com/u/16443053?v=4?s=100" width="100px;" alt="nhaef"/><br /><sub><b>nhaef</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=nhaef" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://heyhey.to/Gün"><img src="https://avatars.githubusercontent.com/u/74139498?v=4?s=100" width="100px;" alt="Gün"/><br /><sub><b>Gün</b></sub></a><br /><a href="https://github.com/eta-dev/eta/commits?author=gurgunday" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind are welcome!

## Credits

- Original Eta template engine by [Ben Gubler](https://github.com/nebrelbug) and contributors
- Browser-specific optimizations: simplified APIs, removed filesystem dependencies, always-on caching
- Syntax and compilation approach based on EJS, Nunjucks, and doT
- Error handling optimized for browser environments with developer-friendly messages
