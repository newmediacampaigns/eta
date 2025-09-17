import type { EtaConfig } from "./config.ts";

/**
 * Simple Twig-like syntax preprocessor
 * Transforms basic Twig syntax to JavaScript before parsing
 */

export interface TwigSyntaxPlugin {
  processTemplate: (template: string, config: EtaConfig) => string;
}

/**
 * Determines if we should add "it." prefix to an expression
 */
function shouldAddItPrefix(expression: string): boolean {
  // Don't add if it already starts with "it."
  if (expression.startsWith('it.')) {
    return false;
  }

  // Don't add if it contains parentheses (function calls)
  if (expression.includes('(')) {
    return false;
  }

  // Don't add if it contains dots and doesn't start with "it." (e.g., "it.middle" stays as is)
  if (expression.includes('.')) {
    return false;
  }

  // Don't add if it contains complex operators or spaces
  if (/[+\-*/&|<>=!\s]/.test(expression)) {
    return false;
  }

  // Add it. prefix for simple variable names like "items", "data"
  return /^\w+$/.test(expression);
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
  template = template.replace(/\{\%\s*for\s+(\w+)\s*,\s*(\w+)\s+in\s+([^%]+?)\s*\%\}/g, (_, key, value, expression) => {
    const cleanExpr = expression.trim();
    // Add it. prefix only if not already present and not a complex expression
    const finalExpr = shouldAddItPrefix(cleanExpr) ? `it.${cleanExpr}` : cleanExpr;
    return `{% for (let [${key}, ${value}] of Object.entries(${finalExpr})) { %}`;
  });

  // Handle simple for loops - support full expressions like it.middle, it.getPages(), etc.
  template = template.replace(/\{\%\s*for\s+(\w+)\s+in\s+([^%]+?)\s*\%\}/g, (_, key, expression) => {
    const cleanExpr = expression.trim();
    // Add it. prefix only if not already present and not a complex expression
    const finalExpr = shouldAddItPrefix(cleanExpr) ? `it.${cleanExpr}` : cleanExpr;
    return `{% for (let ${key} of ${finalExpr}) { %}`;
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
  // Transform Twig-style if statements to JavaScript
  // Allow parentheses and compound expressions in conditions
  template = template.replace(/\{\%\s*if\s+([^%]+?)\s*\%\}/g, (match, condition) => {
    const cleanCondition = condition.trim();

    // Skip if this is already JavaScript syntax (has opening brace)
    if (cleanCondition.endsWith('{')) {
      return match; // Return unchanged
    }

    return `{% if (${cleanCondition}) { %}`;
  });

  // Transform elsif statements (Twig uses elsif, not elseif)
  template = template.replace(/\{\%\s*elsif\s+([^%]+?)\s*\%\}/g, (match, condition) => {
    const cleanCondition = condition.trim();

    // Skip if this is already JavaScript syntax (has opening brace)
    if (cleanCondition.endsWith('{')) {
      return match; // Return unchanged
    }

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