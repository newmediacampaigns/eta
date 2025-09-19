export class ChuckError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "Chuck Error";
  }
}

export class ChuckParseError extends ChuckError {
  constructor(message: string) {
    super(message);
    this.name = "ChuckParser Error";
  }
}

export class ChuckRuntimeError extends ChuckError {
  constructor(message: string) {
    super(message);
    this.name = "ChuckRuntime Error";
  }
}


export class ChuckNameResolutionError extends ChuckError {
  constructor(message: string) {
    super(message);
    this.name = "ChuckNameResolution Error";
  }
}

/**
 * Throws a ChuckError with a nicely formatted error and message showing where in the template the error occurred.
 */

export function ParseErr(message: string, str: string, indx: number): never {
  const whitespace = str.slice(0, indx).split(/\n/);

  const lineNo = whitespace.length;
  const colNo = whitespace[lineNo - 1].length + 1;
  message += " at line " +
    lineNo +
    " col " +
    colNo +
    ":\n\n" +
    "  " +
    str.split(/\n/)[lineNo - 1] +
    "\n" +
    "  " +
    Array(colNo).join(" ") +
    "^";
  throw new ChuckParseError(message);
}

export function RuntimeErr(
  originalError: Error,
  str: string,
  lineNo: number,
): never {
  // Browser-optimized: simplified error reporting without filepath dependency

  const lines = str.split("\n");
  const start = Math.max(lineNo - 3, 0);
  const end = Math.min(lines.length, lineNo + 3);
  
  // Error context
  const context = lines
    .slice(start, end)
    .map(function (line, i) {
      const curr = i + start + 1;
      return (curr == lineNo ? " >> " : "    ") + curr + "| " + line;
    })
    .join("\n");

  const header = "line " + lineNo + "\n";

  const err = new ChuckRuntimeError(
    header + context + "\n\n" + originalError.message,
  );

  err.name = originalError.name; // the original name (e.g. ReferenceError) may be useful

  throw err;
}
