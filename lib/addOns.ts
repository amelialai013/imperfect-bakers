// Single source of truth for optional booking add-ons, shared by the
// customer booking form, the API route, and the admin views that display
// booking totals — so the price only ever needs to change in one place.
export const ADD_ONS = {
  cakeContainer: { label: "Cake container", price: 15 },
} as const;

export type AddOnKey = keyof typeof ADD_ONS;
export type AddOns = Partial<Record<AddOnKey, number>>;

export function addOnsTotal(addOns: AddOns | undefined): number {
  if (!addOns) return 0;
  return (Object.keys(ADD_ONS) as AddOnKey[]).reduce(
    (sum, key) => sum + (addOns[key] ?? 0) * ADD_ONS[key].price,
    0
  );
}
