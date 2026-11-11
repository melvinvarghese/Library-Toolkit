export function parseCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError("Enter a valid date.");
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new RangeError("Enter a valid date.");
  return Math.floor(date.getTime() / 86400000);
}

export function calculateFine({issueDate, dueDate, returnDate, dailyRate, graceDays = 0, maximumFine = null}) {
  const issue = parseCalendarDate(issueDate);
  const due = parseCalendarDate(dueDate);
  const returned = parseCalendarDate(returnDate);
  const rate = Number(dailyRate), grace = Number(graceDays);
  if (due < issue) throw new RangeError("Due date cannot be before the issue date.");
  if (returned < issue) throw new RangeError("Return date cannot be before the issue date.");
  if (!Number.isFinite(rate) || rate < 0) throw new RangeError("Daily fine rate must be zero or greater.");
  if (!Number.isInteger(grace) || grace < 0 || grace > 3650) throw new RangeError("Grace period must be a whole number from 0 to 3,650 days.");
  const cap = maximumFine === null || maximumFine === "" ? null : Number(maximumFine);
  if (cap !== null && (!Number.isFinite(cap) || cap < 0)) throw new RangeError("Maximum fine must be zero or greater.");
  const overdueDays = Math.max(0, returned - due);
  const chargeableDays = Math.max(0, overdueDays - grace);
  const uncappedFine = Math.round((chargeableDays * rate + Number.EPSILON) * 100) / 100;
  return {overdueDays, chargeableDays, dailyRate: rate, uncappedFine, fine: Math.round((Math.min(uncappedFine, cap ?? Infinity) + Number.EPSILON) * 100) / 100, maximumFine: cap};
}

export function normalizeHeader(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function mapCsvRows(table, aliases) {
  const indexes = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, table.headers.findIndex(header => names.includes(normalizeHeader(header)))]));
  return table.rows.map(row => Object.fromEntries(Object.entries(indexes).map(([key, index]) => [key, index < 0 ? "" : row[index] ?? ""])));
}

export function deriveReportStats(data) {
  const n = key => {
    const raw = data[key];
    if (raw === "" || raw === undefined || raw === null) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value < 0) throw new RangeError("Report totals must be zero or greater.");
    return value;
  };
  const collection = n("collection"), added = n("added"), withdrawn = n("withdrawn");
  const issued = n("issued"), returned = n("returned");
  return {
    closingCollection: collection === null || added === null || withdrawn === null ? null : collection + added - withdrawn,
    circulation: issued,
    netMembership: n("members") === null || n("newMembers") === null ? null : n("members") + n("newMembers"),
  };
}
