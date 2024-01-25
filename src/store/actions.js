import { LoadingBar } from "quasar";

export default {
  updateControlCatalogue(context) {
    LoadingBar.start();
    fetch("/api/get-all-controls", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.getters.getToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (data) {
        context.commit("updateControlCatalogue", data);
        LoadingBar.stop();
      });
  },
  updateControlResults(context) {
    LoadingBar.start();

    // console.log("Call /api/get-control-runs with param:", payload);

    fetch("/api/get-control-runs", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${context.getters.getToken}`,
        "Content-Type": "application/json",
      },
    })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        }
      })
      .then(function (data) {
        context.commit("updateControlResults", data);
        LoadingBar.stop();
      });
  },
  updateHideSearch(context, payload) {
    context.commit("updateHideSearch", payload);
  },
  updateSearch(context, payload) {
    context.commit("updateSearch", payload);
  },
  removeToken(context) {
    context.commit("updateTokenValue", "");
  },
  async validateToken(context, token) {
    const response = await fetch("/api/help", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      context.commit("updateTokenValue", token);
      return true;
    } else {
      context.commit("updateTokenValue", "");
      return false;
    }
  },
};
