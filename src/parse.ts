import { ParseErr } from "./err.ts";
import { trimWS } from "./utils.ts";

/* TYPES */

import type { Eta } from "./core.ts";

export type TagType = "r" | "e" | "i" | "";

export interface TemplateObject {
  t: TagType;
  val: string;
  lineNo?: number;
  filters?: Array<{name: string, args: any[]}>;
}

export type AstObject = string | TemplateObject;

/* END TYPES */

const templateLitReg =
  /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g;

const singleQuoteReg = /'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g;

const doubleQuoteReg = /"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;

/** Escape special regular expression characters inside a string */

function escapeRegExp(string: string) {
  // From MDN
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function getLineNo(str: string, index: number) {
  return str.slice(0, index).split("\n").length;
}

function parseFilters(content: string): {value: string, filters: Array<{name: string, args: any[]}>} {
  const parts = content.split('|');
  if (parts.length === 1) {
    return { value: content.trim(), filters: [] };
  }

  const value = parts[0].trim();
  const filters: Array<{name: string, args: any[]}> = [];

  for (let i = 1; i < parts.length; i++) {
    const filterStr = parts[i].trim();
    const match = filterStr.match(/^(\w+)(?:\((.*)\))?$/);

    if (match) {
      const filterName = match[1];
      const argsStr = match[2];
      let args: any[] = [];

      if (argsStr) {
        try {
          // Simple argument parsing - splits by comma and evaluates basic types
          args = argsStr.split(',').map(arg => {
            arg = arg.trim();
            // Remove quotes for strings
            if ((arg.startsWith('"') && arg.endsWith('"')) ||
                (arg.startsWith("'") && arg.endsWith("'"))) {
              return arg.slice(1, -1);
            }
            // Parse numbers
            if (/^-?\d+(\.\d+)?$/.test(arg)) {
              return parseFloat(arg);
            }
            // Parse booleans
            if (arg === 'true') return true;
            if (arg === 'false') return false;
            if (arg === 'null') return null;
            if (arg === 'undefined') return undefined;
            // Return as string for variables/expressions
            return arg;
          });
        } catch (e) {
          // If parsing fails, treat as single string argument
          args = [argsStr];
        }
      }

      filters.push({ name: filterName, args });
    }
  }

  return { value, filters };
}

export function parse(this: Eta, str: string): Array<AstObject> {
  const config = this.config;

  let buffer: Array<AstObject> = [];
  let trimLeftOfNextStr: string | false = false;
  let lastIndex = 0;
  const parseOptions = config.parse;

  if (config.plugins) {
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      if (plugin.processTemplate) {
        str = plugin.processTemplate(str, config);
      }
    }
  }


  templateLitReg.lastIndex = 0;
  singleQuoteReg.lastIndex = 0;
  doubleQuoteReg.lastIndex = 0;

  function pushString(strng: string, shouldTrimRightOfString?: string | false) {
    if (strng) {
      // if string is truthy it must be of type 'string'

      strng = trimWS(
        strng,
        config,
        trimLeftOfNextStr, // this will only be false on the first str, the next ones will be null or undefined
        shouldTrimRightOfString,
      );

      if (strng) {
        // replace \ with \\, ' with \'
        // we're going to convert all CRLF to LF so it doesn't take more than one replace

        strng = strng.replace(/\\|'/g, "\\$&").replace(/\r\n|\n|\r/g, "\\n");

        buffer.push(strng);
      }
    }
  }

  const prefixes = [
    parseOptions.exec,
    parseOptions.interpolate,
    parseOptions.raw,
  ].reduce(function (
    accumulator,
    prefix,
  ) {
    if (accumulator && prefix) {
      return accumulator + "|" + escapeRegExp(prefix);
    } else if (prefix) {
      // accumulator is falsy
      return escapeRegExp(prefix);
    } else {
      // prefix and accumulator are both falsy
      return accumulator;
    }
  }, "");

  // Create regex for both tag types: {% %} for expressions/code and {{ }} for output
  const parseOpenReg = new RegExp(
    "(" + escapeRegExp(config.tags[0]) + "(-|_)?\\s*(" + prefixes + ")?\\s*)" + 
    "|(" + escapeRegExp(config.outputTags[0]) + "(-|_)?\\s*)",
    "g",
  );

  const parseCloseReg = new RegExp(
    "'|\"|`|\\/\\*|(\\s*(-|_)?" + escapeRegExp(config.tags[1]) + ")" +
    "|(\\s*(-|_)?" + escapeRegExp(config.outputTags[1]) + ")",
    "g",
  );

  let m;

  while ((m = parseOpenReg.exec(str))) {
    const precedingString = str.slice(lastIndex, m.index);

    lastIndex = m[0].length + m.index;

    // Determine if this is a tag block {% %} or output block {{ }}
    const isOutputTag = m[4] !== undefined; // {{ }} match group
    const wsLeft = isOutputTag ? m[5] : m[2]; // whitespace trimming
    const prefix = isOutputTag ? "=" : (m[3] || ""); // output tags default to interpolation, tag blocks use prefix

    pushString(precedingString, wsLeft);

    parseCloseReg.lastIndex = lastIndex;
    let closeTag;
    let currentObj: AstObject | false = false;

    while ((closeTag = parseCloseReg.exec(str))) {
      if (closeTag[1] || closeTag[3]) {
        const content = str.slice(lastIndex, closeTag.index);

        parseOpenReg.lastIndex = lastIndex = parseCloseReg.lastIndex;

        trimLeftOfNextStr = closeTag[2] || closeTag[4];

        const currentType: TagType = prefix === parseOptions.exec
          ? "e"
          : prefix === parseOptions.raw
          ? "r"
          : prefix === parseOptions.interpolate
          ? "i"
          : "";

        // Parse filters for interpolation and raw types
        if (currentType === "i" || currentType === "r") {
          const parsed = parseFilters(content);
          currentObj = {
            t: currentType,
            val: parsed.value,
            filters: parsed.filters.length > 0 ? parsed.filters : undefined
          };
        } else {
          currentObj = { t: currentType, val: content };
        }
        break;
      } else {
        const char = closeTag[0];
        if (char === "/*") {
          const commentCloseInd = str.indexOf("*/", parseCloseReg.lastIndex);

          if (commentCloseInd === -1) {
            ParseErr("unclosed comment", str, closeTag.index);
          }
          parseCloseReg.lastIndex = commentCloseInd;
        } else if (char === "'") {
          singleQuoteReg.lastIndex = closeTag.index;

          const singleQuoteMatch = singleQuoteReg.exec(str);
          if (singleQuoteMatch) {
            parseCloseReg.lastIndex = singleQuoteReg.lastIndex;
          } else {
            ParseErr("unclosed string", str, closeTag.index);
          }
        } else if (char === '"') {
          doubleQuoteReg.lastIndex = closeTag.index;
          const doubleQuoteMatch = doubleQuoteReg.exec(str);

          if (doubleQuoteMatch) {
            parseCloseReg.lastIndex = doubleQuoteReg.lastIndex;
          } else {
            ParseErr("unclosed string", str, closeTag.index);
          }
        } else if (char === "`") {
          templateLitReg.lastIndex = closeTag.index;
          const templateLitMatch = templateLitReg.exec(str);
          if (templateLitMatch) {
            parseCloseReg.lastIndex = templateLitReg.lastIndex;
          } else {
            ParseErr("unclosed string", str, closeTag.index);
          }
        }
      }
    }
    if (currentObj) {
      if (config.debug) {
        currentObj.lineNo = getLineNo(str, m.index);
      }
      buffer.push(currentObj);
    } else {
      ParseErr("unclosed tag", str, m.index);
    }
  }

  pushString(str.slice(lastIndex, str.length), false);

  if (config.plugins) {
    for (let i = 0; i < config.plugins.length; i++) {
      const plugin = config.plugins[i];
      if (plugin.processAST) {
        buffer = plugin.processAST(buffer, config);
      }
    }
  }

  return buffer;
}
