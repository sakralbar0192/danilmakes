export function updateRestrictionDraftIndex(index = {}, {
  type = "",
  roomtypeId = "",
  day = "",
  value = "",
} = {}) {
  const nextIndex = { ...(index || {}) };
  nextIndex[`${roomtypeId}|${day}|${type}`] = value;
  return nextIndex;
}

export function removeRestrictionDraftIndex(index = {}, {
  type = "",
  roomtypeId = "",
  day = "",
} = {}) {
  const nextIndex = { ...(index || {}) };
  delete nextIndex[`${roomtypeId}|${day}|${type}`];
  return nextIndex;
}

export function setUpdatingRestrictionValue(tree = {}, {
  type = "",
  roomtypeId = "",
  day = "",
  value = "",
} = {}) {
  const nextTree = { ...(tree || {}) };
  const roomBranch = { ...(nextTree[roomtypeId] || {}) };
  const dayBranch = { ...(roomBranch[day] || {}) };

  dayBranch[type] = value;
  roomBranch[day] = dayBranch;
  nextTree[roomtypeId] = roomBranch;

  return nextTree;
}

export function removeUpdatingRestrictionValue(tree = {}, {
  type = "",
  roomtypeId = "",
  day = "",
} = {}) {
  if (!tree?.[roomtypeId]?.[day]) {
    return tree;
  }

  const nextTree = { ...(tree || {}) };
  const roomBranch = { ...(nextTree[roomtypeId] || {}) };
  const dayBranch = { ...(roomBranch[day] || {}) };

  delete dayBranch[type];

  if (Object.keys(dayBranch).length) {
    roomBranch[day] = dayBranch;
  } else {
    delete roomBranch[day];
  }

  if (Object.keys(roomBranch).length) {
    nextTree[roomtypeId] = roomBranch;
  } else {
    delete nextTree[roomtypeId];
  }

  return nextTree;
}
