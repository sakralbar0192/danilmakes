import { http, HttpResponse } from "msw";
import { DemoApi } from "../config/demo-api.js";
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
  serviceHandler(DemoApi.divisionGetActiveDetails, () => store.getAllDivisions()),
  serviceHandler(DemoApi.divisionGetActiveShort, () => store.getDivisionsShort()),
  serviceHandler(DemoApi.divisionGetDetailsById, (body) => store.getDivisionDetails(body.divisionId)),
  serviceHandler(DemoApi.divisionAdd, (body) => store.addDivision(body)),
  serviceHandler(DemoApi.divisionUpdate, (body) => store.updateDivision(body)),
  serviceHandler(DemoApi.divisionDelete, (body) => store.deleteDivision(body)),
  serviceHandler(DemoApi.divisionSelectedManagersList, (body) =>
    store.getPossibleManagers(body.divisionId)
  ),
  serviceHandler(DemoApi.divisionSetManagers, (body) => store.setDivisionManagers(body)),
  serviceHandler(DemoApi.divisionGetNotAssignedUsers, (body) =>
    store.getNotAssignedUsersByBranch(body)
  ),
  serviceHandler(DemoApi.divisionAssignUsers, (body) => store.assignUsersToDivision(body)),
  serviceHandler(DemoApi.poolGetDetailsById, (body) => store.getPoolDetails(body.poolId)),
  serviceHandler(DemoApi.poolGetActiveShortByDivision, (body) =>
    store.getPoolsByDivision(body.divisionId)
  ),
  serviceHandler(DemoApi.poolGetActiveShort, () => store.getAllPoolsShort()),
  serviceHandler(DemoApi.poolAdd, (body) => store.addPool(body)),
  serviceHandler(DemoApi.poolUpdate, (body) => store.updatePool(body)),
  serviceHandler(DemoApi.poolDelete, (body) => store.deletePool(body)),
  serviceHandler(DemoApi.poolGetNotAssignedUsers, (body) => store.getNotAssignedUsersByPool(body)),
  serviceHandler(DemoApi.poolAssignUsers, (body) => store.assignUsersToPool(body)),
  serviceHandler(DemoApi.poolUpdateUserDate, (body) => store.updatePoolUserDate(body)),
  serviceHandler(DemoApi.branchGetList, () => store.getBranches()),
];
