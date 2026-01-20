import { ParseErr } from "./err.ts";
import { transformTwigSyntax } from "./twig-syntax.ts";

/* TYPES */

import type { Chuck } from "./core.ts";

export type TagType = "r" | "e" | "i" | "";

export interface AssignmentWithFilters {
  varKeyword: string;  // "let", "const", or "var"
  varName: string;
  value: string;
  filters: Array<{name: string, args: any[]}>;
}

export interface TemplateObject {
  t: TagType;
  val: string;
  lineNo?: number;
  filters?: Array<{name: string, args: any[]}>;
  assignment?: AssignmentWithFilters;
}

export type AstObject = string | TemplateObject;

/* END TYPES */

const templateLitReg =
  /`(?:\\[\s\S]|\${(?:[^{}]|{(?:[^{}]|{[^}]*})*})*}|(?!\${)[^\\`])*`/g;

const singleQuoteReg = /'(?:\\[\s\w"'\\`]|[^\n\r'\\])*?'/g;

const doubleQuoteReg = /"(?:\\[\s\w"'\\`]|[^\n\r"\\])*?"/g;


function getLineNo(str: string, index: number) {
  return str.slice(0, index).split("\n").length;
}

/**
 * Parse assignment statements that may contain filters
 * e.g., "let x = value | upper | trim" or "const name = it.name | capitalize"
 */
function parseAssignmentWithFilters(content: string): AssignmentWithFilters | null {
  // Match: (let|const|var) varName = expression
  const assignmentMatch = content.match(/^\s*(let|const|var)\s+(\w+)\s*=\s*(.+)$/);
  if (!assignmentMatch) {
    return null;
  }

  const [, varKeyword, varName, expression] = assignmentMatch;
  const parsed = parseFilters(expression);

  // Only return assignment info if there are filters
  if (parsed.filters.length === 0) {
    return null;
  }

  return {
    varKeyword,
    varName,
    value: parsed.value,
    filters: parsed.filters
  };
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

export function parse(this: Chuck, str: string): Array<AstObject> {
  const config = this.config;

  let buffer: Array<AstObject> = [];
  let lastIndex = 0;

  // Transform Twig syntax to JavaScript
  str = transformTwigSyntax(str);


  templateLitReg.lastIndex = 0;
  singleQuoteReg.lastIndex = 0;
  doubleQuoteReg.lastIndex = 0;

  function pushString(strng: string) {
    if (strng) {
      // replace \ with \\, ' with \'
      // we're going to convert all CRLF to LF so it doesn't take more than one replace

      strng = strng.replace(/\\|'/g, "\\$&").replace(/\r\n|\n|\r/g, "\\n");

      buffer.push(strng);
    }
  }

  // Hard-coded prefixes: exec="", interpolate="=", raw="~"
  const prefixes = "=|~";

  // Hard-coded regex for {% %}, {{ }}, and {# #} tags
  const parseOpenReg = new RegExp(
    "(\\{%(-|_)?\\s*(" + prefixes + ")?\\s*)" +
    "|(\\{\\{(-|_)?\\s*)" +
    "|(\\{#)",
    "g",
  );

  const parseCloseReg = new RegExp(
    "'|\"|`|\\/\\*|(\\s*(-|_)?%\\})" +
    "|(\\s*(-|_)?\\}\\})" +
    "|(#\\})",
    "g",
  );

  let m;

  while ((m = parseOpenReg.exec(str))) {
    const precedingString = str.slice(lastIndex, m.index);

    lastIndex = m[0].length + m.index;

    // Determine tag type: {% %}, {{ }}, or {# #}
    const isOutputTag = m[4] !== undefined; // {{ }} match group
    const isCommentTag = m[6] !== undefined; // {# #} match group
    const prefix = isOutputTag ? "=" : (m[3] || ""); // output tags default to interpolation, tag blocks use prefix

    pushString(precedingString);

    // Handle comments by skipping to the comment close
    if (isCommentTag) {
      const commentCloseIndex = str.indexOf("#}", lastIndex);
      if (commentCloseIndex === -1) {
        ParseErr("unclosed comment", str, m.index);
      }
      lastIndex = commentCloseIndex + 2; // Skip past #}
      parseOpenReg.lastIndex = lastIndex;
      continue; // Skip to next iteration, don't add comment to AST
    }

    parseCloseReg.lastIndex = lastIndex;
    let closeTag;
    let currentObj: AstObject | false = false;

    while ((closeTag = parseCloseReg.exec(str))) {
      if (closeTag[1] || closeTag[3]) {
        const content = str.slice(lastIndex, closeTag.index);

        parseOpenReg.lastIndex = lastIndex = parseCloseReg.lastIndex;

        const currentType: TagType = prefix === ""
          ? "e"
          : prefix === "~"
          ? "r"
          : prefix === "="
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
        } else if (currentType === "e") {
          // Check for assignments with filters in execute blocks
          const assignment = parseAssignmentWithFilters(content);
          if (assignment) {
            currentObj = { t: currentType, val: content, assignment };
          } else {
            currentObj = { t: currentType, val: content };
          }
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

  pushString(str.slice(lastIndex, str.length));

  return buffer;
}
