/**
 * Calculate line total for cart/order items
 * For meter-based products, calculates price * meters
 * For quantity-based products, calculates price * quantity
 */
export function calcLineTotal(
  price: number,
  quantity: number,
  meters?: number | null,
): number {
  if (meters && meters > 0) return Math.round(price * meters);
  return Math.round(price * quantity);
}
