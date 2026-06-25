import usersFixture from "./fixtures/users.json";

let nextDivisionId = 11;
let nextPoolId = 19;

const users = usersFixture.map((u) => ({ ...u }));

const branches = [
  {
    Id: 1,
    Name: "North-West",
    Branches: [
      { Id: 10, Name: "Saint Petersburg", IsActive: true },
      { Id: 11, Name: "Remote", IsActive: true },
    ],
  },
  {
    Id: 2,
    Name: "Central",
    Branches: [{ Id: 20, Name: "Moscow", IsActive: true }],
  },
];

const divisionUsers = {
  1: [101, 102, 104, 107, 110, 113, 116],
  2: [103, 106, 109, 112, 117],
  3: [105, 108, 111, 118],
  4: [114, 119],
  5: [115, 120],
  6: [122, 123, 125],
  7: [119, 121, 124],
  8: [117, 120],
  9: [104, 116, 118],
  10: [101, 115, 122],
};

const poolUsers = {
  1: [101, 102, 104],
  2: [107, 110, 113, 116],
  3: [103, 106],
  4: [109, 112, 117],
  5: [105, 108],
  6: [111, 118],
  7: [114],
  8: [115, 120],
  9: [122, 125],
  10: [123],
  11: [119, 121],
  12: [124],
  13: [117, 120],
  14: [104, 116],
  15: [118],
  16: [101, 122],
  17: [115],
  18: [123, 125],
};

const pools = [
  { Id: 1, Name: "Backend Pool", DivisionId: 1, ManagerId: 102, ManagerName: "Maria Chen", UserCount: 0, IsActive: true },
  { Id: 2, Name: "Frontend Pool", DivisionId: 1, ManagerId: 101, ManagerName: "Alex Morgan", UserCount: 0, IsActive: true },
  { Id: 3, Name: "Manual QA", DivisionId: 2, ManagerId: 103, ManagerName: "James Wilson", UserCount: 0, IsActive: true },
  { Id: 4, Name: "Automation", DivisionId: 2, ManagerId: 106, ManagerName: "Anna Volkova", UserCount: 0, IsActive: true },
  { Id: 5, Name: "iOS", DivisionId: 3, ManagerId: 105, ManagerName: "David Kim", UserCount: 0, IsActive: true },
  { Id: 6, Name: "Android", DivisionId: 3, ManagerId: 108, ManagerName: "Sophie Martin", UserCount: 0, IsActive: true },
  { Id: 7, Name: "BA Team", DivisionId: 4, ManagerId: 114, ManagerName: "Laura Brown", UserCount: 0, IsActive: true },
  { Id: 8, Name: "Platform Team", DivisionId: 5, ManagerId: 115, ManagerName: "Michael Ross", UserCount: 0, IsActive: true },
  { Id: 9, Name: "Analytics", DivisionId: 6, ManagerId: 122, ManagerName: "Oleg Morozov", UserCount: 0, IsActive: true },
  { Id: 10, Name: "ETL", DivisionId: 6, ManagerId: 123, ManagerName: "Sara Ali", UserCount: 0, IsActive: true },
  { Id: 11, Name: "Product Design", DivisionId: 7, ManagerId: 119, ManagerName: "Emma Walsh", UserCount: 0, IsActive: true },
  { Id: 12, Name: "UX Research", DivisionId: 7, ManagerId: 121, ManagerName: "Hannah Reed", UserCount: 0, IsActive: true },
  { Id: 13, Name: "AppSec", DivisionId: 8, ManagerId: 117, ManagerName: "Tom Becker", UserCount: 0, IsActive: true },
  { Id: 14, Name: "Support L1", DivisionId: 9, ManagerId: 116, ManagerName: "Kate Hughes", UserCount: 0, IsActive: true },
  { Id: 15, Name: "Onboarding", DivisionId: 9, ManagerId: 118, ManagerName: "Yuki Tanaka", UserCount: 0, IsActive: true },
  { Id: 16, Name: "Solution Architects", DivisionId: 10, ManagerId: 101, ManagerName: "Alex Morgan", UserCount: 0, IsActive: true },
  { Id: 17, Name: "Cloud Ops", DivisionId: 5, ManagerId: 120, ManagerName: "Lucas Ferreira", UserCount: 0, IsActive: true },
  { Id: 18, Name: "Data Quality", DivisionId: 6, ManagerId: 125, ManagerName: "Daria Popova", UserCount: 0, IsActive: true },
];

