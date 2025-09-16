import { Eta as EtaCore } from "./core.ts";
export {
  EtaError,
  EtaNameResolutionError,
  EtaParseError,
  EtaRuntimeError,
} from "./err.ts";
export { type EtaConfig, type Options } from "./config.ts";

export class Eta extends EtaCore {}
