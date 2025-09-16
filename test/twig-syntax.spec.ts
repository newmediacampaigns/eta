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
  });

  describe("Twig Syntax Control", () => {
    it("allows disabling Twig syntax", () => {
      const customEta = new Eta();
      customEta.disableTwigSyntax();

      const template = "{% for item in items %}{{ item }}{% endfor %}";

      // Should not transform Twig syntax when disabled
      expect(() => {
        customEta.renderString(template, { items: ['a'] });
      }).toThrow(); // Will throw because "for item in items" is not valid JS
    });

    it("allows re-enabling Twig syntax", () => {
      const customEta = new Eta();
      customEta.disableTwigSyntax();
      customEta.enableTwigSyntax();

      const template = "{% for item in items %}{{ item }}{% endfor %}";
      const result = customEta.renderString(template, { items: ['test'] }) as string;
      expect(result).toContain('test');
    });
  });
});