const divisions = [
  {
    Id: 1,
    Name: "Development Center",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [
      { Id: 101, Name: "Alex Morgan", IsActive: true },
      { Id: 102, Name: "Maria Chen", IsActive: true },
    ],
  },
  {
    Id: 2,
    Name: "QA Department",
    UserCount: 0,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 103, Name: "James Wilson", IsActive: true }],
  },
  {
    Id: 3,
    Name: "Mobile Solutions",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 105, Name: "David Kim", IsActive: true }],
  },
  {
    Id: 4,
    Name: "Business Analysis",
    UserCount: 0,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 114, Name: "Laura Brown", IsActive: true }],
  },
  {
    Id: 5,
    Name: "DevOps & Infrastructure",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 115, Name: "Michael Ross", IsActive: true }],
  },
  {
    Id: 6,
    Name: "Data Engineering",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 122, Name: "Oleg Morozov", IsActive: true }],
  },
  {
    Id: 7,
    Name: "UX & Design",
    UserCount: 0,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 119, Name: "Emma Walsh", IsActive: true }],
  },
  {
    Id: 8,
    Name: "Security",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 117, Name: "Tom Becker", IsActive: true }],
  },
  {
    Id: 9,
    Name: "Customer Success",
    UserCount: 0,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 116, Name: "Kate Hughes", IsActive: true }],
  },
  {
    Id: 10,
    Name: "Architecture",
    UserCount: 0,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [
      { Id: 101, Name: "Alex Morgan", IsActive: true },
      { Id: 115, Name: "Michael Ross", IsActive: true },
    ],
  },
];

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function findUser(id) {
  return users.find((u) => u.Id === id);
}

function usersByIds(ids) {
  return ids.map((id) => clone(findUser(id))).filter(Boolean);
}

function recalcDivisionUserCount(divisionId) {
  const division = divisions.find((d) => d.Id === divisionId);
  if (division) {
    division.UserCount = (divisionUsers[divisionId] || []).length;
  }
}

function recalcPoolUserCount(poolId) {
  const pool = pools.find((p) => p.Id === poolId);
  if (pool) {
    pool.UserCount = (poolUsers[poolId] || []).length;
  }
}

Object.keys(divisionUsers).forEach((id) => recalcDivisionUserCount(Number(id)));
Object.keys(poolUsers).forEach((id) => recalcPoolUserCount(Number(id)));

function asmxSuccess(value) {
  return { d: { IsSucceeded: true, Value: value } };
}

export function getAllDivisions() {
  return asmxSuccess(clone(divisions));
}

export function getDivisionsShort() {
  return asmxSuccess(
    clone(divisions.map(({ Id, Name, IsActive }) => ({ Id, Name, IsActive })))
  );
}

export function getDivisionDetails(divisionId) {
  const division = divisions.find((d) => d.Id === Number(divisionId));
  if (!division) return { d: { IsSucceeded: false, Message: "Division not found" } };

  const divisionPools = pools
    .filter((p) => p.DivisionId === division.Id)
    .map((p) => clone(p));

  const assignedUsers = usersByIds(divisionUsers[division.Id] || []);

  return asmxSuccess(
    clone({
      ...division,
      Pools: divisionPools,
      Users: assignedUsers,
    })
  );
}

export function getPoolDetails(poolId) {
  const pool = pools.find((p) => p.Id === Number(poolId));
  if (!pool) return { d: { IsSucceeded: false, Message: "Pool not found" } };

  const division = divisions.find((d) => d.Id === pool.DivisionId);
  const assignedUsers = usersByIds(poolUsers[pool.Id] || []).map((u) => ({
    ...u,
    PoolId: pool.Id,
    PoolName: pool.Name,
    Division: division?.Name,
  }));

  return asmxSuccess(
    clone({
      ...pool,
      DivisionName: division?.Name,
      Users: assignedUsers,
    })
  );
}

