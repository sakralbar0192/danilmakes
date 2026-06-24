import { http, HttpResponse } from "msw";
import * as store from "./store.js";

function matchPath(request, suffix) {
  const { pathname } = new URL(request.url);
  return pathname === suffix || pathname.endsWith(suffix) || pathname.endsWith(`/divisions${suffix}`);
}

async function readBody(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

function serviceHandler(suffix, handler) {
  return http.post(({ request }) => matchPath(request, suffix), async ({ request }) => {
    const body = await readBody(request);
    return HttpResponse.json(handler(body));
  });
}

export const handlers = [
  serviceHandler("/Services/DivisionService.asmx/GetActiveDetails", () => store.getAllDivisions()),
  serviceHandler("/Services/DivisionService.asmx/GetActiveShort", () => store.getDivisionsShort()),
  serviceHandler("/Services/DivisionService.asmx/GetDetailsById", (body) =>
    store.getDivisionDetails(body.divisionId)
  ),
  serviceHandler("/Services/DivisionService.asmx/AddDivision", (body) => store.addDivision(body)),
  serviceHandler("/Services/DivisionService.asmx/UpdateDivision", (body) => store.updateDivision(body)),
  serviceHandler("/Services/DivisionService.asmx/DeleteDivision", (body) => store.deleteDivision(body)),
  serviceHandler("/Services/DivisionService.asmx/SelectedManagersList", (body) =>
    store.getPossibleManagers(body.divisionId)
  ),
  serviceHandler("/Services/DivisionService.asmx/SetManagers", (body) => store.setDivisionManagers(body)),
  serviceHandler("/Services/DivisionService.asmx/GetNotAssignedUsersByBranchAndDivision", (body) =>
    store.getNotAssignedUsersByBranch(body)
  ),
  serviceHandler("/Services/DivisionService.asmx/AddUsersDivisionHistoryEntries", (body) =>
    store.assignUsersToDivision(body)
  ),
  serviceHandler("/Services/ResourcePoolService.asmx/GetDetailsById", (body) =>
    store.getPoolDetails(body.poolId)
  ),
  serviceHandler("/Services/ResourcePoolService.asmx/GetActiveShortByDivisionId", (body) =>
    store.getPoolsByDivision(body.divisionId)
  ),
  serviceHandler("/Services/ResourcePoolService.asmx/GetActiveShort", () => store.getAllPoolsShort()),
  serviceHandler("/Services/ResourcePoolService.asmx/AddPool", (body) => store.addPool(body)),
  serviceHandler("/Services/ResourcePoolService.asmx/UpdatePool", (body) => store.updatePool(body)),
  serviceHandler("/Services/ResourcePoolService.asmx/DeletePool", (body) => store.deletePool(body)),
  serviceHandler("/Services/ResourcePoolService.asmx/GetNotAssignedUsersByPoolAndDivision", (body) =>
    store.getNotAssignedUsersByPool(body)
  ),
  serviceHandler("/Services/ResourcePoolService.asmx/AddUsersPoolHistoryEntries", (body) =>
    store.assignUsersToPool(body)
  ),
  serviceHandler("/Services/ResourcePoolService.asmx/UpdateUserPoolHistoryDate", (body) =>
    store.updatePoolUserDate(body)
  ),
  serviceHandler("/Services/BranchService.asmx/GetBranchGroupsWithBranchesList", () => store.getBranches()),
];
