import { config } from '../config';

const SCOPE = 'profile email openid https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/drive.photos.readonly https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/drive.file';
const discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
const API_KEY = config.web.api_key;
const CLIENT_ID = config.web.client_id;

/**
 * Décrypte la chaîne JSON idToken pour accéder aux informations d'utilisateur chiffrées
 * @param {Object} token l'idToken de l'utilisateur
 */
export const parseIDToken = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

/**
 * Simule la connexion d'un nouvel utilisateur à Google et retourne un idToken simulé,
 * un AccessToken, et un Code, tous uniques à l'utilisateur dans un objet Response.
 */
export const authorizeUserHelper = (email, func) => {
  console.log("Skipping Google API authorization for testing.");
  
  // Simuler un accès et ID token
  const accessToken = "test_access_token";
  const idToken = "test_id_token";
  const code = "test_code";

  // Appeler directement `func` avec les valeurs simulées
  func(accessToken, idToken, code);
};

/**
 * Simule le chargement de l'API Google Drive sans appels réels à l'API.
 */
export const loadAuth = (email, func) => {
  console.log("Skipping Google API drive loading for testing.");
  
  // Simuler un succès et appeler `func`
  func();
};

/**
 * Simule le chargement de l'API Google Drive avec paramètres sans appels réels à l'API.
 */
export const loadAuthParam = (email, func) => (...args) => {
  console.log("Skipping Google API drive loading with parameters for testing.");
  
  // Appeler `func` directement avec les arguments
  func.call(this, ...args);
};
