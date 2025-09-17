import { EtaNameResolutionError } from "./err.ts";

/* TYPES */
import type { TemplateFunction } from "./compile.ts";
import type { Eta } from "./core.ts";
/* END TYPES */

function handleCache(
  this: Eta,
  template: string,
): TemplateFunction {
  // Try the template name as-is first
  let cachedTemplate = this.templates.get(template);

  // If not found and doesn't start with @, try with @ prefix for backward compatibility
  if (!cachedTemplate && !template.startsWith('@')) {
    cachedTemplate = this.templates.get('@' + template);
  }

  // If not found and starts with @, try without @ prefix
  if (!cachedTemplate && template.startsWith('@')) {
    cachedTemplate = this.templates.get(template.slice(1));
  }

  if (cachedTemplate) {
    return cachedTemplate;
  } else {
    throw new EtaNameResolutionError(
      "Failed to get template '" + template + "'",
    );
  }
}

export function render<T extends object>(
  this: Eta,
  template: string | TemplateFunction,
  data: T,
  meta?: object,
): string {
  let templateFn: TemplateFunction;
  const options = { ...meta };

  if (typeof template === "string") {
    templateFn = handleCache.call(this, template);
  } else {
    templateFn = template;
  }

  return templateFn.call(this, data, options);
}

export function renderString<T extends object>(
  this: Eta,
  template: string,
  data: T,
  meta?: object,
): string {
  const options = { ...meta };
  const templateFn = this.compile(template);

  return render.call(this, templateFn, data, options);
}
