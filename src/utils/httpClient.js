import Axios from "axios";
import { isEmpty } from "lodash";
export class HttpClient {
  static instance;
  axiosInstance;

  constructor() {
    this.axiosInstance = Axios.create({
      baseURL: process.env.VUE_APP_API_HOST_URL,
      timeout: 10000,
      headers: {
        Accept: "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });
    this.axiosInstance.interceptors.request.use((request) =>
      this.requestHandler(request),
    );
    this.axiosInstance.interceptors.response.use(
      (response) => this.responseHandler(response),
      async (error) => {
        if (error.response && error.response.status === 401) {
          throw new Error(error);
        }

        throw error;
      },
    );
  }

  requestHandler = async (request) => {
    const tokenKey = process.env.VUE_APP_AUTH_TOKEN_HEADER_KEY;
    const idToken = window.localStorage.getItem(tokenKey);

    if (!isEmpty(idToken)) {
      request.headers[tokenKey] = idToken;
    }
    return request;
  };

  async responseHandler(response) {
    const refresh_token =
      response.headers[
        process.env.VUE_APP_AUTH_REFRESH_TOKEN_HEADER_KEY.toLowerCase()
      ];
    const tokenKey = process.env.VUE_APP_AUTH_TOKEN_HEADER_KEY;
    const token = window.localStorage.getItem(tokenKey);

    if (!isEmpty(refresh_token)) {
      if (refresh_token !== token) {
        window.localStorage.setItem(tokenKey, refresh_token);
      }
    }
    return response;
  }

  /** 인증 토큰 셋팅 */
  static setToken(token) {
    window.localStorage.setItem(
      process.env.VUE_APP_AUTH_TOKEN_HEADER_KEY,
      `Bearer ${token}`,
    );
  }

  /** 인증 토큰 가져오기 */
  static getToken() {
    return window.localStorage.getItem(
      process.env.VUE_APP_AUTH_TOKEN_HEADER_KEY,
    );
  }

  /** 인증 토큰 제거 */
  static removeToken() {
    window.localStorage.removeItem(process.env.VUE_APP_AUTH_TOKEN_HEADER_KEY);
  }

  static getInstance = () => {
    if (
      HttpClient.instance === null ||
      HttpClient.instance === undefined ||
      !(HttpClient.instance instanceof HttpClient)
    ) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance.axiosInstance;
  };
}

export default HttpClient.getInstance();
