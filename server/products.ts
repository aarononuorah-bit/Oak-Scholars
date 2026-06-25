export const PRODUCTS = [
  {
    id: "trial",
    name: "Trial Lesson",
    description: "Your first session at 50% off. No commitment required.",
    priceInPence: 1500,
    originalPriceInPence: 3000,
    label: "50% off",
    highlight: true,
  },
  {
    id: "single",
    name: "Single Session",
    description: "One-off session, pay as you go.",
    priceInPence: 3000,
    label: "£30",
    highlight: false,
  },
  {
    id: "bundle4",
    name: "4-Session Bundle",
    description: "Save with a block of 4 sessions.",
    priceInPence: 10000,
    label: "£100",
    highlight: false,
  },
  {
    id: "bundle8",
    name: "8-Session Bundle",
    description: "Best value — 8 sessions, maximum progress.",
    priceInPence: 20000,
    label: "£200",
    highlight: false,
  },
] as const;

export type ProductId = (typeof PRODUCTS)[number]["id"];

export function getProduct(id: ProductId) {
  return PRODUCTS.find((p) => p.id === id);
}
