import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationService, ApplicationStats } from '../../services/application.service';
import { NotificationService } from '../../services/notification.service';
import { SubscriptionService, SubscriptionStats } from '../../services/subscription.service';
import { OrganizationService, OrganizationSettings } from '../../services/organization.service';
import { SecurityService, SecuritySettings, AuditLog } from '../../services/security.service';
import {
  BillingService,
  BillingSettings,
  Plan,
  PaymentMethod,
  Invoice,
} from '../../services/billing.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  userRole = 'Customer Admin';
  userName = '';
  userEmail = '';
  isDropdownOpen = false;
  currentRoute = '';
  activeSettingsSection = ''; // 'organization' | 'security' | 'billing' | ''
  activeSettingsSubsection = '';

  // Données de l'organisation
  organizationSettings: OrganizationSettings = {
    companyName: '',
    email: '',
    phone: '',
    description: '',
    website: '',
    industry: '',
    timezone: 'Europe/Paris',
    language: 'Français',
  };

  // Données de sécurité
  securitySettings: SecuritySettings = {
    twoFactorEnabled: false,
    sessionTimeout: 120,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
    },
    auditLogEnabled: true,
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 30,
    },
    allowedIpRanges: [],
    apiAccessEnabled: true,
    webhookUrls: [],
  };

  // Données de facturation
  billingSettings: BillingSettings = {
    defaultCurrency: 'EUR',
    taxRate: 20,
    paymentMethods: ['stripe', 'paypal'],
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    companyAddress: '',
    autoRenewal: true,
    invoiceDueDays: 30,
  };

  plans: Plan[] = [];
  paymentMethods: PaymentMethod[] = [];
  invoices: Invoice[] = [];
  auditLogs: AuditLog[] = [];

  // Loading states
  loadingSecuritySettings = false;
  loadingBillingSettings = false;
  loadingPlans = false;

  // Form states
  newPlan: Partial<Plan> = {
    name: '',
    description: '',
    price: 0,
    interval: 'month',
    features: [],
    maxUsers: 10,
    maxApplications: 5,
    isActive: true,
    hasApiAccess: false,
    hasAdvancedAnalytics: false,
    hasPrioritySupport: false,
  };

  // Statistiques des applications
  applicationStats: ApplicationStats = {
    totalApplications: 12,
    activeApplications: 8,
    deploymentsToday: 3,
    maintenanceApplications: 1,
  };

  // Données pour les statistiques
  stats = [
    { title: 'Applications Actives', value: '12', icon: 'pi pi-desktop' },
    { title: 'Utilisateurs', value: '247', icon: 'pi pi-users' },
    { title: 'Revenus Mensuels', value: '€8,450', icon: 'pi pi-euro' },
    { title: 'Taux de Conversion', value: '3.2%', icon: 'pi pi-chart-line' },
  ];

  // Activités récentes
  recentActivities = [
    { action: 'Nouvel utilisateur inscrit', time: 'il y a 5 min', type: 'user' },
    { action: 'Application déployée', time: 'il y a 1h', type: 'deployment' },
    { action: 'Paiement reçu', time: 'il y a 2h', type: 'payment' },
    { action: 'Mise à jour système', time: 'il y a 4h', type: 'system' },
  ];

  constructor(
    public router: Router,
    private route: ActivatedRoute,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private subscriptionService: SubscriptionService,
    private organizationService: OrganizationService,
    private securityService: SecurityService,
    private billingService: BillingService,
  ) {}

  ngOnInit(): void {
    // Suivre les changements de route
    this.router.events.subscribe(() => {
      this.currentRoute = this.router.url;
    });

    // Suivre les paramètres de query pour les sections de paramètres
    this.route.queryParams.subscribe((params) => {
      this.activeSettingsSection = params['section'] || '';
      this.activeSettingsSubsection = params['subsection'] || '';
    });

    // Charger les paramètres de l'organisation
    this.loadOrganizationSettings();

    // Charger les paramètres de sécurité
    this.loadSecuritySettings();

    // Charger les paramètres de facturation
    this.loadBillingSettings();

    // Initialiser les données
    this.refreshStats();
  }

  getPageTitle(): string {
    switch (this.currentRoute) {
      case '/applications':
        return 'Gestion des Applications';
      case '/subscriptions':
        return 'Gestion des Abonnements';
      case '/analytics':
        return 'Analyses et Statistiques';
      case '/settings':
        if (this.activeSettingsSection === 'organization') {
          return "Paramètres de l'Organisation";
        } else if (this.activeSettingsSection === 'security') {
          return 'Paramètres de Sécurité';
        } else if (this.activeSettingsSection === 'billing') {
          return 'Paramètres de Facturation';
        }
        return 'Paramètres';
      default:
        return 'Dashboard';
    }
  }

  getPageDescription(): string {
    switch (this.currentRoute) {
      case '/applications':
        return 'Créez, gérez et surveillez vos applications SaaS';
      case '/subscriptions':
        return 'Suivez vos abonnements et la facturation';
      case '/analytics':
        return 'Consultez vos métriques de performance';
      case '/settings':
        return 'Configurez votre plateforme SaaS';
      default:
        return 'Bienvenue sur votre tableau de bord';
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  editProfile(): void {
    this.isDropdownOpen = false;
    console.log('Modifier le profil');
  }

  changePassword(): void {
    this.isDropdownOpen = false;
    console.log('Changer le mot de passe');
  }

  viewNotifications(): void {
    this.isDropdownOpen = false;
    console.log('Voir les notifications');
  }

  logout(): void {
    this.isDropdownOpen = false;
    console.log('Déconnexion');
    this.router.navigate(['/login']);
  }

  // Navigation vers les différentes sections
  navigateToApplications(): void {
    this.router.navigate(['/applications']);
  }

  navigateToSubscriptions(): void {
    this.router.navigate(['/subscriptions']);
  }

  navigateToAnalytics(): void {
    this.router.navigate(['/analytics']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  // Gestion des applications
  createNewApplication(): void {
    this.router.navigate(['/applications/create']);
  }

  // Gestion des abonnements
  generateMonthlyReport(): void {
    console.log('Génération du rapport mensuel...');
    this.notificationService.success('Rapport mensuel généré avec succès !');

    // Simuler la génération d'un fichier
    const reportData = `Rapport Mensuel - ${new Date().toLocaleDateString()}
    
Abonnements Actifs: 45
Revenus Mensuels: €2,450
En Attente: 3
Nouveaux Clients: 8
Taux de Rétention: 94%

Détails par Plan:
- Plan Starter: 27 clients (€513)
- Plan Pro: 15 clients (€735)
- Plan Enterprise: 3 clients (€1,202)
`;

    const blob = new Blob([reportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-mensuel-${new Date().toISOString().slice(0, 7)}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  // Gestion des paramètres d'organisation
  loadOrganizationSettings(): void {
    this.organizationService.getOrganizationSettings().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.organizationSettings = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paramètres:', error);
        // Charger des valeurs par défaut en cas d'erreur
        this.organizationSettings = {
          companyName: 'Mon Entreprise SaaS',
          email: 'contact@monentreprise.com',
          phone: '+33 1 23 45 67 89',
          description: "Plateforme SaaS innovante pour la gestion d'entreprise",
          website: 'https://monentreprise.com',
          industry: 'Technologie',
          timezone: 'Europe/Paris',
          language: 'Français',
        };
      },
    });
  }

  saveOrganizationSettings(): void {
    console.log("Sauvegarde des paramètres d'organisation...", this.organizationSettings);

    this.organizationService.updateOrganizationSettings(this.organizationSettings).subscribe({
      next: (response: OrganizationSettings) => {
        console.log('Réponse du serveur:', response);
        this.notificationService.success("Paramètres d'organisation sauvegardés avec succès !");
      },
      error: (error) => {
        console.error('Erreur complète:', error);
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Error details:', error.error);

        let errorMessage = 'Erreur lors de la sauvegarde des paramètres';
        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur';
        } else if (error.status === 404) {
          errorMessage = "URL de l'API introuvable";
        } else if (error.error?.message) {
          errorMessage = `Erreur: ${error.error.message}`;
        }

        this.notificationService.error(errorMessage);
      },
    });
  }

  changeOrganizationLogo(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.organizationService.uploadLogo(file).subscribe({
          next: (response: any) => {
            console.log('Upload response:', response);
            if (response.success) {
              this.organizationSettings.logoUrl = response.data.logoUrl;
              this.notificationService.success('Logo uploadé avec succès !');
            } else {
              this.notificationService.error(response.message || "Erreur lors de l'upload du logo");
            }
          },
          error: (error) => {
            console.error("Erreur lors de l'upload du logo:", error);
            let errorMessage = "Erreur lors de l'upload du logo";

            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            } else if (error.message) {
              errorMessage = error.message;
            }

            this.notificationService.error(errorMessage);
          },
        });
      }
    };
    input.click();
  }

  // Navigation vers les sections de paramètres
  modifyOrganizationSettings(): void {
    this.activeSettingsSection = 'organization';
    this.loadOrganizationSettings();
  }

  configureSecurity(): void {
    this.activeSettingsSection = 'security';
    this.loadSecuritySettings();
  }

  manageBilling(): void {
    this.activeSettingsSection = 'billing';
    this.loadBillingSettings();
  }

  // Retour au dashboard principal
  backToDashboard(): void {
    this.activeSettingsSection = '';
    this.activeSettingsSubsection = '';
  }

  // === MÉTHODES DE SÉCURITÉ ===

  loadSecuritySettings(): void {
    this.loadingSecuritySettings = true;
    this.securityService.getSecuritySettings().subscribe({
      next: (settings) => {
        this.securitySettings = settings;
        this.loadingSecuritySettings = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paramètres de sécurité:', error);
        const errorMessage =
          error.message || 'Erreur lors du chargement des paramètres de sécurité';
        this.notificationService.error(errorMessage);
        this.loadingSecuritySettings = false;
      },
    });

    // Charger les logs d'audit
    this.securityService.getAuditLogs().subscribe({
      next: (response) => {
        this.auditLogs = response.logs;
      },
      error: (error) => {
        console.error("Erreur lors du chargement des logs d'audit:", error);
        const errorMessage = error.message || "Erreur lors du chargement des logs d'audit";
        this.notificationService.error(errorMessage);
      },
    });
  }

  saveSecuritySettings(): void {
    console.log('🔄 Début de la sauvegarde des paramètres de sécurité...');
    console.log('📊 Données actuelles:', this.securitySettings);

    // Validation des données avant envoi
    if (!this.securitySettings) {
      console.error('❌ Aucune donnée de sécurité à sauvegarder');
      this.notificationService.error('Aucune donnée à sauvegarder');
      return;
    }

    // Créer un objet propre avec validation
    const cleanSettings = {
      twoFactorEnabled: Boolean(this.securitySettings.twoFactorEnabled),
      sessionTimeout: Number(this.securitySettings.sessionTimeout) || 120,
      passwordPolicy: {
        minLength: Number(this.securitySettings.passwordPolicy?.minLength) || 8,
        requireUppercase: Boolean(this.securitySettings.passwordPolicy?.requireUppercase),
        requireLowercase: Boolean(this.securitySettings.passwordPolicy?.requireLowercase),
        requireNumbers: Boolean(this.securitySettings.passwordPolicy?.requireNumbers),
        requireSpecialChars: Boolean(this.securitySettings.passwordPolicy?.requireSpecialChars),
      },
      auditLogEnabled: Boolean(this.securitySettings.auditLogEnabled),
      loginAttempts: {
        maxAttempts: Number(this.securitySettings.loginAttempts?.maxAttempts) || 5,
        lockoutDuration: Number(this.securitySettings.loginAttempts?.lockoutDuration) || 30,
      },
      allowedIpRanges: Array.isArray(this.securitySettings.allowedIpRanges)
        ? this.securitySettings.allowedIpRanges
        : [],
      apiAccessEnabled: Boolean(this.securitySettings.apiAccessEnabled),
      webhookUrls: Array.isArray(this.securitySettings.webhookUrls)
        ? this.securitySettings.webhookUrls
        : [],
    };

    console.log('✨ Données nettoyées et validées:', cleanSettings);
    console.log('🚀 Envoi de la requête...');

    this.securityService.updateSecuritySettings(cleanSettings).subscribe({
      next: (settings) => {
        console.log('✅ Réponse reçue du serveur:', settings);
        this.securitySettings = settings;
        this.notificationService.success('Paramètres de sécurité sauvegardés avec succès !');
        console.log('🎉 Sauvegarde terminée avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur détaillée lors de la sauvegarde:', {
          message: error.message,
          status: error.status,
          error: error.error,
          url: error.url,
          fullError: error,
        });
        const errorMessage =
          error.message || 'Erreur lors de la sauvegarde des paramètres de sécurité';
        this.notificationService.error(`Erreur: ${errorMessage}`);
        console.log('💔 Sauvegarde échouée');
      },
    });
  }

  // === MÉTHODES DE FACTURATION ===

  loadBillingSettings(): void {
    this.loadingBillingSettings = true;

    // Charger les paramètres de facturation
    this.billingService.getBillingSettings().subscribe({
      next: (settings) => {
        this.billingSettings = settings;
        this.loadingBillingSettings = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des paramètres de facturation:', error);
        this.notificationService.error('Erreur lors du chargement des paramètres de facturation');
        this.loadingBillingSettings = false;
      },
    });

    // Charger les plans
    this.loadingPlans = true;
    this.billingService.getPlans().subscribe({
      next: (plans) => {
        this.plans = plans;
        this.loadingPlans = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des plans:', error);
        this.loadingPlans = false;
      },
    });

    // Charger les méthodes de paiement
    this.billingService.getPaymentMethods().subscribe({
      next: (methods) => {
        this.paymentMethods = methods;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des méthodes de paiement:', error);
      },
    });

    // Charger les factures récentes
    this.billingService.getInvoices(1, 10).subscribe({
      next: (response) => {
        this.invoices = response.invoices;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des factures:', error);
      },
    });
  }

  saveBillingSettings(): void {
    console.log('🔄 Dashboard: Démarrage sauvegarde facturation...');
    console.log('📦 Dashboard: Données brutes:', this.billingSettings);

    // Nettoyer les données en supprimant les champs MongoDB
    const cleanSettings = {
      defaultCurrency: this.billingSettings.defaultCurrency,
      taxRate: this.billingSettings.taxRate,
      companyAddress: this.billingSettings.companyAddress,
      paymentMethods: this.billingSettings.paymentMethods,
      companyName: this.billingSettings.companyName,
      companyEmail: this.billingSettings.companyEmail,
      companyPhone: this.billingSettings.companyPhone,
      autoRenewal: this.billingSettings.autoRenewal,
      invoiceDueDays: this.billingSettings.invoiceDueDays,
    };

    console.log('🧹 Dashboard: Données nettoyées:', cleanSettings);

    this.billingService.updateBillingSettings(cleanSettings).subscribe({
      next: (settings) => {
        console.log('✅ Dashboard: Sauvegarde réussie:', settings);
        this.billingSettings = settings;
        this.notificationService.success('Paramètres de facturation sauvegardés avec succès !');
      },
      error: (error) => {
        console.error('❌ Dashboard: Erreur lors de la sauvegarde:', error);
        console.error('❌ Dashboard: Détails erreur:', error.error);
        this.notificationService.error(
          'Erreur lors de la sauvegarde des paramètres de facturation',
        );
      },
    });
  }

  createPlan(): void {
    if (!this.newPlan.name || !this.newPlan.description || this.newPlan.price === undefined) {
      this.notificationService.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.billingService.createPlan(this.newPlan).subscribe({
      next: (plan) => {
        this.plans.push(plan);
        this.notificationService.success('Plan créé avec succès !');
        this.resetNewPlan();
      },
      error: (error) => {
        console.error('Erreur lors de la création du plan:', error);
        this.notificationService.error('Erreur lors de la création du plan');
      },
    });
  }

  deletePlan(planId: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce plan ?')) {
      this.billingService.deletePlan(planId).subscribe({
        next: () => {
          this.plans = this.plans.filter((p) => p._id !== planId);
          this.notificationService.success('Plan supprimé avec succès !');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur lors de la suppression du plan');
        },
      });
    }
  }

  resetNewPlan(): void {
    this.newPlan = {
      name: '',
      description: '',
      price: 0,
      interval: 'month',
      features: [],
      maxUsers: 10,
      maxApplications: 5,
      isActive: true,
      hasApiAccess: false,
      hasAdvancedAnalytics: false,
      hasPrioritySupport: false,
    };
  }

  addFeatureToPlan(): void {
    const featureInput = document.getElementById('newFeature') as HTMLInputElement;
    if (featureInput && featureInput.value.trim()) {
      if (!this.newPlan.features) this.newPlan.features = [];
      this.newPlan.features.push(featureInput.value.trim());
      featureInput.value = '';
    }
  }

  removeFeature(index: number): void {
    if (this.newPlan.features) {
      this.newPlan.features.splice(index, 1);
    }
  }

  manageBillingPlans(): void {
    this.router.navigate(['/settings'], {
      queryParams: { section: 'billing', subsection: 'plans' },
    });
  }

  // Actions des paramètres
  updateSecuritySettings(): void {
    console.log('Mise à jour des paramètres de sécurité');
    this.notificationService.success('Paramètres de sécurité mis à jour !');
  }

  saveAllPlansSettings(): void {
    console.log('Sauvegarde de tous les plans');
    this.notificationService.success('Tous les plans ont été sauvegardés !');
  }

  createNewPlan(): void {
    console.log("Création d'un nouveau plan");
    this.notificationService.info('Formulaire de création de plan ouvert');
  }

  private refreshStats(): void {
    this.applicationService.getStats().subscribe({
      next: (stats: ApplicationStats) => {
        this.applicationStats = stats;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        this.notificationService.error('Erreur lors du chargement des statistiques');
      },
    });
  }
}
