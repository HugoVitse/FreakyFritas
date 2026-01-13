import { ScanResult, DeliveryItem } from '../types';

export function updateLabelCounts(
  counts: Record<string, number>,
  productName: string | null | undefined,
  quantity: number = 1
): Record<string, number> {
  const key = (productName ?? '').toUpperCase().trim();
  if (!key) return counts;

  return {
    ...counts,
    [key]: (counts[key] ?? 0) + quantity,
  };
}

export function decrementLabelCount(
  counts: Record<string, number>,
  productName: string
): Record<string, number> {
  const key = productName.toUpperCase().trim();
  if (!counts[key] || counts[key] <= 0) return counts;

  return {
    ...counts,
    [key]: counts[key] - 1,
  };
}

export function getProductKey(productName: string | null | undefined): string {
  return (productName ?? '').toUpperCase().trim();
}

export function findExpectedQuantity(
  productName: string | null | undefined,
  deliveryItems: DeliveryItem[]
): number | null {
  const key = getProductKey(productName);
  if (!key) return null;

  const item = deliveryItems.find(
    (it) => it.product_name && getProductKey(it.product_name).includes(key)
  );
  return item?.quantity ?? null;
}

export interface ComparisonResult {
  name: string | null;
  expected: number;
  scanned: number;
  ok: boolean;
}

export function compareDeliveryItems(
  labelCounts: Record<string, number>,
  deliveryItems: DeliveryItem[]
): ComparisonResult[] {
  return deliveryItems.map((item) => {
    const key = getProductKey(item.product_name);
    const scanned = key ? labelCounts[key] ?? 0 : 0;
    const expected = item.quantity ?? 0;
    return {
      name: item.product_name,
      expected,
      scanned,
      ok: scanned >= expected,
    };
  });
}

export function getTotalLabelCounts(counts: Record<string, number>): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}
