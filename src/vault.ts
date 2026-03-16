export const PIN_MIN_LENGTH = 6;
export const PIN_MAX_LENGTH = 12;

export function validatePinStrength(pin: string): { valid: boolean; message?: string } {
  if (pin.length < PIN_MIN_LENGTH) {
    return { valid: false, message: `PIN en az ${PIN_MIN_LENGTH} karakter olmalı` };
  }
  if (pin.length > PIN_MAX_LENGTH) {
    return { valid: false, message: `PIN en fazla ${PIN_MAX_LENGTH} karakter olmalı` };
  }
  if (!/^\d+$/.test(pin)) {
    return { valid: false, message: 'PIN sadece rakamlardan oluşmalı' };
  }
  const unique = new Set(pin.split('')).size;
  if (unique < 3) {
    return { valid: false, message: 'En az 3 farklı rakam kullanın (örn. 123456)' };
  }
  const forbidden = ['123456', '654321', '111111', '000000', '123123', '121212'];
  if (forbidden.includes(pin)) {
    return { valid: false, message: 'Bu PIN çok yaygın, daha güçlü bir PIN seçin' };
  }
  return { valid: true };
}