export function getPoolsByDivision(divisionId) {
  const list = pools
    .filter((p) => p.DivisionId === Number(divisionId))
    .map(({ Id, Name, IsActive, DivisionId }) => ({ Id, Name, IsActive: true, DivisionId }));
  return asmxSuccess(clone(list));
}

export function getAllPoolsShort() {
  return asmxSuccess(
    clone(pools.map(({ Id, Name, DivisionId }) => ({ Id, Name, IsActive: true, DivisionId })))
  );
}

export function getBranches() {
  return asmxSuccess(clone(branches));
}

export function getPossibleManagers(divisionId) {
  const ids = divisionUsers[Number(divisionId)] || [];
  const result = ids.map((id) => {
    const user = findUser(id);
    return {
      ...clone(user),
      IsManager: (divisions.find((d) => d.Id === Number(divisionId))?.Managers || []).some(
        (m) => m.Id === id
      ),
    };
  });
  return asmxSuccess(result);
}

export function setDivisionManagers({ divisionId, userIds = [], managerIds = [] }) {
  const division = divisions.find((d) => d.Id === Number(divisionId));
  if (!division) return { d: { IsSucceeded: false, Message: "Division not found" } };
  const ids = userIds.length ? userIds : managerIds;
  division.Managers = ids.map((id) => {
    const user = findUser(id);
    return { Id: id, Name: user?.Name || `User ${id}`, IsActive: true };
  });
  return asmxSuccess(clone(division.Managers));
}

export function addDivision({ name, isProduction, sendTimeApprovalNotifications }) {
  const item = {
    Id: nextDivisionId++,
    Name: name,
    UserCount: 0,
    IsProduction: Boolean(isProduction),
    SendTimeApprovalNotifications: Boolean(sendTimeApprovalNotifications),
    IsActive: true,
    Managers: [],
  };
  divisions.push(item);
  divisionUsers[item.Id] = [];
  return asmxSuccess(clone(item));
}

export function updateDivision({ id, name, isProduction, sendTimeApprovalNotifications }) {
  const division = divisions.find((d) => d.Id === Number(id));
  if (!division) return { d: { IsSucceeded: false, Message: "Division not found" } };
  division.Name = name;
  division.IsProduction = Boolean(isProduction);
  division.SendTimeApprovalNotifications = Boolean(sendTimeApprovalNotifications);
  return asmxSuccess(clone(division));
}

export function deleteDivision({ divisionId }) {
  const id = Number(divisionId);
  const index = divisions.findIndex((d) => d.Id === id);
  if (index === -1) return { d: { IsSucceeded: false, Message: "Division not found" } };
  divisions.splice(index, 1);
  delete divisionUsers[id];
  for (let i = pools.length - 1; i >= 0; i--) {
    if (pools[i].DivisionId === id) {
      delete poolUsers[pools[i].Id];
      pools.splice(i, 1);
    }
  }
  return asmxSuccess(true);
}

export function addPool({ divisionId, name, managerId }) {
  const manager = findUser(Number(managerId));
  const item = {
    Id: nextPoolId++,
    Name: name,
    DivisionId: Number(divisionId),
    ManagerId: Number(managerId) || 0,
    ManagerName: manager?.Name || "",
    UserCount: 0,
    IsActive: true,
  };
  pools.push(item);
  poolUsers[item.Id] = [];
  return asmxSuccess(clone(item));
}

export function updatePool({ id, name, managerId }) {
  const pool = pools.find((p) => p.Id === Number(id));
  if (!pool) return { d: { IsSucceeded: false, Message: "Pool not found" } };
  const manager = findUser(Number(managerId));
  pool.Name = name;
  pool.ManagerId = Number(managerId) || 0;
  pool.ManagerName = manager?.Name || "";
  return asmxSuccess(clone(pool));
}

export function deletePool({ poolId }) {
  const id = Number(poolId);
  const index = pools.findIndex((p) => p.Id === id);
  if (index === -1) return { d: { IsSucceeded: false, Message: "Pool not found" } };
  pools.splice(index, 1);
  delete poolUsers[id];
  return asmxSuccess(true);
}

