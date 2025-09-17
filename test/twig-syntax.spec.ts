/* global it, expect, describe */

import { Eta } from "../src/index";
import { transformTwigSyntax } from "../src/twig-syntax";

describe("Basic Twig-like Syntax Support", () => {
  const eta = new Eta();

  describe("For Loop Syntax", () => {
    it("transforms simple for loop", () => {
      const template = `
        {% for item in items %}
          <p>{{ item }}</p>
        {% endfor %}
      `;

      const result = eta.renderString(template, { items: ['a', 'b', 'c'] }) as string;
      expect(result.trim()).toContain('<p>a</p>');
      expect(result.trim()).toContain('<p>b</p>');
      expect(result.trim()).toContain('<p>c</p>');
    });

    it("transforms key-value for loop", () => {
      const template = `
        {% for key, value in data %}
          <p>{{ key }}: {{ value }}</p>
        {% endfor %}
      `;

      const result = eta.renderString(template, {
        data: { name: 'John', age: 30 }
      }) as string;
      expect(result).toContain('<p>name: John</p>');
      expect(result).toContain('<p>age: 30</p>');
    });

    it("handles complex expressions in for loops", () => {
      const template1 = `
        {% for pagenum in it.middle %}
          <span>{{ pagenum }}</span>
        {% endfor %}
      `;

      const result1 = eta.renderString(template1, {
        middle: [1, 2, 3]
      }) as string;
      expect(result1).toContain('<span>1</span>');
      expect(result1).toContain('<span>2</span>');
      expect(result1).toContain('<span>3</span>');

      const template2 = `
        {% for item in it.getPages() %}
          <div>{{ item }}</div>
        {% endfor %}
      `;

      const result2 = eta.renderString(template2, {
        getPages: () => ['home', 'about', 'contact']
      }) as string;
      expect(result2).toContain('<div>home</div>');
      expect(result2).toContain('<div>about</div>');
      expect(result2).toContain('<div>contact</div>');

      const template3 = `
        {% for page in it.pages %}
          <li>{{ page.title }}</li>
        {% endfor %}
      `;

      const result3 = eta.renderString(template3, {
        pages: [
          { title: 'Home' },
          { title: 'About' }
        ]
      }) as string;
      expect(result3).toContain('<li>Home</li>');
      expect(result3).toContain('<li>About</li>');
    });
  });

  describe("If/Else Syntax", () => {
    it("transforms simple if statement", () => {
      const template = `
        {% if it.user.isAdmin %}
          <p>Admin Panel</p>
        {% endif %}
      `;

      const result1 = eta.renderString(template, { user: { isAdmin: true } }) as string;
      expect(result1).toContain('<p>Admin Panel</p>');

      const result2 = eta.renderString(template, { user: { isAdmin: false } }) as string;
      expect(result2).not.toContain('<p>Admin Panel</p>');
    });

    it("transforms if-else statement", () => {
      const template = `
        {% if it.user.isActive %}
          <span>Active</span>
        {% else %}
          <span>Inactive</span>
        {% endif %}
      `;

      const result1 = eta.renderString(template, { user: { isActive: true } }) as string;
      expect(result1).toContain('<span>Active</span>');

      const result2 = eta.renderString(template, { user: { isActive: false } }) as string;
      expect(result2).toContain('<span>Inactive</span>');
    });

    it("transforms if-elsif-else statement", () => {
      const template = `
        {% if it.user.role === 'admin' %}
          <p>Administrator</p>
        {% elsif it.user.role === 'moderator' %}
          <p>Moderator</p>
        {% else %}
          <p>User</p>
        {% endif %}
      `;

      const result1 = eta.renderString(template, { user: { role: 'admin' } }) as string;
      expect(result1).toContain('<p>Administrator</p>');

      const result2 = eta.renderString(template, { user: { role: 'moderator' } }) as string;
      expect(result2).toContain('<p>Moderator</p>');

      const result3 = eta.renderString(template, { user: { role: 'viewer' } }) as string;
      expect(result3).toContain('<p>User</p>');
    });

    it("handles compound expressions in templates", () => {
      const template = `
        {% if (it.user.isActive && it.user.role === 'admin') || it.user.isSuperUser %}
          <p>Admin Access</p>
        {% elsif it.user.isActive && (it.user.role === 'moderator' || it.user.role === 'editor') %}
          <p>Staff Access</p>
        {% else %}
          <p>Regular Access</p>
        {% endif %}
      `;

      const result1 = eta.renderString(template, {
        user: { isActive: true, role: 'admin', isSuperUser: false }
      }) as string;
      expect(result1).toContain('<p>Admin Access</p>');

      const result2 = eta.renderString(template, {
        user: { isActive: false, role: 'admin', isSuperUser: true }
      }) as string;
      expect(result2).toContain('<p>Admin Access</p>');

      const result3 = eta.renderString(template, {
        user: { isActive: true, role: 'moderator', isSuperUser: false }
      }) as string;
      expect(result3).toContain('<p>Staff Access</p>');

      const result4 = eta.renderString(template, {
        user: { isActive: false, role: 'user', isSuperUser: false }
      }) as string;
      expect(result4).toContain('<p>Regular Access</p>');
    });

    it("handles function calls in compound expressions", () => {
      const template = `
        {% if it.user.hasMethod() || it.user.isAdmin() %}
          <p>Access Granted</p>
        {% else %}
          <p>Access Denied</p>
        {% endif %}
      `;

      // Test with function that returns true
      const result1 = eta.renderString(template, {
        user: {
          hasMethod: () => true,
          isAdmin: () => false
        }
      }) as string;
      expect(result1).toContain('<p>Access Granted</p>');

      // Test with function that returns false, but isAdmin returns true
      const result2 = eta.renderString(template, {
        user: {
          hasMethod: () => false,
          isAdmin: () => true
        }
      }) as string;
      expect(result2).toContain('<p>Access Granted</p>');

      // Test with both functions returning false
      const result3 = eta.renderString(template, {
        user: {
          hasMethod: () => false,
          isAdmin: () => false
        }
      }) as string;
      expect(result3).toContain('<p>Access Denied</p>');
    });
  });

  describe("Transformation Function", () => {
    it("transforms for loops correctly", () => {
      const input = "{% for item in items %}{{ item }}{% endfor %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% for (let item of it.items) { %}{{ item }}{% } %}");
    });

    it("transforms key-value for loops correctly", () => {
      const input = "{% for key, value in data %}{{ key }}: {{ value }}{% endfor %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% for (let [key, value] of Object.entries(it.data)) { %}{{ key }}: {{ value }}{% } %}");
    });

    it("handles complex expressions in for loop transformations", () => {
      const input1 = "{% for pagenum in it.middle %}{{ pagenum }}{% endfor %}";
      const output1 = transformTwigSyntax(input1);
      expect(output1).toBe("{% for (let pagenum of it.middle) { %}{{ pagenum }}{% } %}");

      const input2 = "{% for item in it.getPages() %}{{ item }}{% endfor %}";
      const output2 = transformTwigSyntax(input2);
      expect(output2).toBe("{% for (let item of it.getPages()) { %}{{ item }}{% } %}");

      const input3 = "{% for key, value in it.data %}{{ key }}{% endfor %}";
      const output3 = transformTwigSyntax(input3);
      expect(output3).toBe("{% for (let [key, value] of Object.entries(it.data)) { %}{{ key }}{% } %}");
    });

    it("transforms if statements correctly", () => {
      const input = "{% if condition %}yes{% else %}no{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if (condition) { %}yes{% } else { %}no{% } %}");
    });

    it("transforms elsif statements correctly", () => {
      const input = "{% if a %}A{% elsif b %}B{% else %}C{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if (a) { %}A{% } else if (b) { %}B{% } else { %}C{% } %}");
    });

    it("handles compound expressions with parentheses", () => {
      const input = "{% if (foo && bar) || xyz %}yes{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if ((foo && bar) || xyz) { %}yes{% } %}");
    });

    it("handles complex boolean expressions", () => {
      const input = "{% if it.user.isActive && (it.user.role === 'admin' || it.user.role === 'moderator') %}admin panel{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if (it.user.isActive && (it.user.role === 'admin' || it.user.role === 'moderator')) { %}admin panel{% } %}");
    });

    it("handles function calls and method chaining", () => {
      const input = "{% if it.items.length > 0 && it.hasPermission('view') %}show items{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if (it.items.length > 0 && it.hasPermission('view')) { %}show items{% } %}");
    });

    it("handles compound expressions with function calls", () => {
      const input = "{% if foo.hasMethod() || foo.isAdmin() %}access granted{% endif %}";
      const output = transformTwigSyntax(input);
      expect(output).toBe("{% if (foo.hasMethod() || foo.isAdmin()) { %}access granted{% } %}");
    });
  });

});