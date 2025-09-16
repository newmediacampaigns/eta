import { Eta as EtaCore } from "./core.ts";
export {
  EtaError,
  EtaNameResolutionError,
  EtaParseError,
  EtaRuntimeError,
} from "./err.ts";
export { type EtaConfig, type Options } from "./config.ts";
export { transformTwigSyntax, twigSyntaxPlugin } from "./twig-syntax.ts";

export class Eta extends EtaCore {}
