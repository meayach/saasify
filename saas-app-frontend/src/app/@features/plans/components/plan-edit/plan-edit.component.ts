import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: string[];
  maxUsers: number;
  maxApps: number;
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

  constructor(private fb: FormBuilder, public router: Router, private route: ActivatedRoute) {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      currency: ['EUR', Validators.required],
      maxUsers: [100, [Validators.required, Validators.min(-1)]],
      maxApps: [1, [Validators.required, Validators.min(-1)]],
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

    // Simuler le chargement des données
    setTimeout(() => {
      // Données simulées - normalement récupérées via API
      this.planData = {
        id: this.planId!,
        name: 'Pro',
        description: 'Idéal pour les entreprises en croissance',
        price: 29.99,
        currency: 'EUR',
        features: [
          'Support par email',
          'Tableau de bord basique',
          'Support prioritaire',
          'Analyses avancées',
          'API complète',
          'Intégrations tierces',
        ],
        maxUsers: 1000,
        maxApps: 5,
        status: 'active',
        isPopular: true,
        createdDate: new Date('2023-01-01'),
      };

      this.initializeForm();
      this.loading = false;
    }, 1000);
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
      maxApps: this.planData.maxApps,
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

      const updatedPlan = {
        ...this.planData,
        ...formData,
        features: selectedFeatures,
        updatedDate: new Date(),
      };

      console.log('Plan modifié:', updatedPlan);

      // Simuler l'appel API
      setTimeout(() => {
        console.log('Plan modifié avec succès');
        this.loading = false;
        this.router.navigate(['/plans']);
      }, 2000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/plans']);
  }

  isPredefinedFeature(index: number): boolean {
    return index < this.predefinedFeatures.length;
  }

  getPlanCreatedDate(): string {
    if (!this.planData) return '';
    return this.planData.createdDate.toLocaleDateString('fr-FR');
  }
}
