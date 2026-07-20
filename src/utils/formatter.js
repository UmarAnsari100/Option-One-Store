/**
 * Formats a numeric price into a luxury PKR currency representation (Rs. XX,XXX).
 * @param {number} price 
 * @returns {string}
 */
export const formatPrice = (price) => {
  if (price === null || price === undefined || isNaN(price)) {
    return 'Rs. 0';
  }
  return `Rs. ${Math.round(price).toLocaleString()}`;
};
