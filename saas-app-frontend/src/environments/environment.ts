export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001',
  stripePublicKey: 'pk_test_51234567890abcdef', // Replace with your actual Stripe public key
  keycloak: {
    url: 'http://localhost:8080',
    realm: 'saas-platform',
    clientId: 'saas-frontend',
  },
};
