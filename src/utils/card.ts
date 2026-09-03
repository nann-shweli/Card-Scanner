export const normalizeCardNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const isValidCardLength = (value: string): boolean => {
  const number = normalizeCardNumber(value);

  return number.length >= 13 && number.length <= 19;
};

export const luhnCheck = (value: string): boolean => {
  const number = normalizeCardNumber(value);

  if (!isValidCardLength(number)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = number.length - 1; i >= 0; i -= 1) {
    let digit = Number(number[i]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

export const extractCardNumber = (text: string): string | null => {
  if (!text) {
    return null;
  }

  /**
   * Examples it can detect:
   *
   * 4111 1111 1111 1111
   * 4111-1111-1111-1111
   * 4111111111111111
   */
  const matches =
    text.match(/(?:\d[\s-]?){13,19}/g) ?? [];

  for (const match of matches) {
    const number = normalizeCardNumber(match);

    if (
      number.length >= 13 &&
      number.length <= 19 &&
      luhnCheck(number)
    ) {
      return number;
    }
  }

  return null;
};

export const formatCardNumber = (value: string): string => {
  const number = normalizeCardNumber(value);

  return number
    .replace(/(.{4})/g, '$1 ')
    .trim();
};

export const maskCardNumber = (value: string): string => {
  const number = normalizeCardNumber(value);

  if (number.length < 4) {
    return number;
  }

  return `•••• •••• •••• ${number.slice(-4)}`;
};