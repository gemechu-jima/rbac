// utils/numbers.js
export const safeToFixed = (value, decimals = 1, fallback = 'N/A') => {
  if (typeof value !== 'number' || isNaN(value)) {
    return fallback;
  }
  return value.toFixed(decimals);
};

export const safeNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  const num = Number(value);
  return isNaN(num) ? fallback : num;
};

export default {
  safeToFixed,
  safeNumber
};