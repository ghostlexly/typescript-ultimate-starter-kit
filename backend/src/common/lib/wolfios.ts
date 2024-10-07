type WolfiosProps = RequestInit & {
  data?: Record<any, any>;
  params?: Record<string, string[] | string>;
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

const request = async (endpoint: string, config: WolfiosProps) => {
  console.log("WOLFIOS - Requesting endpoint:", endpoint);
  const isServer = typeof window === "undefined";

  // create a url from the endpoint
  // if we have a document, use the baseURI as the base URL (client side)
  // otherwise, use the nginx container (server side)
  const url = new URL(endpoint, isServer ? "http://nginx" : document.baseURI);

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
        url.searchParams.append(key, value);
      }
    });
  }

  // ----------------------------------------
  // Make the request
  // ----------------------------------------
  const response = await fetch(url.toString(), config);

  if (!response.ok) {
    const responseBody = await response.json().catch(() => {
      throw new Error(
        `Wolfios Unhandled HTTP Error - Status ${response.status}`
      );
    });

    throw {
      response: {
        data: responseBody,
      },
    };
  }

  return response;
};

export { wolfios };
