export const formatPrice = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2, // Ensures at least 2 decimal places
    maximumFractionDigits: 2, // Ensures at most 2 decimal places
  }).format(Math.floor(amount)); // Removes decimal part
};
