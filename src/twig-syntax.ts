import type { EtaConfig } from "./config.ts";

/**
 * Simple Twig-like syntax preprocessor
 * Transforms basic Twig syntax to JavaScript before parsing
 */

export interface TwigSyntaxPlugin {
  processTemplate: (template: string, config: EtaConfig) => string;
}

/**
 * Transform Twig-like for loops to JavaScript
 * {% for key in items %} → {% for (let key of it.items) { %}
 * {% for key, value in items %} → {% for (let [key, value] of Object.entries(it.items)) { %}
 * {% endfor %} → {% } %}
 */
function transformForLoops(template: string): string {
  // Only transform Twig-style for loops (not JavaScript syntax)
  // Handle key-value for loops first (more specific pattern)
  template = template.replace(/\{\%\s*for\s+(\w+)\s*,\s*(\w+)\s+in\s+(\w+)\s*\%\}/g, (_, key, value, items) => {
    return `{% for (let [${key}, ${value}] of Object.entries(it.${items})) { %}`;
  });

  // Handle simple for loops (but not JavaScript syntax like "for (var key in obj)")
  template = template.replace(/\{\%\s*for\s+(\w+)\s+in\s+(\w+)\s*\%\}/g, (_, key, items) => {
    return `{% for (let ${key} of it.${items}) { %}`;
  });

  // Transform endfor
  template = template.replace(/\{\%\s*endfor\s*\%\}/g, '{% } %}');

  return template;
}

/**
 * Transform Twig-like if statements to JavaScript
 * {% if expression %} → {% if (expression) { %}
 * {% elsif expression %} → {% } else if (expression) { %}
 * {% else %} → {% } else { %}
 * {% endif %} → {% } %}
 */
function transformIfStatements(template: string): string {
  // Only transform Twig-style if statements (not JavaScript syntax)
  // Skip if the condition already has parentheses and curly braces
  template = template.replace(/\{\%\s*if\s+(?!\()([^%{]+?)(?!\s*\{\s*)\s*\%\}/g, (_, condition) => {
    const cleanCondition = condition.trim();
    return `{% if (${cleanCondition}) { %}`;
  });

  // Transform elsif statements (Twig uses elsif, not elseif)
  template = template.replace(/\{\%\s*elsif\s+(?!\()([^%{]+?)(?!\s*\{\s*)\s*\%\}/g, (_, condition) => {
    const cleanCondition = condition.trim();
    return `{% } else if (${cleanCondition}) { %}`;
  });

  // Transform else statements (only if not already JavaScript syntax)
  template = template.replace(/\{\%\s*else\s*(?!\{)\%\}/g, '{% } else { %}');

  // Transform endif statements
  template = template.replace(/\{\%\s*endif\s*\%\}/g, '{% } %}');

  return template;
}

/**
 * Main transformation function
 */
export function transformTwigSyntax(template: string): string {
  let transformed = template;

  // Apply transformations in order
  transformed = transformForLoops(transformed);
  transformed = transformIfStatements(transformed);

  return transformed;
}

/**
 * Plugin object for use with Eta
 */
export const twigSyntaxPlugin: TwigSyntaxPlugin = {
  processTemplate: transformTwigSyntax
};