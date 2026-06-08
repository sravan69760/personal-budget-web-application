export function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export function savedMonth() {
  return localStorage.getItem("selectedMonth") || currentMonth();
}

export function saveMonth(month) {
  localStorage.setItem("selectedMonth", month);
  return month;
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
