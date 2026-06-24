import axios from "axios";
import { SUCCESS_RESPONSE_STATUS } from "shared/consts";
import { REQUEST_FAILED_MESSAGE } from "shared/messages";
import {
  EServerRequestTypes,
  IRequestFromServerOptions,
  IResponse,
} from "shared/types";
import { defineRequestType } from "shared/helpers/serverRequests/defineRequestType";
import { requestFromApi } from "shared/helpers/serverRequests/requestFromApi";
import { requestFromService } from "shared/helpers/serverRequests/requestFromService";

declare const __DEMO_BASE__: string;

export async function requestFromServer<T>({
  url,
  method,
  params,
  data = {},
}: IRequestFromServerOptions): Promise<IResponse<T>> {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
  };

  const defaultResponse = {
    IsSucceeded: false,
    Message: REQUEST_FAILED_MESSAGE,
  };

  const requestType = defineRequestType(url);
  const demoBase = typeof __DEMO_BASE__ !== "undefined" ? __DEMO_BASE__ : "/divisions/";

  url =
    requestType === EServerRequestTypes.FROM_API
      ? url
      : `${demoBase}Services${url}`.replace(/\/{2,}/g, "/");

  return await axios({
    method,
    url,
    headers,
    data,
    params,
  })
    .then((res) => {
      if (res.status === SUCCESS_RESPONSE_STATUS) {
        switch (requestType) {
          case EServerRequestTypes.FROM_SERVICE:
            return requestFromService<T>(res);
          case EServerRequestTypes.FROM_API:
            return requestFromApi<T>(res);
          default:
            return defaultResponse;
        }
      }
      throw new Error();
    })
    .catch(() => defaultResponse);
}
