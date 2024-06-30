import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";

export function getBaseURL() {
    return "http://0.0.0.0:8000";
}

const axiosService = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

axiosService.interceptors.request.use((config) => {
  const auth = localStorage.getItem("auth");
  if (auth) {
    const { access } = JSON.parse(auth);

    if (access) {
      config.headers.Authorization = `Bearer ${access}`;
    }
  }
  return config;
});

axiosService.interceptors.response.use(
  (res) => Promise.resolve(res),
  (err) => Promise.reject(err)
);

const refreshAuthLogic = async (failedRequest: any) => {
  const auth = localStorage.getItem("auth");
  if (!auth) {
    return Promise.reject(failedRequest);
  }

  const { refresh } = JSON.parse(auth);

  const data = JSON.stringify({ refresh: refresh });
  return axios
    .post("/api/token/refresh/", data, {
      baseURL: getBaseURL(),
      headers: {
        "Content-Type": "application/json",
      },
    })
    .then((resp) => {
      const { access, refresh } = resp.data;
      failedRequest.response.config.headers["Authorization"] = "Bearer " + access;
      const { user } = JSON.parse(auth);
      localStorage.setItem("auth", JSON.stringify({ access, refresh, user }));
    })
    .catch(() => {
      localStorage.removeItem("auth");
    });
};

createAuthRefreshInterceptor(axiosService, refreshAuthLogic);

export function fetcher(url: string) {
  return axiosService.get(url).then((res) => res.data);
}

export default axiosService;
