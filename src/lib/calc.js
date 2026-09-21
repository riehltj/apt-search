// Empty fields are null; treat them as $0 in calculations.
const n = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

// Recurring monthly cost. One-time deposits are intentionally excluded.
export const monthlyCost = (a) => n(a.rent) + n(a.parking) + n(a.petRent) + n(a.otherMonthly);

// Cash needed at move-in: all one-time costs plus first month's rent.
export const moveInCost = (a) =>
  n(a.securityDeposit) + n(a.petDeposit) + n(a.applicationFee) + n(a.otherOneTime) + n(a.rent);

export const hasOneTimeCosts = (a) =>
  [a.securityDeposit, a.petDeposit, a.applicationFee, a.otherOneTime].some((v) => v !== null && v !== undefined);

export const isPetFriendly = (a) => a.petRent != null || a.petDeposit != null;
