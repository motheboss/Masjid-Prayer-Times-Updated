import Constants, { ExecutionEnvironment } from "expo-constants";

/** Expo Go has no Stripe Terminal native module; requiring it there throws at import time.
 *  Everything Stripe-related goes through this file so Expo Go degrades instead of crashing. */
export const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let mod: any = null;
if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require("@stripe/stripe-terminal-react-native");
  } catch {
    mod = null;
  }
}

export const terminalAvailable: boolean = !!mod?.StripeTerminalProvider && !!mod?.useStripeTerminal;
export const StripeTerminalProvider: any = mod?.StripeTerminalProvider ?? null;
export const useStripeTerminal: any = mod?.useStripeTerminal ?? null;
