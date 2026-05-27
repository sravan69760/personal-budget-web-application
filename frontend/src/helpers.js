export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function money(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD"
  });
}

export function percent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}
