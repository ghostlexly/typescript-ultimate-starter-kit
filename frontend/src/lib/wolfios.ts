import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import { getClientToken } from "./ghostlexly-auth/ghostlexly-auth.client";
import { getServerToken } from "./ghostlexly-auth/ghostlexly-auth.server";

type WolfiosProps = RequestInit & {
  data?: Record<any, any>;
  params?: Record<string, string[] | string | number>;
  cookies?: (() => ReadonlyRequestCookies) | undefined;
};

/**
 * wolfios is a wrapper around fetch that handles authentication, caching and more.
 *
 * @param url The url to request
 * @param config The config for the request
 * @param config.next The config for NextJS caching. When this is set, the request will be cached.
 * Also, the return response will be a JSON object, you DON'T need to chain .then((res) => res.data).
 */
const wolfios = {
  get: async (url: string, config?: WolfiosProps) => {
    return await request(url, {
      ...config,
      method: "GET",
    });
  },

  post: async (url: string, config: WolfiosProps) => {
    return await request(url, {
      ...config,
      method: "POST",
    });
  },

  put: async (url: string, config: WolfiosProps) => {
    return await request(url, {
      ...config,
      method: "PUT",
    });
  },

  delete: async (url: string, config?: WolfiosProps) => {
    return await request(url, {
      ...config,
      method: "DELETE",
    });
  },

  patch: async (url: string, config: WolfiosProps) => {
    return await request(url, {
      ...config,
      method: "PATCH",
    });
  },

  custom: async (url: string, config: WolfiosProps) => {
    return await request(url, {
      ...config,
    });
  },
};

const getAccessToken = async () => {
  const isServer = typeof window === "undefined";

  const accessToken = isServer ? await getServerToken() : getClientToken();

  return accessToken;
};

const request = async (endpoint: string, config: WolfiosProps) => {
  console.log("WOLFIOS - Requesting endpoint:", endpoint);
  const isServer = typeof window === "undefined";

  // create a url from the endpoint
  // if we have a document, use the baseURI as the base URL (client side)
  // otherwise, use the nginx container (server side)
  const url = new URL(endpoint, isServer ? "http://nginx" : document.baseURI);

  // ---------------------------------------
  // get access token
  // and set the Authorization header
  // ----------------------------------------
  const accessToken = await getAccessToken();

  if (accessToken) {
    config.headers = {
      Authorization: `Bearer ${accessToken}`,
      ...config.headers,
    };
  }

  // ---------------------------------------
  // if we have a `data` param, stringify it and set the content type
  // ----------------------------------------
  if (config?.data) {
    config.body = JSON.stringify(config.data);

    config.headers = {
      "Content-Type": "application/json",
      ...config.headers,
    };
  }

  // ----------------------------------------
  // If we have params, add them to the URL
  // ----------------------------------------
  if (config?.params) {
    Object.entries(config.params).map(([key, value], index) => {
      if (Array.isArray(value)) {
        value.map((v) => {
          if (v) {
            url.searchParams.append(key, v);
          }
        });
      } else if (value) {
        url.searchParams.append(key, value.toString());
      }
    });
  }

  // ----------------------------------------
  // Make the request
  // ----------------------------------------
  const response = await fetch(url.toString(), config);

  return await handleApiResponse(response);
};

const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let data: any;
    let errorMessage: string =
      "An error occurred on the server.\nPlease try again.";
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      data = await response.json();

      if (data.message) {
        errorMessage = data.message;
      }
    } else {
      data = await response.text();
    }

    throw {
      response: response,
      data: data,
      message: errorMessage,
    };
  }

  return response;
};

export { wolfios };
