import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApplicationService, Application } from '../../../../@shared/services/application.service';
import { NotificationService } from '../../../../@shared/services/notification.service';
import { FeatureValue } from '../feature-values-config/feature-values-config.component';
import { ApiService, Plan } from '../../../../@core/services/api.service';

@Component({
  selector: 'app-application-create',
  templateUrl: './application-create.component.html',
  styleUrls: ['./application-create.component.css'],
})
export class ApplicationCreateComponent implements OnInit {
  applicationForm = {
    name: '',
    status: 'active' as 'active' | 'maintenance' | 'inactive',
  };

  featureValues: FeatureValue[] = [];
  plans: Plan[] = [];
  selectedPlanId = '';
  isSubmitting = false;

  constructor(
    public router: Router,
    private applicationService: ApplicationService,
    private notificationService: NotificationService,
    private apiService: ApiService,
  ) {}

  ngOnInit(): void {}

  // Charger les plans disponibles pour pouvoir lier un plan à l'application
  ngAfterViewInit(): void {
    // utiliser apiService pour récupérer les plans
    if ((this as any).apiService && typeof (this as any).apiService.getPlans === 'function') {
      this.apiService.getPlans().subscribe({
        next: (plans: Plan[]) => {
          this.plans = plans || [];
        },
        error: (err: any) => {
          console.warn('Impossible de charger la liste des plans:', err);
          this.plans = [];
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.applicationForm.name.trim()) {
      this.notificationService.warning("Le nom de l'application est requis.", 'Champ requis');
      return;
    }

    this.isSubmitting = true;

    this.applicationService.createApplication(this.applicationForm).subscribe({
      next: (application: Application) => {
        this.notificationService.success(
          `L'application "${application.name}" a été créée avec succès !`,
          'Application créée',
        );

        const appId = (application as any)._id || (application as any).id || '';

        if (this.selectedPlanId && appId) {
          // Récupérer le template de plan choisi et le dupliquer pour l'application
          this.apiService.getPlanById(this.selectedPlanId).subscribe({
            next: (planTemplate: any) => {
              const planToCreate: Partial<Plan> = {
                name: planTemplate.name || `Plan pour ${application.name}`,
                description: planTemplate.description || '',
                price: planTemplate.price || 0,
                currency: planTemplate.currency || 'EUR',
                billingCycle: planTemplate.billingCycle || 'MONTHLY',
                features: planTemplate.features || [],
                limitations: planTemplate.limitations || {},
                applicationId: appId,
                isActive: planTemplate.isActive !== undefined ? planTemplate.isActive : true,
              };

              this.apiService.createPlan(planToCreate).subscribe({
                next: (createdPlan: any) => {
                  // Après création du plan lié, mettre à jour l'application pour définir ce plan par défaut
                  const createdPlanId = this.getPlanId(createdPlan);
                  if (createdPlanId && appId) {
                    this.applicationService
                      .updateApplication(appId, { defaultPlanId: createdPlanId })
                      .subscribe({
                        next: () => {
                          this.notificationService.success(
                            `Le plan a été lié à l'application ${application.name} et défini par défaut.`,
                            'Plan lié',
                          );
                          this.router.navigate(['/applications']);
                        },
                        error: (err: any) => {
                          console.error(
                            "Erreur lors de la mise à jour de l'application avec le plan par défaut:",
                            err,
                          );
                          this.notificationService.error(
                            "L'application a été créée mais la définition du plan par défaut a échoué.",
                            'Plan non défini',
                          );
                          this.router.navigate(['/applications']);
                        },
                      });
                  } else {
                    this.notificationService.success(
                      `Le plan a été lié à l'application ${application.name}.`,
                      'Plan lié',
                    );
                    this.router.navigate(['/applications']);
                  }
                },
                error: (err: any) => {
                  console.error('Erreur lors de la création du plan lié:', err);
                  this.notificationService.error(
                    "L'application a été créée mais l'association du plan a échoué.",
                    'Plan non lié',
                  );
                  this.router.navigate(['/applications']);
                },
              });
            },
            error: (err: any) => {
              console.error('Impossible de récupérer le template de plan:', err);
              this.router.navigate(['/applications']);
            },
          });
        } else {
          // Pas de plan sélectionné, rediriger
          this.router.navigate(['/applications']);
        }
      },
      error: (error: any) => {
        console.error('Erreur lors de la création:', error);
        this.notificationService.error(
          "Une erreur est survenue lors de la création de l'application.",
          'Erreur de création',
        );
        this.isSubmitting = false;
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/applications']);
  }

  onFeatureValuesChange(featureValues: FeatureValue[]): void {
    this.featureValues = featureValues;
    console.log('Feature values updated:', featureValues);
  }

  // Helper utilisé par le template pour récupérer un identifiant de plan (compatible template)
  getPlanId(plan: Plan | any): string {
    return plan && (plan.id || plan._id) ? plan.id || plan._id : '';
  }
}
