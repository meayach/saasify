import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription, EMPTY } from 'rxjs';
import { filter } from 'rxjs/operators';
import { catchError } from 'rxjs/operators';
import {
  ApplicationService,
  Application,
  ApplicationStats,
} from '../../../../@shared/services/application.service';
import { ApplicationConfigurationService } from '../../../../@shared/services/application-configuration.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { UserService } from '../../../../@shared/services/user.service';
import { ConfirmationModalService } from '../../../../@shared/services/confirmation-modal.service';
import { ApplicationRefreshService } from '../../../../@shared/services/application-refresh.service';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css'],
})
export class ApplicationListComponent implements OnInit, OnDestroy {
  // User / header state (for shared header)
  userRole = 'Admin';
  userName = '';
  userEmail = '';
  isDropdownOpen = false;

  applications: Application[] = [];
  applicationStats: ApplicationStats = {
    totalApplications: 0,
    activeApplications: 0,
    deploymentsToday: 0,
    maintenanceApplications: 0,
  };
  loading = true;
  private refreshSubscription: Subscription = new Subscription();

  constructor(
    public router: Router,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private confirmationModalService: ConfirmationModalService,
    private applicationRefreshService: ApplicationRefreshService,
    private configurationService: ApplicationConfigurationService,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    // initialiser les infos utilisateur pour le header
    this.loadUserInfo();

    this.loadApplications();
    this.loadApplicationStats();

    // Écouter les demandes de rafraîchissement du service
    this.refreshSubscription = this.applicationRefreshService.refreshNeeded$.subscribe(() => {
      console.log('🔄 Rafraîchissement demandé par le service');
      this.refreshData();
    });

    // Vérifier périodiquement s'il faut recharger
    setInterval(() => {
      const shouldRefresh = localStorage.getItem('shouldRefreshApplications');
      if (shouldRefresh === 'true') {
        console.log('🔄 Rechargement détecté via localStorage - configuration terminée');
        localStorage.removeItem('shouldRefreshApplications');

        // Forcer un rechargement immédiat et complet
        this.applications = []; // Vider d'abord
        setTimeout(() => {
          this.refreshData();
          console.log('✅ Données rechargées après configuration');
        }, 100);
      }
    }, 500); // Vérifier plus fréquemment (500ms)
  }

