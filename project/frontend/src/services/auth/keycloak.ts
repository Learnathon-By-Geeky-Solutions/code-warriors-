import Keycloak from "keycloak-js";
import Cookies from "js-cookie";

const keycloakConfig = {
  url: process.env.REACT_APP_KEYCLOAK_URL ?? "http://localhost:8181",
  realm: process.env.REACT_APP_KEYCLOAK_REALM ?? "meta",
  clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID ?? "metahive",
  credentials: {
    secret: process.env.REACT_APP_KEYCLOAK_SECRET ?? "",
  },
  publicClient: true,
};
export const keycloak = new Keycloak(keycloakConfig);

export const initKeycloak = () => {
  return keycloak.init({
    onLoad: "check-sso",
    // silentCheckSsoRedirectUri:
    //   window.location.origin + "/silent-check-sso.html",
    enableLogging: true,
    checkLoginIframe: false,
    pkceMethod: "S256",
    timeSkew: 30, // Adjust time skew to allow for clock differences
  });
};

export const setAuthToken = () => {
  if (keycloak.token) {
    Cookies.set("token", keycloak.token, { expires: 1 }); // 1 hour expiry
  }
};

const refreshTokenIfNeeded = async () => {
  try {
    await keycloak.updateToken(300); // Request token refresh 5 minutes before expiry
  } catch (error) {
    keycloak.login(); // Force re-authentication if refresh fails
  }
};
