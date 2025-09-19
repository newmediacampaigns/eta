import { XMLEscape } from "./utils.ts";

/* TYPES */


export interface Options {
  // No options currently needed - placeholder for future options
}

export interface ChuckConfig {
  /** Whether or not to automatically XML-escape interpolations. Default true */
  autoEscape: boolean;

  /** Apply a filter function defined on the class to every interpolation or raw interpolation */
  autoFilter: boolean;




  /** Whether to pretty-format error messages (introduces runtime penalties) */
  debug: boolean;

  /** Function to XML-sanitize interpolations */
  escapeFunction: (str: unknown) => string;

  /** Function applied to all interpolations when autoFilter is true */
  filterFunction: (val: unknown) => string;

  /** Raw JS code inserted in the template function. Useful for declaring global variables for user templates */
  functionHeader: string;


  /** Make data available on the global object instead of varName */
  useWith: boolean;

  /** Name of the data object. Default `it` */
  varName: string;
}

/* END TYPES */

/** Chuck's base (global) configuration */
const defaultConfig: ChuckConfig = {
  autoEscape: true,
  autoFilter: false,
  debug: false,
  escapeFunction: XMLEscape,
  // default filter function (not used unless enables) just stringifies the input
  filterFunction: (val) => String(val),
  functionHeader: "",
  useWith: false,
  varName: "it",
};

export { defaultConfig };
