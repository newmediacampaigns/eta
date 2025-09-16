import type { EtaConfig } from "./config.ts";

/**
 * Takes a string within a template and trims it, based on the preceding tag's whitespace control and `config.autoTrim`
 */

export function trimWS(
  str: string,
  config: EtaConfig,
  wsLeft: string | false,
  wsRight?: string | false,
): string {
  let leftTrim: string | boolean = config.autoTrim;
  let rightTrim: string | boolean = config.autoTrim;

  // Override with tag-specific trimming
  if (wsLeft || wsLeft === false) {
    leftTrim = wsLeft;
  }

  if (wsRight || wsRight === false) {
    rightTrim = wsRight;
  }

  if (!rightTrim && !leftTrim) {
    return str;
  }

  // Handle different trim modes
  if (leftTrim === "_") {
    str = str.trimStart();
  } else if (leftTrim === "-") {
    str = str.replace(/^(?:\r\n|\n|\r)/, "");
  } else if (leftTrim === true) {
    str = str.trimStart();
  }

  if (rightTrim === "_") {
    str = str.trimEnd();
  } else if (rightTrim === "-") {
    str = str.replace(/(?:\r\n|\n|\r)$/, "");
  } else if (rightTrim === true) {
    str = str.trimEnd();
  }

  return str;
}

/**
 * A map of special HTML characters to their XML-escaped equivalents
 */

const escMap: { [key: string]: string } = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function replaceChar(s: string): string {
  return escMap[s];
}

/**
 * XML-escapes an input value after converting it to a string
 *
 * @param str - Input value (usually a string)
 * @returns XML-escaped string
 */

export function XMLEscape(str: unknown): string {
  // To deal with XSS. Based on Escape implementations of Mustache.JS and Marko, then customized.
  const newStr = String(str);
  if (/[&<>"']/.test(newStr)) {
    return newStr.replace(/[&<>"']/g, replaceChar);
  } else {
    return newStr;
  }
}
