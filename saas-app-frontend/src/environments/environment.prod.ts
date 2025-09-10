export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api/v1',
  keycloak: {
    url: 'https://your-keycloak-server.com',
    realm: 'saas-platform',
    clientId: 'saas-frontend',
  },
  // 🎯 Configuration des logs de débogage - DÉSACTIVÉS en production
  enableDebugLogs: false,
};
