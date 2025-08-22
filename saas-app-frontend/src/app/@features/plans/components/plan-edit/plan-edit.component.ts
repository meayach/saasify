import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { BillingService } from '../../../../@shared/services/billing.service';
import { NotificationService } from '../../../../@shared/services/notification.service';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  maxUsers: number;
  status: 'active' | 'inactive';
  isPopular: boolean;
  createdDate: Date;
}

interface PlanFeature {
  name: string;
  included: boolean;
}

@Component({
  selector: 'app-plan-edit',
  templateUrl: './plan-edit.component.html',
  styleUrls: ['./plan-edit.component.css'],
})
export class PlanEditComponent implements OnInit {
  planForm: FormGroup;
  loading = false;
  planData: Plan | null = null;
  planId: string | null = null;
  lastResponse: any = null;
  lastError: any = null;

  predefinedFeatures: PlanFeature[] = [
    { name: 'Support par email', included: false },
    { name: 'Tableau de bord basique', included: false },
    { name: 'Support prioritaire', included: false },
    { name: 'Analyses avancées', included: false },
    { name: 'API complète', included: false },
    { name: 'Intégrations tierces', included: false },
    { name: 'Support 24/7', included: false },
    { name: 'Déploiement sur site', included: false },
    { name: 'SLA garanti', included: false },
    { name: 'Manager dédié', included: false },
  ];

  constructor(
    private fb: FormBuilder,
    public router: Router,
    private route: ActivatedRoute,
    private billingService: BillingService,
    private notificationService: NotificationService,
  ) {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      maxUsers: [100, [Validators.required, Validators.min(-1)]],
      isPopular: [false],
      status: ['active', Validators.required],
      features: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.planId = this.route.snapshot.paramMap.get('id');
    this.loadPlanData();
  }

  get featuresArray(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  loadPlanData(): void {
    if (!this.planId) return;

    this.loading = true;

    // Charger le plan via le service de facturation
    this.billingService.getPlans().subscribe({
      next: (plans) => {
        // Rechercher par _id ou id
        const found: any = plans.find((p: any) => p._id === this.planId || p.id === this.planId);
        if (found) {
          this.planData = {
            id: found._id,
            name: found.name || '',
            description: found.description || '',
            price: found.price || 0,
            // API doesn't include currency; default to EUR
            currency: 'EUR',
            features: found.features || [],
            maxUsers: typeof found.maxUsers === 'number' ? found.maxUsers : 100,
            status: found.isActive === false ? 'inactive' : 'active',
            isPopular: !!found.isPopular,
            createdDate: found.createdAt ? new Date(found.createdAt) : new Date(),
          };
        } else {
          // Fallback: si non trouvé, initialiser avec des valeurs par défaut
          this.planData = {
            id: this.planId!,
            name: '',
            description: '',
            price: 0,
            currency: 'EUR',
            features: [],
            maxUsers: 100,
            status: 'inactive',
            isPopular: false,
            createdDate: new Date(),
          };
        }

        this.initializeForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement du plan:', err);
        // Fallback local si l'API échoue
        this.planData = {
          id: this.planId!,
          name: '',
          description: '',
          price: 0,
          currency: 'EUR',
          features: [],
          maxUsers: 100,
          status: 'inactive',
          isPopular: false,
          createdDate: new Date(),
        };
        this.initializeForm();
        this.loading = false;
      },
    });
  }

  initializeForm(): void {
    if (!this.planData) return;

    // Remplir le formulaire avec les données existantes
    this.planForm.patchValue({
      name: this.planData.name,
      description: this.planData.description,
      price: this.planData.price,
      currency: this.planData.currency,
      maxUsers: this.planData.maxUsers,
      isPopular: this.planData.isPopular,
      status: this.planData.status,
    });

    // Initialiser les fonctionnalités
    this.initializeFeatures();
  }

  initializeFeatures(): void {
    // Nettoyer le FormArray existant
    while (this.featuresArray.length !== 0) {
      this.featuresArray.removeAt(0);
    }

    // Ajouter les fonctionnalités prédéfinies
    this.predefinedFeatures.forEach((feature) => {
      const isIncluded = this.planData?.features.includes(feature.name) || false;
      this.featuresArray.push(
        this.fb.group({
          name: [feature.name, Validators.required],
          included: [isIncluded],
        }),
      );
    });

    // Ajouter les fonctionnalités personnalisées (si il y en a)
    if (this.planData) {
      const customFeatures = this.planData.features.filter(
        (f) => !this.predefinedFeatures.some((pf) => pf.name === f),
      );

      customFeatures.forEach((feature) => {
        this.featuresArray.push(
          this.fb.group({
            name: [feature, Validators.required],
            included: [true],
          }),
        );
      });
    }
  }

  addCustomFeature(): void {
    this.featuresArray.push(
      this.fb.group({
        name: ['', Validators.required],
        included: [true],
      }),
    );
  }

  removeFeature(index: number): void {
    if (index >= this.predefinedFeatures.length) {
      this.featuresArray.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.planForm.valid && this.planData) {
      this.loading = true;

      const formData = this.planForm.value;
      const selectedFeatures = formData.features
        .filter((f: any) => f.included)
        .map((f: any) => f.name);

      // Build payload that matches backend UpdatePlanDto (allowed: name, description, price, interval, features, isActive)
      const updatedPlan: any = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        features: selectedFeatures,
        // map status -> isActive expected by API
        isActive: formData.status === 'active',
      };

      // include interval only if present on the form or existing planData
      if (formData.interval) {
        updatedPlan.interval = formData.interval;
      } else if ((this.planData as any)?.interval) {
        updatedPlan.interval = (this.planData as any).interval;
      }

      // Appel réel à l'API pour mettre à jour le plan (payload filtered to allowed fields)
      const planIdToUpdate = this.planData.id || this.planId!;
      console.log('updatePlan: planId=', planIdToUpdate, 'payload=', updatedPlan);
      this.billingService.updatePlan(planIdToUpdate, updatedPlan).subscribe({
        next: (res) => {
          console.log('Plan modifié avec succès', res);
          this.lastResponse = res;
          try {
            this.notificationService.success('Plan mis à jour');
          } catch (e) {
            console.warn('Notification service failed', e);
          }
          this.loading = false;
          console.log('Navigation vers /subscriptions/plans (déclenchement)');
          // utiliser setTimeout pour s'assurer que la navigation se produit après la mise à jour UI
          setTimeout(() => {
            this.router
              .navigateByUrl('/subscriptions/plans')
              .then((ok) => console.log('router.navigateByUrl result=', ok))
              .catch((err) => console.error('router.navigateByUrl error=', err));
          }, 0);
        },
        error: (err) => {
          console.error('Erreur lors de la mise à jour du plan:', err);
          this.lastError = err;
          try {
            this.notificationService.error('Erreur lors de la mise à jour du plan');
          } catch (e) {
            console.warn('Notification service failed', e);
          }
          this.loading = false;
        },
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/subscriptions', 'plans']);
  }

  isPredefinedFeature(index: number): boolean {
    return index < this.predefinedFeatures.length;
  }

  // Retourne la liste des contrôles invalides (utilisé pour debug dans le template)
  getInvalidControls(): string[] {
    const invalid: string[] = [];
    Object.keys(this.planForm.controls).forEach((key) => {
      const control = this.planForm.get(key);
      if (control && control.invalid) {
        invalid.push(key);
      }
    });
    return invalid;
  }

  getPlanCreatedDate(): string {
    if (!this.planData) return '';
    return this.planData.createdDate.toLocaleDateString('fr-FR');
  }
}
