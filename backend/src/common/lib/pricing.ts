import { round } from "lodash";

/**
 * Convert a time in minutes to a price.
 * @param timeInMinutes The time in minutes to convert to a price.
 * @param priceRatePerHour The price rate per hour.
 * @returns
 */
const calculatePriceFromTimeMinutes = ({
  timeInMinutes,
  priceRatePerHour,
}: {
  timeInMinutes: number;
  priceRatePerHour: number;
}) => {
  // 1 hour = 60 minutes
  const priceRatePerMinute = priceRatePerHour / 60;
  return priceRatePerMinute * timeInMinutes;
};

/**
 * Determine the tax for a given price (20 HT => 24 TTC => this function will return 4)
 */
const determineTaxFromPrice = ({
  price,
  taxRate,
}: {
  price: number;
  taxRate: number;
}) => {
  const multiplier = taxRate / 100 + 1;
  const total = price * multiplier;
  const result = total - price;

  return round(result, 2);
};

/**
 * Determine the commission for a given price (20 without commission => 24 with commission => this function will return 4)
 */
const determineCommissionFromPrice = ({
  price,
  commissionRate,
}: {
  price: number;
  commissionRate: number;
}) => {
  const multiplier = commissionRate / 100 + 1;
  const total = price * multiplier;
  const result = total - price;

  return round(result, 2);
};

export const pricing = {
  calculatePriceFromTimeMinutes,
  determineTaxFromPrice,
  determineCommissionFromPrice,
};
