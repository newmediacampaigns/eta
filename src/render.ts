import { EtaNameResolutionError } from "./err.ts";

/* TYPES */
import type { Options } from "./config.ts";
import type { TemplateFunction } from "./compile.ts";
import type { Eta } from "./core.ts";
/* END TYPES */

function handleCache(
  this: Eta,
  template: string,
  options: Partial<Options>,
): TemplateFunction {
  const templateStore = options && options.async
    ? this.templatesAsync
    : this.templatesSync;

  // For browser-only use, always assume internal storage
  // Try the template name as-is first
  let cachedTemplate = templateStore.get(template);
  
  // If not found and doesn't start with @, try with @ prefix for backward compatibility
  if (!cachedTemplate && !template.startsWith('@')) {
    cachedTemplate = templateStore.get('@' + template);
  }
  
  // If not found and starts with @, try without @ prefix
  if (!cachedTemplate && template.startsWith('@')) {
    cachedTemplate = templateStore.get(template.slice(1));
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
  template: string | TemplateFunction, // template name or template function
  data: T,
  meta?: Partial<Options>,
): string | Promise<string> {
  let templateFn: TemplateFunction;
  const options = { ...meta };
  const isAsync = options.async;

  if (typeof template === "string") {
    templateFn = handleCache.call(this, template, options);
  } else {
    templateFn = template;
  }

  const res = templateFn.call(this, data, options);

  return isAsync ? Promise.resolve(res) : res;
}

export function renderAsync<T extends object>(
  this: Eta,
  template: string | TemplateFunction, // template name or template function
  data: T,
  meta?: Partial<Options>,
): Promise<string> {
  return render.call(this, template, data, { ...meta, async: true }) as Promise<string>;
}

export function renderString<T extends object>(
  this: Eta,
  template: string,
  data: T,
  meta?: Partial<Options>,
): string | Promise<string> {
  const options = { ...meta };
  const isAsync = options.async;
  const templateFn = this.compile(template, { async: isAsync });

  return render.call(this, templateFn, data, options);
}

export function renderStringAsync<T extends object>(
  this: Eta,
  template: string,
  data: T,
  meta?: Partial<Options>,
): Promise<string> {
  return renderString.call(this, template, data, { ...meta, async: true }) as Promise<string>;
}
