import { AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import settle from "axios/lib/core/settle";
import buildURL from "axios/lib/helpers/buildURL";
import buildFullPath from "axios/lib/core/buildFullPath";
import { isUndefined } from "axios/lib/utils";

/**
 * - Create a request object
 * - Get response body
 * - Check if timeout
 */
export const fetchAdapter = async (
  config: AxiosRequestConfig
): Promise<AxiosResponse> => {
  const request = createRequest(config);
  const promiseChain = [getResponse(request, config)];

  if (config.timeout && config.timeout > 0) {
    promiseChain.push(
      new Promise((res) => {
        setTimeout(() => {
          const message = config.timeoutErrorMessage
            ? config.timeoutErrorMessage
            : "timeout of " + config.timeout + "ms exceeded";
          res(createError(message, config, "ECONNABORTED", request));
        }, config.timeout);
      })
    );
  }

  const data = await Promise.race(promiseChain);
  return new Promise((resolve, reject) => {
    if (data instanceof Error) {
      reject(data);
    } else {
      settle(resolve, reject, data);
    }
  });
};

/**
 * Fetch API stage two is to get response body. This funtion tries to retrieve
 * response body based on response's type
 */
async function getResponse(
  request: Request,
  config: AxiosRequestConfig
): Promise<AxiosResponse> {
  let stageOne: Response;
  try {
    stageOne = await fetch(request);
  } catch (e) {
    return createError("Network Error", config, "ERR_NETWORK", request);
  }

  const response: AxiosResponse = {
    status: stageOne.status,
    statusText: stageOne.statusText,
    headers: Object.fromEntries(stageOne.headers.entries()), // Make a copy of headers
    config: config,
    request,
    data: null,
  };

  if (stageOne.status >= 200 && stageOne.status !== 204) {
    switch (config.responseType) {
      case "arraybuffer":
        response.data = await stageOne.arrayBuffer();
        break;
      case "blob":
        response.data = await stageOne.blob();
        break;
      case "json":
        response.data = await stageOne.json();
        break;
      default:
        response.data = await stageOne.text();
        break;
    }
  }

  return response;
}

/**
 * This function will create a Request object based on configuration's axios
 */
function createRequest(config: AxiosRequestConfig): Request {
  const headers = config.headers as Record<string, string>;

  // HTTP basic authentication
  if (config.auth) {
    const username = config.auth.username || "";
    const password = config.auth.password
      ? decodeURI(encodeURIComponent(config.auth.password))
      : "";
    headers["Authorization"] = `Basic ${btoa(username + ":" + password)}`;
  }

  const method = config.method?.toUpperCase();
  const options: RequestInit = {
    headers: headers,
    method,
  };
  if (method !== "GET" && method !== "HEAD") {
    options.body = config.data;
  }
  // This config is similar to XHR’s withCredentials flag, but with three available values instead of two.
  // So if withCredentials is not set, default value 'same-origin' will be used
  if (!isUndefined(config.withCredentials)) {
    options.credentials = config.withCredentials ? "include" : "omit";
  }

  const fullPath = buildFullPath(config.baseURL, config.url);
  const url = buildURL(fullPath, config.params, config.paramsSerializer);

  // Expected browser to throw error if there is any wrong configuration value
  return new Request(url, options);
}

/**
 * Note:
 *
 *   From version >= 0.27.0, createError function is replaced by AxiosError class.
 *   So I copy the old createError function here for backward compatible.
 *
 *
 *
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
function createError(
  message: string,
  config: AxiosRequestConfig,
  code: string,
  request: Request
): AxiosResponse<AxiosError> {
  const err = new AxiosError(message ?? "Unknown error", code, config, request);

  const response: AxiosResponse = {
    status: Number(err.code),
    statusText: err.status,
    headers: Object.fromEntries(request.headers),
    config,
    request,
    data: err,
  };

  return response;
}
