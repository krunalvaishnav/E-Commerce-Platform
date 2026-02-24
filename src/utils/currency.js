const INR_PER_USD = 90.73;

const roundToTwo = (value) => {
  return Math.round(value * 100) / 100;
};

const convertINRToUSD = (amountINR) => {
  return roundToTwo(amountINR / INR_PER_USD);
};

module.exports = {
  convertINRToUSD,
  roundToTwo
};
