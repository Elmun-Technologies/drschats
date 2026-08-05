/*
  Sample social proof — off unless someone explicitly asks for it.

  Two pieces of this site were built with placeholder data that reads as fact:
  the product reviews and star ratings carried in the mock catalogue, and the
  "Malika S. from Samarqand just bought Vitamin D3+K2" toast in the corner.
  Both were written to demonstrate the components. Neither describes a real
  customer, because at the time of writing there are none.

  Shipping them is a different thing from building with them. A shop that has
  not sold anything yet showing invented purchases is not an optimisation, it
  is a claim that is not true — and for a pharmacy audience it is the exact
  claim that is most expensive to be caught making. Google's structured-data
  policy says the same about fabricated `aggregateRating`.

  So the default is off, and the sample data reappears only when the flag is
  set on purpose:

      NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF=on

  Set it on a demo deployment to show the components working. Leave it unset in
  production until the reviews come from customers and the toast from orders.

  This gates only the fabricated parts. Sanity-authored customer stories, and
  anything the real Shopflow API returns in `SHOPFLOW_MODE=http`, are untouched:
  those are somebody's actual words, and hiding them would be the opposite
  mistake.
*/

export const SHOW_SAMPLE_SOCIAL_PROOF =
  process.env.NEXT_PUBLIC_SAMPLE_SOCIAL_PROOF === "on";
