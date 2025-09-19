import { Cacher } from "./storage.ts";
import { compile } from "./compile.ts";
import { compileBody, compileToString } from "./compile-string.ts";
import { defaultConfig } from "./config.ts";
import { parse } from "./parse.ts";
import { render, renderString } from "./render.ts";
import { ChuckError, RuntimeErr } from "./err.ts";
import { TemplateFunction } from "./compile.ts";

/* TYPES */
import type { ChuckConfig } from "./config.ts";
/* END TYPES */

export class Chuck {
  constructor(customConfig?: Partial<ChuckConfig>) {
    if (customConfig) {
      this.config = { ...defaultConfig, ...customConfig };
    } else {
      this.config = { ...defaultConfig };
    }

    this.initBuiltinFilters();
  }

  config: ChuckConfig;

  RuntimeErr = RuntimeErr;

  compile = compile;
  compileToString = compileToString;
  compileBody = compileBody;
  parse = parse;
  render = render;
  renderString = renderString;

  templates: Cacher<TemplateFunction> = new Cacher<TemplateFunction>({});

  // Filter registry
  filters: Map<string, Function> = new Map();

  // METHODS

  configure(customConfig: Partial<ChuckConfig>) {
    this.config = { ...this.config, ...customConfig };
  }

  withConfig(customConfig: Partial<ChuckConfig>): this & { config: ChuckConfig } {
    return { ...this, config: { ...this.config, ...customConfig } };
  }

  loadTemplate(
    name: string,
    template: string | TemplateFunction,
  ): void {
    if (typeof template === "string") {
      this.templates.define(name, this.compile(template));
    } else {
      this.templates.define(name, template);
    }
  }

  // Filter methods
  addFilter(name: string, func: Function): void {
    this.filters.set(name, func);
  }

  getFilter(name: string): Function | undefined {
    return this.filters.get(name);
  }

  hasFilter(name: string): boolean {
    return this.filters.has(name);
  }

  removeFilter(name: string): boolean {
    return this.filters.delete(name);
  }

  applyFilters(value: any, filterChain: Array<{name: string, args: any[]}>): any {
    return filterChain.reduce((currentValue, filter) => {
      const filterFunc = this.getFilter(filter.name);
      if (!filterFunc) {
        throw new Error(`Filter '${filter.name}' not found`);
      }
      return filterFunc(currentValue, ...filter.args);
    }, value);
  }


  private initBuiltinFilters(): void {
    // Basic string filters
    this.addFilter('upper', (value: any) => String(value).toUpperCase());
    this.addFilter('lower', (value: any) => String(value).toLowerCase());
    this.addFilter('capitalize', (value: any) => {
      const str = String(value);
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    });
    this.addFilter('trim', (value: any) => String(value).trim());

    // Number filters
    this.addFilter('round', (value: any, decimals = 0) => {
      const num = Number(value);
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    });
    this.addFilter('abs', (value: any) => Math.abs(Number(value)));

    // Array filters
    this.addFilter('length', (value: any) => {
      if (value && typeof value.length !== 'undefined') {
        return value.length;
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length;
      }
      return 0;
    });
    this.addFilter('join', (value: any, separator = ',') => {
      if (Array.isArray(value)) {
        return value.join(separator);
      }
      return String(value);
    });

    // Default filter
    this.addFilter('default', (value: any, defaultValue: any) => {
      return (value === null || value === undefined || value === '') ? defaultValue : value;
    });

    // JSON filter
    this.addFilter('json', (value: any) => JSON.stringify(value));
  }
}

// for instance checking against thrown errors
export { ChuckError };
