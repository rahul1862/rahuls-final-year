// Demo codes only — there's no real promotions backend behind this cart.
export const DISCOUNT_CODES: Record<string, number> = {
  WELCOME10: 0.1,
  SAVE15: 0.15,
};

export interface DiscountValidation {
  ok: boolean;
  message: string;
  code?: string;
}

export function isValidDiscountCode(code: string): boolean {
  return code in DISCOUNT_CODES;
}

export function getDiscountPercent(code: string | null): number {
  if (!code) return 0;
  return DISCOUNT_CODES[code] ?? 0;
}

export function validateDiscountCode(code: string): DiscountValidation {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, message: 'Enter a discount code.' };
  const percent = DISCOUNT_CODES[normalized];
  if (!percent) return { ok: false, message: `"${code.trim()}" isn't a valid code.` };
  return { ok: true, message: `Code applied — ${percent * 100}% off your order.`, code: normalized };
}
