import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApplicationFeatureService, ApplicationFeature } from '../../../../@shared/services/application-feature.service';
import { PlanFeatureValueService, PlanFeatureValue } from '../../../../@shared/services/plan-feature-value.service';

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
  applicationId?: string;
}

interface PlanFeatureFormValue {
  featureId: string;
  featureName: string;
  unitDisplayName: string;
  value: number;
  isUnlimited: boolean;
  displayValue: string;
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
  applicationFeatures: ApplicationFeature[] = [];
  existingFeatureValues: PlanFeatureValue[] = [];

  // Mock application ID for now - this would come from context or route
  applicationId = '507f1f77bcf86cd799439011'; // Replace with actual application ID

  constructor(
    private fb: FormBuilder, 
    public router: Router, 
    private route: ActivatedRoute,
    private applicationFeatureService: ApplicationFeatureService,
    private planFeatureValueService: PlanFeatureValueService
  ) {
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
    this.loadApplicationFeatures();
  }

  get featuresArray(): FormArray {
    return this.planForm.get('features') as FormArray;
  }

  loadApplicationFeatures(): void {
    this.loading = true;
    this.applicationFeatureService.getFeatures(this.applicationId).subscribe({
      next: (response) => {
        this.applicationFeatures = response.data;
        if (this.planId) {
          this.loadExistingFeatureValues();
        } else {
          this.initializeFeatures();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error loading application features:', error);
        this.loading = false;
      }
    });
  }

  loadExistingFeatureValues(): void {
    this.planFeatureValueService.getPlanFeatureValues(this.planId!).subscribe({
      next: (response) => {
        this.existingFeatureValues = response.data;
        this.loadPlanData();
      },
      error: (error) => {
        console.error('Error loading plan feature values:', error);
        this.loadPlanData(); // Continue even if feature values fail
      }
    });
  }

  loadPlanData(): void {
    if (!this.planId) {
      this.initializeFeatures();
      this.loading = false;
      return;
    }

    this.loading = true;

    // Simuler le chargement des données - à remplacer par un vrai appel API
    setTimeout(() => {
      this.planData = {
        id: this.planId!,
        name: 'Pro',
        description: 'Idéal pour les entreprises en croissance',
        price: 29.99,
        currency: 'EUR',
        features: [], // Features will be loaded from configurable system
        maxUsers: 1000,
        maxApps: 5,
        status: 'active',
        isPopular: true,
        createdDate: new Date('2023-01-01'),
        applicationId: this.applicationId
      };

      this.initializeForm();
      this.loading = false;
    }, 1000);
  }

  initializeForm(): void {
    if (!this.planData) return;

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

    this.initializeFeatures();
  }

  initializeFeatures(): void {
    // Clear existing form array
    while (this.featuresArray.length !== 0) {
      this.featuresArray.removeAt(0);
    }

    // Add configurable features
    this.applicationFeatures.forEach((feature) => {
      const existingValue = this.existingFeatureValues.find(fv => fv.featureId === feature._id);
      
      this.featuresArray.push(
        this.fb.group({
          featureId: [feature._id],
          featureName: [feature.name],
          unitDisplayName: [feature.unitDisplayName],
          value: [existingValue?.value || 0, [Validators.required, Validators.min(-1)]],
          isUnlimited: [existingValue?.isUnlimited || false],
          displayValue: [existingValue?.displayValue || this.generateDisplayValue(0, false, feature.unitDisplayName)]
        })
      );
    });
  }

  onFeatureValueChange(index: number): void {
    const featureGroup = this.featuresArray.at(index) as FormGroup;
    const value = featureGroup.get('value')?.value;
    const isUnlimited = featureGroup.get('isUnlimited')?.value;
    const unitDisplayName = featureGroup.get('unitDisplayName')?.value;
    
    const displayValue = this.generateDisplayValue(value, isUnlimited, unitDisplayName);
    featureGroup.patchValue({ displayValue });
  }

  onUnlimitedToggle(index: number): void {
    const featureGroup = this.featuresArray.at(index) as FormGroup;
    const isUnlimited = featureGroup.get('isUnlimited')?.value;
    const value = isUnlimited ? -1 : 0;
    const unitDisplayName = featureGroup.get('unitDisplayName')?.value;
    
    featureGroup.patchValue({
      value: value,
      displayValue: this.generateDisplayValue(value, isUnlimited, unitDisplayName)
    });
  }

  generateDisplayValue(value: number, isUnlimited: boolean, unitDisplayName: string): string {
    if (isUnlimited || value === -1) {
      return 'Illimité';
    }
    return `${value} ${unitDisplayName}`;
  }

  onSubmit(): void {
    if (this.planForm.valid) {
      this.loading = true;

      const formData = this.planForm.value;
      const featureValues = formData.features.map((feature: PlanFeatureFormValue) => ({
        featureId: feature.featureId,
        value: feature.isUnlimited ? -1 : feature.value,
        isUnlimited: feature.isUnlimited,
        displayValue: feature.displayValue
      }));

      // Save plan data (mock for now)
      const updatedPlan = {
        ...this.planData,
        ...formData,
        updatedDate: new Date(),
      };

      console.log('Plan modifié:', updatedPlan);

      // Save feature values
      if (this.planId) {
        this.planFeatureValueService.bulkUpdatePlanFeatureValues({
          planId: this.planId,
          featureValues: featureValues
        }).subscribe({
          next: (response) => {
            console.log('Feature values updated:', response.data);
            this.loading = false;
            this.router.navigate(['/plans']);
          },
          error: (error) => {
            console.error('Error updating feature values:', error);
            this.loading = false;
          }
        });
      } else {
        // For new plans, you would first create the plan, then update feature values
        console.log('Feature values to be saved after plan creation:', featureValues);
        this.loading = false;
        this.router.navigate(['/plans']);
      }
    }
  }

  onCancel(): void {
    this.router.navigate(['/plans']);
  }

  getPlanCreatedDate(): string {
    if (!this.planData) return '';
    return this.planData.createdDate.toLocaleDateString('fr-FR');
  }
}
