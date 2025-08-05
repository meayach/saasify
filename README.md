# 🚀 Plateforme SaaS - Time-to-Market Accelerator

Cette plateforme aide les entreprises à lancer rapidement leurs applications SaaS en fournissant des modules techniques clés prêts à l'emploi.

## 🏗️ Architecture

- **Backend**: NestJS + MongoDB + Keycloak
- **Frontend**: Angular + NGRX + PrimeNG
- **Base de données**: MongoDB local
- **Authentification**: Keycloak

## 📦 Structure du Projet

```
├── saas-app-backend/     # API NestJS
│   ├── src/
│   │   ├── controllers/  # Contrôleurs REST
│   │   ├── services/     # Services métier
│   │   ├── data/         # Modèles MongoDB
│   │   └── common/       # Utilitaires
│   ├── .env             # Configuration
│   └── package.json
│
└── saas-app-frontend/    # Application Angular
    ├── src/
    │   ├── app/
    │   │   ├── @core/    # Services & modèles
    │   │   ├── @store/   # State management
    │   │   ├── @features/# Composants métier
    │   │   └── @shared/  # Composants partagés
    └── package.json
```

## 🧩 Fonctionnalités Implémentées

### ✅ Modules Backend

- **Gestion des utilisateurs** (UserService, UserController)
- **Applications SaaS** (SaasApplicationService, SaasApplicationController)
- **Plans et abonnements** (Modèles SaasPlan, SaasSubscription)
- **Système de paiement** (Modèles SaasPayment, PaymentMethodConfiguration)
- **Tarification multi-devises** (SaasCurrency, SaasPricing)
- **Configuration applications** (SaasApplicationConfiguration)

### ✅ Modules Frontend

- **Authentification Keycloak** (AuthService, Store)
- **Tableaux de bord par rôle** :
  - Customer Admin: Configuration technique, gestion équipes
  - Customer Manager: Analytics, A/B testing
  - Customer Developer: Sandbox API, debugging
- **State Management NGRX** (Auth, User, Application, Subscription)
- **Interface PrimeNG** responsive

## 🧑‍💼 Rôles Utilisateurs

### Customer Admin

- Configuration technique
- Gestion des équipes et permissions
- Métriques et monitoring
- Paramètres de paiement

### Customer Manager

- Dashboard marketing
- A/B tests et analytics
- Gestion des campagnes
- Rapports de performance

### Customer Developer

- Sandbox API et documentation
- Outils de debugging
- Intégrations techniques
- Tests et déploiement

## 🛠️ Installation et Démarrage

### Prérequis

- Node.js 16+
- MongoDB (local)
- Keycloak 21+ (optionnel pour le développement)

### 1. Installation des dépendances

**Backend:**

```bash
cd saas-app-backend
npm install
```

**Frontend:**

```bash
cd saas-app-frontend
npm install
```

### 2. Configuration de la base de données

Assurez-vous que MongoDB est démarré localement:

```bash
mongod --dbpath /path/to/your/db
```

La base `saas-database` sera créée automatiquement.

### 3. Configuration du Backend

Copiez et modifiez le fichier `.env`:

```bash
cd saas-app-backend
cp .env.example .env
```

Variables importantes:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/saas-database
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:4200
```

### 4. Démarrage des services

**Backend (Terminal 1):**

```bash
cd saas-app-backend
npm run start:dev
```

**Frontend (Terminal 2):**

```bash
cd saas-app-frontend
npm start
```

## 📚 API Documentation

Une fois le backend démarré, accédez à la documentation Swagger:

```
http://localhost:3000/api/docs
```

## 🔑 Endpoints Principaux

### Authentification

- `POST /api/v1/auth/login` - Connexion
- `POST /api/v1/auth/logout` - Déconnexion
- `GET /api/v1/auth/profile` - Profil utilisateur

### Utilisateurs

- `GET /api/v1/users` - Liste des utilisateurs
- `POST /api/v1/users` - Créer un utilisateur
- `GET /api/v1/users/:id` - Détails utilisateur
- `PATCH /api/v1/users/:id` - Modifier utilisateur

### Applications SaaS

- `GET /api/v1/applications` - Liste des applications
- `POST /api/v1/applications` - Créer une application
- `GET /api/v1/applications/:id` - Détails application
- `PATCH /api/v1/applications/:id` - Modifier application
- `POST /api/v1/applications/:id/launch` - Lancer l'application

## 🎨 Interface Utilisateur

L'application frontend est accessible sur:

```
http://localhost:4200
```

### Écrans principaux:

- `/dashboard` - Tableau de bord principal
- `/applications` - Gestion des applications
- `/users` - Gestion des utilisateurs
- `/subscriptions` - Gestion des abonnements
- `/settings` - Configuration

## 🧪 Tests

**Backend:**

```bash
cd saas-app-backend
npm run test
npm run test:e2e
```

**Frontend:**

```bash
cd saas-app-frontend
npm run test
npm run e2e
```

## 📝 Modèles de Données

### User

```typescript
{
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  keycloakId?: string;
}
```

### SaasApplication

```typescript
{
  name: string;
  description: string;
  status: ApplicationStatus;
  type: ApplicationType;
  ownerId: ObjectId;
  slug: string;
}
```

### SaasPlan

```typescript
{
  name: string;
  type: PlanType;
  billingCycle: BillingCycle;
  price: number;
  currencyId: ObjectId;
  features: Record<string, any>;
}
```

## 🚀 Déploiement

### Variables d'environnement Production

**Backend (.env):**

```env
NODE_ENV=production
DATABASE_URL=mongodb://your-production-db/saas-database
KEYCLOAK_URL=https://your-keycloak-server.com
FRONTEND_URL=https://your-frontend-domain.com
```

**Frontend (environment.prod.ts):**

```typescript
export const environment = {
  production: true,
  apiUrl: "https://your-api-domain.com/api/v1",
  keycloak: {
    url: "https://your-keycloak-server.com",
    realm: "saas-platform",
    clientId: "saas-frontend",
  },
};
```

### Build Production

**Backend:**

```bash
npm run build
npm run start:prod
```

**Frontend:**

```bash
npm run build --prod
```

## 🤝 Contribution

1. Fork le projet
2. Créez votre branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou support:

- 📧 Email: support@saas-platform.com
- 📚 Documentation: [docs.saas-platform.com](https://docs.saas-platform.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)

---

**Note**: Cette plateforme est conçue pour accélérer le développement d'applications SaaS. Elle fournit les fondations techniques nécessaires mais doit être adaptée selon vos besoins métier spécifiques.
