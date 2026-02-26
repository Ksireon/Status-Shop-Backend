export type ProductInputMode = {
  usesMeters: boolean;
  usesQuantity: boolean;
  usesSize: boolean;
  purchaseUnit: 'meter' | 'piece';
};

function isVinylCategory(value?: string | null) {
  if (!value) return false;
  const slug = value.toLowerCase();
  return (
    slug === 'vinyl' ||
    slug === 'vynil' ||
    slug === 'vinil' ||
    slug === 'vinill'
  );
}

export function productInputMode(
  type?: string | null,
  categorySlug?: string | null,
): ProductInputMode {
  const isVinyl = isVinylCategory(categorySlug ?? type ?? '');
  if (isVinyl) {
    return {
      usesMeters: true,
      usesQuantity: false,
      usesSize: false,
      purchaseUnit: 'meter',
    };
  }
  return {
    usesMeters: false,
    usesQuantity: true,
    usesSize: false,
    purchaseUnit: 'piece',
  };
}

export function calcStockUnits(
  type?: string | null,
  categorySlug?: string | null,
  quantity?: number | null,
  meters?: number | null,
): number {
  const normalizedQuantity = quantity ?? 0;
  if (normalizedQuantity <= 0) return 0;

  const mode = productInputMode(type, categorySlug);
  if (mode.usesMeters) {
    const normalizedMeters = meters ?? 0;
    if (normalizedMeters <= 0) return 0;
    return normalizedMeters;
  }

  return normalizedQuantity;
}
