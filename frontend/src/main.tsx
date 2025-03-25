import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import axios from "axios";
import { Provider } from "react-redux";
import store from "./redux/store.ts";

axios.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      request.headers["Authorization"] = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    return Promise.reject(error);
  }
);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <Provider store={store}>
  <App />
  </Provider>
);
