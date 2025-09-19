import { ChuckParseError } from "./err.ts";

/* TYPES */
import type { Chuck } from "./core.ts";
import type { ChuckConfig } from "./config.ts";

export type TemplateFunction = (
  this: Chuck,
  data?: object,
  options?: object,
) => string;
/* END TYPES */

/**
 * Takes a template string and returns a template function that can be called with (data, config)
 *
 * @param str - The template string
 * @param options - A custom configuration object (optional)
 */
export function compile(
  this: Chuck,
  str: string,
): TemplateFunction {
  const config: ChuckConfig = this.config;

  try {
    return new Function(
      config.varName,
      "options",
      this.compileToString.call(this, str),
    ) as TemplateFunction; // eslint-disable-line no-new-func
  } catch (e) {
    if (e instanceof SyntaxError) {
      throw new ChuckParseError(
        "Bad template syntax\n\n" +
          e.message +
          "\n" +
          Array(e.message.length + 1).join("=") +
          "\n" +
          this.compileToString.call(this, str) +
          "\n", // This will put an extra newline before the callstack for extra readability
      );
    } else {
      throw e;
    }
  }
}