  ngOnDestroy(): void {
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  refreshData() {
    console.log('🔄 Rafraîchissement des données...');

    // Sauvegarder les logos actuels avant de vider le tableau
    const logoCache: { [key: string]: string } = {};
    if (this.applications && this.applications.length > 0) {
      console.log('💾 Sauvegarde des logos avant refresh...');
      this.applications.forEach((app) => {
        const idKey = app._id || (app as any).id;
        if (idKey && app.logoUrl) {
          logoCache[idKey] = app.logoUrl;
          // Aussi sauvegarder dans localStorage pour persistence
          localStorage.setItem(`appLogo:${idKey}`, app.logoUrl);
          console.log(`💾 Logo sauvé pour ${idKey}: ${app.logoUrl}`);
        }
      });
    }

    // Vider le tableau pour forcer la mise à jour visuelle
    this.applications = [];
    this.cdr.detectChanges();

    // Recharger après un petit délai
    setTimeout(() => {
      this.loadApplications();
      this.loadApplicationStats();
    }, 50);
  }

  loadUserInfo(): void {
    const currentUser = localStorage.getItem('currentUser');

    if (currentUser) {
      const user = JSON.parse(currentUser);

      if (user.firstName && user.lastName) {
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user.firstname && user.lastname) {
        this.userName = `${user.firstname} ${user.lastname}`;
      } else if (user.name) {
        this.userName = user.name;
      } else if (user.fullName) {
        this.userName = user.fullName;
      } else if (user.email) {
        this.userName = user.email.split('@')[0];
      } else {
        this.userName = 'Utilisateur';
      }

      this.userEmail = user.email || '';
      this.userRole =
        user.role === 'admin'
          ? 'Admin'
          : user.role === 'manager'
          ? 'Customer Manager'
          : 'Customer User';
    } else {
      this.userName = 'Utilisateur';
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  setActiveProfileSection(section: string) {
    // Avant de naviguer, récupérer le profil complet depuis le serveur
    if (section === 'edit') {
      this.userService.getCurrentUserProfile().subscribe({
        next: (profile) => {
          console.log('ApplicationList: profile received', profile);
          // Normaliser et stocker les données utilisateur dans localStorage
          const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
          const updated = {
            ...currentUser,
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            email: profile.email || '',
            phoneNumber: profile.phoneNumber || '',
            streetAddress: profile.streetAddress || '',
            city: profile.city || '',
            zipCode: profile.zipCode || '',
          };
          localStorage.setItem('currentUser', JSON.stringify(updated));

          localStorage.setItem('activeProfileSection', section);
          this.isDropdownOpen = false;
          this.router.navigate(['/settings'], { queryParams: { section: 'profile' } });
        },
        error: (err) => {
          console.warn(
            'ApplicationList: impossible de récupérer le profil, navigation malgré tout',
            err,
          );
          localStorage.setItem('activeProfileSection', section);
          this.isDropdownOpen = false;
          this.router.navigate(['/settings'], { queryParams: { section: 'profile' } });
        },
      });
      return;
    }

    // store a lightweight flag so other components can react if needed
    localStorage.setItem('activeProfileSection', section);
    this.isDropdownOpen = false;
    // navigate to settings if needed
    this.router.navigate(['/settings'], { queryParams: { section: 'profile' } });
  }

  logout(): void {
    this.isDropdownOpen = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    this.router.navigate(['/login']);
    // notification service not injected here; silent logout
  }

  loadApplications(): void {
    this.loading = true;
    console.log("🔄 Chargement des applications depuis l'API...");

    this.applicationService.getApplications().subscribe({
      next: (applications) => {
        console.log('✅ Applications reçues:', applications);
        console.log('🔍 Premier élément brut:', applications[0]);
        // S'assurer que chaque application a une propriété isActive définie
        // et normaliser l'ID renvoyé par le backend (certains endpoints renvoient `id` au lieu de `_id`).
        this.applications = applications.map((app: any) => {
          const normalized = {
            ...app,
            isActive: app.isActive !== undefined ? app.isActive : app.status === 'active',
          } as any;
          // If backend returned `id` (not `_id`), copy it to `_id` so components expect a single shape
          if (!normalized._id && (normalized.id || (normalized as any).ID)) {
            normalized._id = normalized.id || (normalized as any).ID;
          }
          return normalized as Application;
        });

        // If we just returned from configuring an application, only try to apply
        // the logo for that specific application (avoid overwriting others).
        const lastConfiguredAppId = localStorage.getItem('lastConfiguredAppId');
        if (lastConfiguredAppId) {
          // If a stored logo URL exists for that app, apply it immediately, otherwise fetch its configuration
          const target = this.applications.find(
            (a) => a._id === lastConfiguredAppId || (a as any).id === lastConfiguredAppId,
          );
          if (target) {
            const idKey = target._id || (target as any).id;
            const storedLogo = idKey ? localStorage.getItem(`appLogo:${idKey}`) : null;
            if (storedLogo) {
              target.logoUrl = storedLogo;
            } else if (!target.logoUrl) {
              this.fetchAndApplyLogo(target);
            }
          }
          // Clear the flag so subsequent loads behave normally
          localStorage.removeItem('lastConfiguredAppId');
        } else {
          // Normal startup: for apps that do not provide a logoUrl, try to fetch the configuration
          // which may contain a logoPath. Also prefer any per-app stored logo in localStorage.
          this.applications = this.applications.map((app) => {
            const idKey = (app as any)._id || (app as any).id;
            const storedLogo = idKey ? localStorage.getItem(`appLogo:${idKey}`) : null;
            if (storedLogo) {
              console.log(`🔧 Logo restauré depuis localStorage pour ${idKey}: ${storedLogo}`);
            }
            return {
              ...app,
              logoUrl: storedLogo || app.logoUrl,
            } as Application;
          });

          this.applications.forEach((app) => {
            if (!app.logoUrl && app._id) {
              this.fetchAndApplyLogo(app);
            }
          });
        }
        console.log('🔍 Premier élément après traitement:', this.applications[0]);
        // Mettre à jour le compteur de déploiements d'aujourd'hui en se basant sur deployedAt
        try {
          this.applicationStats.deploymentsToday = this.computeDeploymentsToday();
        } catch (e) {
          console.warn('Impossible de calculer deploymentsToday localement', e);
        }
        this.loading = false;
        // Forcer la mise à jour de l'interface
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des applications:', error);
        this.notificationService.error('Erreur lors du chargement des applications');
        this.loading = false;

        // Utiliser des données dynamiques avec timestamp pour forcer la mise à jour
        const now = new Date();
        const timestamp = now.getTime();
        this.applications = [
          {
            _id: `1-${timestamp}`,
            name: `SaaS App 1 (Mis à jour ${now.toLocaleTimeString()})`,
            status: 'active',
            isActive: true,
            createdAt: new Date('2024-01-15'),
          },
          {
            _id: `2-${timestamp}`,
            name: `SaaS App 2 (Mis à jour ${now.toLocaleTimeString()})`,
            status: 'active',
            isActive: true,
            createdAt: new Date('2024-02-10'),
          },
          {
            _id: `3-${timestamp}`,
            name: `SaaS App 3 (Mis à jour ${now.toLocaleTimeString()})`,
            status: 'maintenance',
            isActive: false,
            createdAt: new Date('2024-03-05'),
          },
        ];
        console.log('📝 Données fallback appliquées:', this.applications);
        // Forcer la mise à jour de l'interface même pour les données fallback
        this.cdr.detectChanges();
      },
    });
  }

  private backendBase(): string {
    // Adjust if backend runs on different host/port in production
    return 'http://localhost:3001/';
  }

  private fetchAndApplyLogo(app: Application): void {
    if (!app._id) return;
    this.configurationService
      .getConfiguration(app._id)
      .pipe(
        catchError((err) => {
          // If configuration doesn't exist (404), just ignore silently.
          // For other errors, also suppress to avoid spamming console while keeping UX intact.
          return EMPTY;
        }),
      )
      .subscribe({
        next: (config) => {
          // The backend may return null when no configuration exists for an app.
          if (!config) {
            return; // nothing to apply
          }
          if ((config as any).logoPath) {
            app.logoUrl = this.backendBase() + (config as any).logoPath;

            // Stocker le logo dans localStorage pour éviter de le perdre lors des refresh
            const idKey = app._id || (app as any).id;
            if (idKey && app.logoUrl) {
              localStorage.setItem(`appLogo:${idKey}`, app.logoUrl);
            }

            // force change detection
            this.applications = [...this.applications];
            this.cdr.detectChanges();
          }
        },
      });
  }

  /**
   * Calcule localement le nombre d'applications déployées aujourd'hui
   * en regardant la propriété `deployedAt` de chaque application.
   */
  private computeDeploymentsToday(): number {
    if (!this.applications || this.applications.length === 0) return 0;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);

    return this.applications.reduce((count, app) => {
      if (!app) return count;

      // Prefer deployedAt when available, otherwise fallback to createdAt
      const dateToCheck = app.deployedAt
        ? new Date(app.deployedAt)
        : app.createdAt
        ? new Date(app.createdAt)
        : null;
      if (!dateToCheck) return count;
      if (dateToCheck >= startOfToday && dateToCheck < startOfTomorrow) return count + 1;
      return count;
    }, 0);
  }

  loadApplicationStats(): void {
    this.applicationService.getApplicationStats().subscribe({
      next: (stats) => {
        // Merge stats but prefer a local calculation for deploymentsToday when applications are loaded
        this.applicationStats = {
          ...stats,
          deploymentsToday:
            this.applications && this.applications.length > 0
              ? this.computeDeploymentsToday()
              : stats.deploymentsToday,
        };
      },
      error: (error) => {
        console.error('Erreur lors du chargement des statistiques:', error);
        // Données de fallback
        this.applicationStats = {
          totalApplications: 3,
          activeApplications: 2,
          deploymentsToday: this.computeDeploymentsToday(),
          maintenanceApplications: 1,
        };
      },
    });
  }

  createNewApplication(): void {
    // Nouveau workflow : d'abord choisir le plan, puis créer l'application
    this.router.navigate(['/subscriptions/plans'], {
      queryParams: { returnTo: 'create-application' },
    });
  }

  configureApplication(id: string): void {
    // Navigate to the configuration page. The configure component will
    // set the refresh flags (and persist the logo) once the user saves.
    this.router.navigate(['/applications/configure', id]);
  }

  simpleToggle(index: number): void {
    console.log(
      '🎯 Simple toggle - Index:',
      index,
      'État actuel:',
      this.applications[index].isActive,
    );
    // Persister le changement côté serveur et gérer rollback en cas d'erreur
    const app = this.applications[index];
    if (!app || !app._id) {
      console.error('Application non trouvée ou id manquant pour index', index);
      return;
    }

    const previousState = { isActive: app.isActive, status: app.status };
    const newIsActive = !app.isActive;

    // Mise à jour optimiste de l'UI
    app.isActive = newIsActive;
    app.status = newIsActive ? 'active' : 'inactive';
    this.applications = [...this.applications]; // nouvelle référence pour forcer détection
    this.cdr.detectChanges();

    console.log('✅ Nouvel état (optimiste):', app.isActive);

    // Notification immédiate
    this.notificationService.success(
      `Application ${app.isActive ? 'activée' : 'désactivée'} avec succès`,
      'Statut mis à jour',
    );

    // Appel API pour persister
    this.applicationService.updateApplicationStatus(app._id!, newIsActive).subscribe({
      next: () => {
        console.log('💾 Sauvegarde réussie pour', app.name);
        // Notifier les autres composants (configuration) du changement
        this.applicationRefreshService.triggerRefresh();
      },
      error: (error: any) => {
        console.error('❌ Erreur lors de la sauvegarde du statut:', error);
        // Rollback de l'état
        app.isActive = previousState.isActive;
        app.status = previousState.status;
        this.applications = [...this.applications];
        this.cdr.detectChanges();
        this.notificationService.error('Erreur lors de la sauvegarde');
      },
    });
  }

  manualToggle(id: string, app: Application): void {
    console.log('🎯 Toggle manuel - Application:', app.name, 'État actuel:', app.isActive);

    // Trouver l'index de l'application
    const appIndex = this.applications.findIndex(
      (a) => a._id === id || (a._id && a._id.startsWith(id.split('-')[0])),
    );

    if (appIndex !== -1) {
      // Créer une nouvelle version de l'application avec l'état inversé
      const newApp = {
        ...this.applications[appIndex],
        isActive: !this.applications[appIndex].isActive,
      };
      newApp.status = newApp.isActive ? 'active' : 'inactive';

      console.log('✅ Nouvel état:', newApp.isActive);

      // Créer un nouveau tableau avec la nouvelle application
      this.applications = [
        ...this.applications.slice(0, appIndex),
        newApp,
        ...this.applications.slice(appIndex + 1),
      ];

      // Forcer la détection de changements
      this.cdr.detectChanges();

      // Notification immédiate
      this.notificationService.success(
        `Application ${newApp.isActive ? 'activée' : 'désactivée'} avec succès`,
        'Statut mis à jour',
      );

      console.log('🔄 Tableau mis à jour:', this.applications[appIndex].isActive);

      // Appel API en arrière-plan (optionnel)
      this.applicationService.updateApplicationStatus(id, newApp.isActive).subscribe({
        next: () => {
          console.log('💾 Sauvegarde réussie');
          // Notifier les autres composants du changement
          this.applicationRefreshService.triggerRefresh();
        },
        error: (error: any) => {
          console.error('❌ Erreur sauvegarde:', error);
          // En cas d'erreur, remettre l'ancien état
          this.applications[appIndex].isActive = !newApp.isActive;
          this.applications[appIndex].status = this.applications[appIndex].isActive
            ? 'active'
            : 'inactive';
          this.applications = [...this.applications]; // Force update
          this.cdr.detectChanges();
          this.notificationService.error('Erreur lors de la sauvegarde');
        },
      });
    }
  }

  onToggleChange(id: string, isActive: boolean): void {
    console.log('🔄 Nouveau toggle avec ngModel - ID:', id, 'Statut:', isActive);

    const app = this.applications.find(
      (a) => a._id === id || (a._id && a._id.startsWith(id.split('-')[0])),
    );

    if (app) {
      console.log(
        '📝 Application trouvée:',
        app.name,
        'Ancien état:',
        app.isActive,
        'Nouveau état:',
        isActive,
      );

      // Mettre à jour le statut
      app.status = isActive ? 'active' : 'inactive';

      // Simulation d'un appel API
      this.applicationService.updateApplicationStatus(id, isActive).subscribe({
        next: () => {
          this.notificationService.success(
            `Application ${isActive ? 'activée' : 'désactivée'} avec succès`,
            'Statut mis à jour',
          );
          console.log('✅ Mise à jour réussie');
        },
        error: (error: any) => {
          console.error('❌ Erreur lors de la mise à jour du statut:', error);
          // Annuler le changement en cas d'erreur
          app.isActive = !isActive;
          app.status = !isActive ? 'active' : 'inactive';
          this.notificationService.error('Erreur lors de la mise à jour du statut');
        },
      });
    } else {
      console.error('❌ Application non trouvée pour ID:', id);
    }
  }

  toggleApplicationStatus(id: string, event: any): void {
    console.log('🔄 Toggle pour ID:', id, 'Nouveau statut:', event.target.checked);
    const isActive = event.target.checked;

    // Chercher l'application par ID ou par ID original (sans timestamp)
    let app = this.applications.find((a) => a._id === id);
    if (!app) {
      // Si pas trouvé, chercher par ID original (sans le timestamp)
      const originalId = id.split('-')[0];
      app = this.applications.find((a) => a._id && a._id.startsWith(originalId));
    }

    if (app) {
      console.log('📝 Application trouvée:', app.name, 'État actuel:', app.isActive);
      // Mise à jour optimiste de l'UI
      app.isActive = isActive;
      app.status = isActive ? 'active' : 'inactive';

      // Créer une nouvelle référence du tableau pour forcer Angular à détecter le changement
      this.applications = [...this.applications];

      // Forcer la mise à jour de l'interface
      this.cdr.detectChanges();

      console.log('✅ Interface mise à jour, nouvel état:', app.isActive);

      // Simulation d'un appel API - À remplacer par un vrai appel
      this.applicationService.updateApplicationStatus(id, isActive).subscribe({
        next: () => {
          this.notificationService.success(
            `Application ${isActive ? 'activée' : 'désactivée'} avec succès`,
            'Statut mis à jour',
          );
          // Recharger les données pour s'assurer que tout est à jour
          this.refreshData();
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          // Revenir à l'état précédent en cas d'erreur
          app!.isActive = !isActive;
          app!.status = !isActive ? 'active' : 'inactive';
          event.target.checked = !isActive;
          this.notificationService.error('Erreur lors de la mise à jour du statut');
          // Forcer la mise à jour après l'erreur
          this.cdr.detectChanges();
        },
      });
    } else {
      console.error('❌ Application non trouvée pour ID:', id);
    }
  }

  deleteApplication(id: string): void {
    const app = this.applications.find((a) => a._id === id);
    const appName = app ? app.name : 'cette application';

    this.confirmationModalService
      .confirm({
        title: "Supprimer l'application",
        message: `Êtes-vous sûr de vouloir supprimer "${appName}" ? Cette action est irréversible.`,
        confirmText: 'Supprimer',
        cancelText: 'Annuler',
        type: 'danger',
      })
      .subscribe((confirmed) => {
        if (confirmed) {
          this.applicationService.deleteApplication(id).subscribe({
            next: () => {
              this.notificationService.success(
                `L'application "${appName}" a été supprimée avec succès`,
              );
              // Marquer qu'un rafraîchissement est nécessaire
              localStorage.setItem('shouldRefreshApplications', 'true');
              this.loadApplications();
            },
            error: (error) => {
              console.error('Erreur lors de la suppression:', error);
              this.notificationService.error("Erreur lors de la suppression de l'application");
            },
          });
        }
      });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'maintenance':
        return '#f59e0b';
      case 'inactive':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'maintenance':
        return 'Maintenance';
      case 'inactive':
        return 'Inactif';
      default:
        return 'Inconnu';
    }
  }

  // TrackBy function pour forcer la mise à jour du DOM
  trackByFn(index: number, item: Application): string {
    return item._id + '-' + item.name; // Utiliser ID + nom pour forcer la mise à jour
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'assets/logo-saasify.svg';
    }
  }
}
