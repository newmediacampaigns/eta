<h1 align="center" style="text-align: center; width: fit-content; margin-left: auto; margin-right: auto;">Chuck</h1>

<span align="center">

**🚀 Browser-Optimized Fork: This is a customized version of Eta v3 specifically optimized for browser-only usage with unified includes and simplified template resolution.**

</span>

## Summary

Chuck is a lightweight and blazing fast embedded JS templating engine optimized for browser use. This fork is specifically tailored for browser-only usage with simplified APIs and smaller bundle sizes. It's written in TypeScript and emphasizes great performance, configurability, and ease of use.

### 🌟 Features

- 📦 0 dependencies
- 💡 Only ~3.5 KB minzipped (browser-optimized)
- ⚡️ Written in TypeScript
- 🌐 **Browser-first design** with simplified APIs
- 🚀 Super Fast
- 🔧 Configurable
  - Plugins, custom delimiters
  - **Always-on caching** (no configuration needed)
- 🔨 Powerful
  - Precompilation, **unified includes**
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

Chuck uses Twig-inspired delimiters:

- `{{ }}` - Output/interpolation (escapes HTML by default)
- `{% %}` - Tags/expressions/code blocks
- `{%~ %}` - Raw output (no HTML escaping)

```chuck
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
```chuck
{% for item in items %}
  <li>{{ item }}</li>
{% endfor %}
```

**Key-Value Iteration:**
```chuck
{% for key, value in data %}
  <p>{{ key }}: {{ value }}</p>
{% endfor %}
```

**Complex Expressions:**
```chuck
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
```chuck
{% if it.user.isAdmin %}
  <p>Admin Panel</p>
{% endif %}
```

**If-Else:**
```chuck
{% if it.user.isActive %}
  <span>Active User</span>
{% else %}
  <span>Inactive User</span>
{% endif %}
```

**If-Elsif-Else:**
```chuck
{% if it.user.role === 'admin' %}
  <p>Administrator</p>
{% elsif it.user.role === 'moderator' %}
  <p>Moderator</p>
{% else %}
  <p>Regular User</p>
{% endif %}
```

**Compound Expressions:**
```chuck
{% if (it.user.isActive && it.user.role === 'admin') || it.user.isSuperUser %}
  <p>Admin Access Granted</p>
{% elsif it.user.isActive && (it.user.role === 'moderator' || it.user.role === 'editor') %}
  <p>Staff Access Granted</p>
{% else %}
  <p>Regular Access</p>
{% endif %}
```

**Function Calls:**
```chuck
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
```chuck
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

```chuck
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
const chuck = new Chuck();

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

const result = chuck.renderString(template, {
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

```chuck
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

```chuck
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
const chuck = new Chuck();

// Simple filter
chuck.addFilter('reverse', (text) => {
  return String(text).split('').reverse().join('');
});

// Filter with arguments
chuck.addFilter('repeat', (text, times) => {
  return String(text).repeat(times);
});

// Advanced filters
chuck.addFilter('slugify', (text) => {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
});

chuck.addFilter('currency', (value, symbol = '$', decimals = 2) => {
  return symbol + parseFloat(value).toFixed(decimals);
});

// Usage in templates
chuck.renderString('{{ it.title | slugify }}', { title: 'Hello World!' });
// Output: "hello-world"

chuck.renderString('{{ it.price | currency("€") }}', { price: 19.99 });
// Output: "€19.99"
```

### 🔗 Filter Chaining

Combine multiple filters for complex transformations:

```chuck
{{ it.userInput | trim | lower | capitalize }}
{{ it.items | join(' ') | upper | trim }}
{{ it.tags | length | default(0) }}
```

### 📋 Filter Management API

```javascript
// Add custom filter
chuck.addFilter(name, function);

// Check if filter exists
chuck.hasFilter(name);

// Get filter function
chuck.getFilter(name);

// Remove filter
chuck.removeFilter(name);
```

### 💡 Advanced Filter Example

```javascript
const chuck = new Chuck();

// Register multiple custom filters
chuck.addFilter('excerpt', (text, length = 100) => {
  return text.length > length ? text.substring(0, length) + '...' : text;
});

chuck.addFilter('fileSize', (bytes) => {
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

const result = chuck.renderString(template, {
  title: "my blog post",
  content: "Lorem ipsum dolor sit amet...",
  fileSize: 1048576
});
```

### Browser Usage

Chuck is optimized for browser use with **only ~3.5KB** minified+gzipped:

#### ✨ Browser-Optimized Features

This fork includes special optimizations for browser-only usage:

- **🔗 Unified Include Directive**: No more `includeAsync` - just use `include()`
- **📝 No @ Prefix Required**: Templates can be referenced by simple names like `"header"` instead of `"@header"`
- **🔄 Backward Compatible**: Existing code with `@` prefixes still works
- **💾 Always-On Caching**: Templates are automatically cached - no configuration needed
- **⚡ Simplified Errors**: Browser-optimized error handling without filepath dependencies
- **📦 Smaller Bundle**: Removed server-side filesystem resolution and unnecessary features

**ES Modules (Recommended):**
```html
<script type="module">
  import { Chuck } from './dist/browser.module.mjs';

  const chuck = new Chuck();

  // Direct string rendering
  const result = chuck.renderString('Hi {{ it.name }}!', { name: 'World' });
  document.body.innerHTML = result;

  // Pre-load templates for reuse (no @ prefix needed!)
  chuck.loadTemplate('greeting', 'Hello {{ it.name }}, welcome to {{ it.site }}!');
  chuck.loadTemplate('header', 'Header: {{ it.title }}');
  chuck.loadTemplate('page', 'Page: {%~ include("header", {title: "My Site"}) %} - Content: {{ it.content }}');

  const greeting = chuck.render('greeting', { name: 'Alice', site: 'our site' });
  const page = chuck.render('page', { content: 'Welcome!' });

  // Templates are automatically cached - no configuration needed!
</script>
```

**UMD (Universal):**
```html
<script src="./dist/browser.umd.js"></script>
<script>
  const chuck = new window.chuck.Chuck();

  // Simple rendering
  const result = chuck.renderString('Hi {{ it.name }}!', { name: 'World' });

  // Template with includes (unified directive)
  chuck.loadTemplate('nav', 'Nav: {{ it.links }}');
  const withInclude = chuck.renderString('Page: {%~ include("nav", {links: "Home | About"}) %}', {});

  document.body.innerHTML = result + '<br>' + withInclude;
</script>
```
