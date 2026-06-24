import usersFixture from "./fixtures/users.json";

let nextDivisionId = 6;
let nextPoolId = 9;

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
  1: [101, 102, 104, 107, 110, 113],
  2: [103, 106, 109, 112],
  3: [105, 108, 111],
  4: [114],
  5: [115],
};

const poolUsers = {
  1: [101, 102, 104],
  2: [107, 110, 113],
  3: [103, 106],
  4: [109, 112],
  5: [105, 108],
  6: [111],
  7: [114],
  8: [115],
};

const pools = [
  { Id: 1, Name: "Backend Pool", DivisionId: 1, ManagerId: 102, ManagerName: "Maria Chen", UserCount: 3 },
  { Id: 2, Name: "Frontend Pool", DivisionId: 1, ManagerId: 101, ManagerName: "Alex Morgan", UserCount: 3 },
  { Id: 3, Name: "Manual QA", DivisionId: 2, ManagerId: 103, ManagerName: "James Wilson", UserCount: 2 },
  { Id: 4, Name: "Automation", DivisionId: 2, ManagerId: 106, ManagerName: "Anna Volkova", UserCount: 2 },
  { Id: 5, Name: "iOS", DivisionId: 3, ManagerId: 105, ManagerName: "David Kim", UserCount: 2 },
  { Id: 6, Name: "Android", DivisionId: 3, ManagerId: 108, ManagerName: "Sophie Martin", UserCount: 1 },
  { Id: 7, Name: "BA Team", DivisionId: 4, ManagerId: 114, ManagerName: "Laura Brown", UserCount: 1 },
  { Id: 8, Name: "Platform Team", DivisionId: 5, ManagerId: 115, ManagerName: "Michael Ross", UserCount: 1 },
];

const divisions = [
  {
    Id: 1,
    Name: "Development Center",
    UserCount: 24,
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
    UserCount: 11,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 103, Name: "James Wilson", IsActive: true }],
  },
  {
    Id: 3,
    Name: "Mobile Solutions",
    UserCount: 8,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 105, Name: "David Kim", IsActive: true }],
  },
  {
    Id: 4,
    Name: "Business Analysis",
    UserCount: 6,
    IsProduction: false,
    SendTimeApprovalNotifications: false,
    IsActive: true,
    Managers: [{ Id: 114, Name: "Laura Brown", IsActive: true }],
  },
  {
    Id: 5,
    Name: "DevOps & Infrastructure",
    UserCount: 5,
    IsProduction: true,
    SendTimeApprovalNotifications: true,
    IsActive: true,
    Managers: [{ Id: 115, Name: "Michael Ross", IsActive: true }],
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

export function setDivisionManagers({ divisionId, managerIds = [] }) {
  const division = divisions.find((d) => d.Id === Number(divisionId));
  if (!division) return { d: { IsSucceeded: false, Message: "Division not found" } };
  division.Managers = managerIds.map((id) => {
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

export function getNotAssignedUsersByBranch({ branchId, divisionId }) {
  const assigned = new Set(divisionUsers[Number(divisionId)] || []);
  const branch = branches.flatMap((g) => g.Branches).find((b) => b.Id === Number(branchId));
  const branchName = branch?.Name;
  const result = users
    .filter((u) => u.BranchName === branchName && !assigned.has(u.Id))
    .map((u) => clone(u));
  return asmxSuccess(result);
}

export function getNotAssignedUsersByPool({ poolId, divisionId }) {
  const assigned = new Set(poolUsers[Number(poolId)] || []);
  const divisionAssigned = new Set(divisionUsers[Number(divisionId)] || []);
  const result = users
    .filter((u) => divisionAssigned.has(u.Id) && !assigned.has(u.Id))
    .map((u) => clone(u));
  return asmxSuccess(result);
}

export function assignUsersToDivision({ divisionId, userIds = [] }) {
  const id = Number(divisionId);
  if (!divisionUsers[id]) divisionUsers[id] = [];
  userIds.forEach((userId) => {
    if (!divisionUsers[id].includes(userId)) divisionUsers[id].push(userId);
  });
  recalcDivisionUserCount(id);
  return asmxSuccess(true);
}

export function assignUsersToPool({ poolId, userIds = [] }) {
  const id = Number(poolId);
  if (!poolUsers[id]) poolUsers[id] = [];
  userIds.forEach((userId) => {
    if (!poolUsers[id].includes(userId)) poolUsers[id].push(userId);
  });
  recalcPoolUserCount(id);
  return asmxSuccess(true);
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
