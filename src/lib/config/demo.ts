/*
  The demo cabinet — off unless someone explicitly asks for it.

  `src/lib/api/client.ts` can serve the whole account area from built-in mock
  data: a phone number and any six digits "sign in", and the cabinet then shows
  two orders, a subscription and a profile belonging to "Go Vita Mijoz". That
  fallback exists so the UI can be reviewed before the FastAPI backend is
  deployed, and for that purpose it is the right thing.

  On a live shop it is not. A customer who finds /account, types their own
  number and is signed in as somebody else with orders they never placed has
  not been shown a demo — they have been shown a broken shop. There is no
  banner saying the data is fake, and the route is not linked from anywhere
  once the API is unconfigured, so the only way to reach it is to guess the URL
  and then be misled by it.

  So the same rule the sample social proof follows applies here: the fabricated
  parts are opt-in.

      NEXT_PUBLIC_ACCOUNT_DEMO=on

  Set it on a demo deployment to walk a client through the cabinet. Leave it
  unset in production, where /account either talks to the real API or does not
  exist.

  Strictly opt-in, like the social-proof flag: absent and "off" both mean the
  demo is off, and only the literal "on" turns it on. An unconfigured
  deployment stays honest by default.
*/

/** True when the mock account cabinet may be shown without a real API. */
export const ACCOUNT_DEMO_ENABLED = process.env.NEXT_PUBLIC_ACCOUNT_DEMO === "on";

/**
 * Whether the account area has anything real or explicitly-permitted to show.
 *
 * The two cases are deliberately one function: every caller that has to decide
 * whether /account may exist would otherwise repeat the same two-term test, and
 * a caller that forgets the demo term is a caller that hides a working demo or
 * exposes a fake one.
 */
export function accountAreaAvailable(isApiConfigured: boolean): boolean {
  return isApiConfigured || ACCOUNT_DEMO_ENABLED;
}
