import moment from "moment";

const ROOMTYPES = [
  { id: "101", name: "Стандарт" },
  { id: "102", name: "Комфорт" },
  { id: "103", name: "Люкс" },
];

function seededValue(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function metricForDay(dayIndex, kind) {
  const base = seededValue(dayIndex * 17 + kind.length * 3);
  if (kind === "load") return Math.round(45 + base * 50);
  if (kind === "adr") return Math.round(3500 + base * 2500);
  if (kind === "revpar") return Math.round(1800 + base * 2200);
  return Math.round(40000 + base * 80000);
}

function buildDateRange(from, to) {
  const dates = [];
  const start = moment(from, "YYYY-MM-DD");
  const end = moment(to, "YYYY-MM-DD");
  if (!start.isValid() || !end.isValid()) return dates;
  const cursor = start.clone();
  while (cursor.isSameOrBefore(end, "day")) {
    dates.push(cursor.format("YYYY-MM-DD"));
    cursor.add(1, "day");
  }
  return dates;
}

function buildRoomtypeRow(dayIndex, roomtype) {
  const seed = dayIndex * 100 + Number(roomtype.id);
  return {
    id: roomtype.id,
    name: roomtype.name,
    income: metricForDay(seed, "income"),
    adr: metricForDay(seed, "adr"),
    revpar: metricForDay(seed, "revpar"),
    load: metricForDay(seed, "load"),
    rooms: Math.round(8 + seededValue(seed) * 12),
  };
}

function sumRows(rows, key) {
  if (key === "load") {
    const totalRooms = rows.reduce((s, r) => s + (r.rooms || 0), 0);
    const weighted = rows.reduce((s, r) => s + (r.load || 0) * (r.rooms || 0), 0);
    return totalRooms ? Math.round(weighted / totalRooms) : 0;
  }
  if (key === "adr" || key === "revpar") {
    const totalIncome = rows.reduce((s, r) => s + (r.income || 0), 0);
    const weighted = rows.reduce((s, r) => s + (r[key] || 0) * (r.income || 0), 0);
    return totalIncome ? Math.round(weighted / totalIncome) : 0;
  }
  return rows.reduce((s, r) => s + (r[key] || 0), 0);
}

export function buildRevenuePlanResponse() {
  const year = moment().year();
  const months = {};
  for (let m = 1; m <= 12; m += 1) {
    months[m] = {
      revenue: 900000 + m * 45000,
      adr: 4200 + m * 40,
      load: 60 + (m % 4) * 5,
      revpar: 2800 + m * 35,
    };
  }
  return {
    result: "success",
    data: {
      yearsData: { [year]: months },
      categories: [],
    },
  };
}

export function buildRevenueReportResponse(payload = {}) {
  const from = payload?.primary?.from || moment().startOf("month").format("YYYY-MM-DD");
  const to = payload?.primary?.to || moment().endOf("month").format("YYYY-MM-DD");
  const roomtypeIds = (payload?.primary?.roomtypes_ids?.length
    ? payload.primary.roomtypes_ids
    : ROOMTYPES.map((r) => r.id));
  const roomtypes = ROOMTYPES.filter((r) => roomtypeIds.includes(r.id));
  const dates = buildDateRange(from, to);
  const today = moment().startOf("day");

  const tableDates = {};
  const revenueDates = {};
  const adrDates = {};
  const revparDates = {};
  const loadDates = {};

  const pastAgg = {};
  const futureAgg = {};

  dates.forEach((date, dayIndex) => {
    const dayRows = {};
    roomtypes.forEach((rt) => {
      dayRows[rt.id] = buildRoomtypeRow(dayIndex, rt);
    });
    dayRows.selected = {
      id: "selected",
      name: "Итого",
      income: sumRows(Object.values(dayRows).filter((r) => r.id !== "selected"), "income"),
      adr: sumRows(Object.values(dayRows).filter((r) => r.id !== "selected"), "adr"),
      revpar: sumRows(Object.values(dayRows).filter((r) => r.id !== "selected"), "revpar"),
      load: sumRows(Object.values(dayRows).filter((r) => r.id !== "selected"), "load"),
      rooms: sumRows(Object.values(dayRows).filter((r) => r.id !== "selected"), "rooms"),
    };

    tableDates[date] = dayRows;
    revenueDates[date] = dayRows.selected.income;
    adrDates[date] = dayRows.selected.adr;
    revparDates[date] = dayRows.selected.revpar;
    loadDates[date] = dayRows.selected.load;

    const bucket = moment(date).isBefore(today, "day") ? pastAgg : futureAgg;
    roomtypes.forEach((rt) => {
      if (!bucket[rt.id]) bucket[rt.id] = { income: 0, adr: 0, revpar: 0, load: 0, rooms: 0, count: 0 };
      const row = dayRows[rt.id];
      bucket[rt.id].income += row.income;
      bucket[rt.id].adr += row.adr;
      bucket[rt.id].revpar += row.revpar;
      bucket[rt.id].load += row.load;
      bucket[rt.id].rooms += row.rooms;
      bucket[rt.id].count += 1;
    });
  });

  const finalizeBucket = (bucket) => {
    const result = {};
    roomtypes.forEach((rt) => {
      const b = bucket[rt.id];
      if (!b) return;
      result[rt.id] = {
        income: b.income,
        adr: Math.round(b.adr / b.count),
        revpar: Math.round(b.revpar / b.count),
        load: Math.round(b.load / b.count),
        rooms: b.rooms,
      };
    });
    const rows = Object.values(result);
    result.selected = {
      income: sumRows(rows, "income"),
      adr: sumRows(rows, "adr"),
      revpar: sumRows(rows, "revpar"),
      load: sumRows(rows, "load"),
      rooms: sumRows(rows, "rooms"),
    };
    return result;
  };

  tableDates.past = finalizeBucket(pastAgg);
  tableDates.future = finalizeBucket(futureAgg);

  const total = {};
  roomtypes.forEach((rt) => {
    const rows = dates.map((d) => tableDates[d]?.[rt.id]).filter(Boolean);
    total[rt.id] = {
      id: rt.id,
      name: rt.name,
      income: sumRows(rows, "income"),
      adr: sumRows(rows, "adr"),
      revpar: sumRows(rows, "revpar"),
      load: sumRows(rows, "load"),
      rooms: sumRows(rows, "rooms"),
    };
  });
  const totalRows = roomtypes.map((rt) => total[rt.id]);
  total.selected = {
    id: "selected",
    name: "Итого",
    income: sumRows(totalRows, "income"),
    adr: sumRows(totalRows, "adr"),
    revpar: sumRows(totalRows, "revpar"),
    load: sumRows(totalRows, "load"),
    rooms: sumRows(totalRows, "rooms"),
  };

  const metricsSelected = total.selected;
  const pastRows = Object.values(tableDates.past || {});
  const futureRows = Object.values(tableDates.future || {}).filter((r) => r.income !== undefined);

  const primary = {
    metrics: {
      selected: {
        income: metricsSelected.income,
        adr: metricsSelected.adr,
        revpar: metricsSelected.revpar,
        load: metricsSelected.load,
      },
      past: {
        income: sumRows(pastRows, "income"),
        adr: sumRows(pastRows, "adr"),
        revpar: sumRows(pastRows, "revpar"),
        load: sumRows(pastRows, "load"),
      },
      future: {
        income: sumRows(futureRows, "income"),
        adr: sumRows(futureRows, "adr"),
        revpar: sumRows(futureRows, "revpar"),
        load: sumRows(futureRows, "load"),
      },
    },
    table: {
      dates: tableDates,
      total,
    },
    revenue: { dates: revenueDates },
    adr: { dates: adrDates },
    revpar: { dates: revparDates },
    load: { dates: loadDates },
  };

  return {
    result: "success",
    data: {
      result: {
        primary,
      },
    },
  };
}
