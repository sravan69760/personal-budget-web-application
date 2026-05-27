function monthRange(month) {
  const value = month || new Date().toISOString().slice(0, 7);
  return {
    month: value,
    start: `${value}-01`,
    end: `${value}-31`
  };
}

function toNumber(value) {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return Number(value);
}

module.exports = {
  monthRange,
  toNumber
};
