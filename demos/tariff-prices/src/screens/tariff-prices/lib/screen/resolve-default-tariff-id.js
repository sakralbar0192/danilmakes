export function resolveDefaultTariffId({ rplans = [] } = {}) {
  const main = rplans.find(p => Number(p.is_main));
  if (main?.id) return String(main.id);
  return rplans[0]?.id ? String(rplans[0].id) : null;
}