export function getNotAssignedUsersByBranch({ branchId, divisionId, assignedDivisionId }) {
  const targetDivisionId = Number(assignedDivisionId ?? divisionId);
  const assignedToTarget = new Set(divisionUsers[targetDivisionId] || []);

  let result = users.filter((u) => !assignedToTarget.has(u.Id));

  const branchFilter = Number(branchId);
  if (branchFilter > 0) {
    const branch = branches.flatMap((g) => g.Branches).find((b) => b.Id === branchFilter);
    if (branch?.Name) {
      result = result.filter((u) => u.BranchName === branch.Name);
    }
  }

  const divisionFilter = Number(divisionId);
  if (divisionFilter === -1) {
    const assignedAnywhere = new Set(Object.values(divisionUsers).flat());
    result = result.filter((u) => !assignedAnywhere.has(u.Id));
  } else if (divisionFilter > 0) {
    const inSourceDivision = new Set(divisionUsers[divisionFilter] || []);
    result = result.filter((u) => inSourceDivision.has(u.Id));
  }

  return asmxSuccess(result.map((u) => clone(u)));
}

export function getNotAssignedUsersByPool({ poolId, divisionId, assignedPoolId }) {
  const targetPoolId = Number(assignedPoolId ?? poolId);
  const assignedToPool = new Set(poolUsers[targetPoolId] || []);
  const divisionAssigned = new Set(divisionUsers[Number(divisionId)] || []);

  let result = users.filter((u) => divisionAssigned.has(u.Id) && !assignedToPool.has(u.Id));

  const poolFilter = Number(poolId);
  if (poolFilter > 0 && poolFilter !== targetPoolId) {
    const inSourcePool = new Set(poolUsers[poolFilter] || []);
    result = result.filter((u) => inSourcePool.has(u.Id));
  }

  return asmxSuccess(result.map((u) => clone(u)));
}

function extractUserIds({ users = [], userIds = [] }) {
  if (users.length) {
    return users.map((entry) => Number(entry.UserId));
  }
  return userIds.map(Number);
}

function applyStartDates(usersPayload, ids) {
  if (!usersPayload.length) return;
  ids.forEach((userId) => {
    const entry = usersPayload.find((u) => Number(u.UserId) === userId);
    const user = findUser(userId);
    if (user && entry?.StartDate) {
      user.StartDate = entry.StartDate;
    }
  });
}

export function assignUsersToDivision({ divisionId, users = [], userIds = [] }) {
  const id = Number(divisionId);
  if (!divisionUsers[id]) divisionUsers[id] = [];
  const idsToAdd = extractUserIds({ users, userIds });
  idsToAdd.forEach((userId) => {
    if (!divisionUsers[id].includes(userId)) divisionUsers[id].push(userId);
  });
  applyStartDates(users, idsToAdd);
  recalcDivisionUserCount(id);
  return asmxSuccess(usersByIds(idsToAdd));
}

export function assignUsersToPool({ poolId, users = [], userIds = [] }) {
  const id = Number(poolId);
  if (!poolUsers[id]) poolUsers[id] = [];
  const idsToAdd = extractUserIds({ users, userIds });
  idsToAdd.forEach((userId) => {
    if (!poolUsers[id].includes(userId)) poolUsers[id].push(userId);
  });
  applyStartDates(users, idsToAdd);
  recalcPoolUserCount(id);
  const division = pools.find((p) => p.Id === id);
  const divisionName = divisions.find((d) => d.Id === division?.DivisionId)?.Name;
  return asmxSuccess(
    usersByIds(idsToAdd).map((u) => ({
      ...u,
      PoolId: id,
      PoolName: division?.Name,
      Division: divisionName,
    }))
  );
}

export function updatePoolUserDate({ userId, poolId, startDate }) {
  const user = findUser(Number(userId));
  if (!user) return { d: { IsSucceeded: false, Message: "User not found" } };
  user.StartDate = startDate;
  const pool = pools.find((p) => p.Id === Number(poolId));
  return asmxSuccess(
    clone({
      ...user,
      PoolId: pool?.Id,
      PoolName: pool?.Name,
    })
  );
}
