import Keycloak from "keycloak-js";
import Cookies from "js-cookie";

const keycloakConfig = {
  url: "https://metahive-keycloak-azure-axb6cqbec7gfcqf3.southeastasia-01.azurewebsites.net",
  realm: "meta",
  clientId: "metahive",
  credentials: {
    secret: "TskqDBGM15Y5uShd1YvmVkjZ5hPrZOLj",
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


