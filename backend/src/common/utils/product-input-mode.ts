export type ProductInputMode = {
  usesMeters: boolean;
  usesSize: boolean;
  purchaseUnit: 'meter' | 'piece';
};

export function productInputMode(type: string): ProductInputMode {
  switch (type) {
    case 'vinyl':
      return { usesMeters: true, usesSize: false, purchaseUnit: 'meter' };
    case 'textile':
      return { usesMeters: false, usesSize: true, purchaseUnit: 'piece' };
    default:
      return { usesMeters: false, usesSize: false, purchaseUnit: 'piece' };
  }
}
