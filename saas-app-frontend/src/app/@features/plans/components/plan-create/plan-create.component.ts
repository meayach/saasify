import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';

interface PlanFeature {
  name: string;
  included: boolean;
}

@Component({
  selector: 'app-plan-create',
  templateUrl: './plan-create.component.html',
  styleUrls: ['./plan-create.component.css'],
})
export class PlanCreateComponent implements OnInit {
  planForm: FormGroup;
  loading = false;

  predefinedFeatures: PlanFeature[] = [
    { name: 'Support par email', included: true },
    { name: 'Tableau de bord basique', included: true },
    { name: 'Support prioritaire', included: false },
    { name: 'Analyses avancées', included: false },
    { name: 'API complète', included: false },
    { name: 'Intégrations tierces', included: false },
    { name: 'Support 24/7', included: false },
    { name: 'Déploiement sur site', included: false },
    { name: 'SLA garanti', included: false },
    { name: 'Manager dédié', included: false },
  ];

  constructor(private fb: FormBuilder, public router: Router) {
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
    this.initializeFeatures();
  }

  get featuresArray(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  initializeFeatures(): void {
    this.predefinedFeatures.forEach((feature) => {
      this.featuresArray.push(
        this.fb.group({
          name: [feature.name, Validators.required],
          included: [feature.included],
        }),
      );
    });
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
    if (this.planForm.valid) {
      this.loading = true;

      const formData = this.planForm.value;
      const selectedFeatures = formData.features
        .filter((f: any) => f.included)
        .map((f: any) => f.name);

      const planData = {
        ...formData,
        features: selectedFeatures,
        id: `plan-${Date.now()}`,
        createdDate: new Date(),
      };

      console.log('Nouveau plan créé:', planData);

      // Simuler l'appel API
      setTimeout(() => {
        console.log('Plan créé avec succès');
        this.loading = false;
        this.router.navigate(['/plans']);
      }, 2000);
    }
  }

  onCancel(): void {
    this.router.navigate(['/plans']);
  }

  onPresetSelect(preset: string): void {
    switch (preset) {
      case 'free':
        this.planForm.patchValue({
          name: 'Gratuit',
          description: 'Parfait pour commencer et tester notre plateforme',
          price: 0,
          maxUsers: 100,
          maxApps: 1,
          isPopular: false,
        });
        this.setFeaturePreset(['Support par email', 'Tableau de bord basique']);
        break;
      case 'pro':
        this.planForm.patchValue({
          name: 'Pro',
          description: 'Idéal pour les entreprises en croissance',
          price: 29.99,
          maxUsers: 1000,
          maxApps: 5,
          isPopular: true,
        });
        this.setFeaturePreset([
          'Support par email',
          'Tableau de bord basique',
          'Support prioritaire',
          'Analyses avancées',
          'API complète',
          'Intégrations tierces',
        ]);
        break;
      case 'enterprise':
        this.planForm.patchValue({
          name: 'Enterprise',
          description: 'Solution complète pour les grandes entreprises',
          price: 99.99,
          maxUsers: -1,
          maxApps: -1,
          isPopular: false,
        });
        this.setFeaturePreset([
          'Support par email',
          'Tableau de bord basique',
          'Support prioritaire',
          'Analyses avancées',
          'API complète',
          'Intégrations tierces',
          'Support 24/7',
          'Déploiement sur site',
          'SLA garanti',
          'Manager dédié',
        ]);
        break;
    }
  }

  private setFeaturePreset(includedFeatures: string[]): void {
    this.featuresArray.controls.forEach((control, index) => {
      const featureName = this.predefinedFeatures[index]?.name;
      if (featureName) {
        control.patchValue({
          included: includedFeatures.includes(featureName),
        });
      }
    });
  }

  isPredefinedFeature(index: number): boolean {
    return index < this.predefinedFeatures.length;
  }
}
