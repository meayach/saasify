import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApplicationFeatureService, ApplicationFeature, CreateApplicationFeatureRequest } from '../../../../@shared/services/application-feature.service';

@Component({
  selector: 'app-application-features',
  templateUrl: './application-features.component.html',
  styleUrls: ['./application-features.component.css']
})
export class ApplicationFeaturesComponent implements OnInit, OnChanges {
  @Input() applicationId: string = '';

  features: ApplicationFeature[] = [];
  loading = false;
  showForm = false;
  editingFeature: ApplicationFeature | null = null;
  featureForm: FormGroup;

  // Predefined units for dropdown
  unitOptions = [
    { value: 'emails', displayName: 'emails/mois' },
    { value: 'GB', displayName: 'Go' },
    { value: 'TB', displayName: 'To' },
    { value: 'users', displayName: 'utilisateurs' },
    { value: 'api_calls', displayName: 'appels API/mois' },
    { value: 'projects', displayName: 'projets' },
    { value: 'reports', displayName: 'rapports/mois' },
    { value: 'contacts', displayName: 'contacts' },
    { value: 'campaigns', displayName: 'campagnes/mois' },
    { value: 'storage', displayName: 'espace de stockage' },
  ];

  constructor(
    private fb: FormBuilder,
    private applicationFeatureService: ApplicationFeatureService
  ) {
    this.featureForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.applicationId) {
      this.loadFeatures();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['applicationId'] && this.applicationId) {
      this.loadFeatures();
    }
  }

  private createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      key: ['', [Validators.required, Validators.pattern(/^[a-z_]+$/)]],
      unit: ['', Validators.required],
      unitDisplayName: ['', Validators.required],
      description: [''],
      isActive: [true],
      sortOrder: [0, [Validators.min(0)]]
    });
  }

  loadFeatures(): void {
    if (!this.applicationId) return;

    this.loading = true;
    this.applicationFeatureService.getFeatures(this.applicationId).subscribe({
      next: (response) => {
        this.features = response.data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading features:', error);
        this.loading = false;
      }
    });
  }

  showAddForm(): void {
    this.editingFeature = null;
    this.featureForm.reset({
      name: '',
      key: '',
      unit: '',
      unitDisplayName: '',
      description: '',
      isActive: true,
      sortOrder: 0
    });
    this.showForm = true;
  }

  editFeature(feature: ApplicationFeature): void {
    this.editingFeature = feature;
    this.featureForm.patchValue({
      name: feature.name,
      key: feature.key,
      unit: feature.unit,
      unitDisplayName: feature.unitDisplayName,
      description: feature.description || '',
      isActive: feature.isActive,
      sortOrder: feature.sortOrder
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingFeature = null;
    this.featureForm.reset();
  }

  onUnitChange(): void {
    const selectedUnit = this.featureForm.get('unit')?.value;
    const unitOption = this.unitOptions.find(option => option.value === selectedUnit);
    if (unitOption) {
      this.featureForm.patchValue({
        unitDisplayName: unitOption.displayName
      });
    }
  }

  onNameChange(): void {
    const name = this.featureForm.get('name')?.value;
    if (name && !this.editingFeature) {
      // Generate key from name for new features
      const key = name.toLowerCase()
        .replace(/[àáâäãå]/g, 'a')
        .replace(/[èéêë]/g, 'e')
        .replace(/[ìíîï]/g, 'i')
        .replace(/[òóôöõ]/g, 'o')
        .replace(/[ùúûü]/g, 'u')
        .replace(/[çćč]/g, 'c')
        .replace(/[ñń]/g, 'n')
        .replace(/[^a-z0-9]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_|_$/g, '');
      
      this.featureForm.patchValue({ key });
    }
  }

  onSubmit(): void {
    if (this.featureForm.invalid) return;

    const formValue = this.featureForm.value;
    this.loading = true;

    if (this.editingFeature) {
      // Update existing feature
      this.applicationFeatureService.updateFeature(this.editingFeature._id!, formValue).subscribe({
        next: (response) => {
          this.loadFeatures();
          this.cancelForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error updating feature:', error);
          this.loading = false;
        }
      });
    } else {
      // Create new feature
      const createRequest: CreateApplicationFeatureRequest = {
        ...formValue,
        applicationId: this.applicationId
      };

      this.applicationFeatureService.createFeature(createRequest).subscribe({
        next: (response) => {
          this.loadFeatures();
          this.cancelForm();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating feature:', error);
          this.loading = false;
        }
      });
    }
  }

  toggleFeatureStatus(feature: ApplicationFeature): void {
    this.loading = true;
    const action = feature.isActive 
      ? this.applicationFeatureService.deactivateFeature(feature._id!)
      : this.applicationFeatureService.activateFeature(feature._id!);

    action.subscribe({
      next: (response) => {
        this.loadFeatures();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error toggling feature status:', error);
        this.loading = false;
      }
    });
  }

  deleteFeature(feature: ApplicationFeature): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la fonctionnalité "${feature.name}" ?`)) {
      this.loading = true;
      this.applicationFeatureService.deleteFeature(feature._id!).subscribe({
        next: (response) => {
          this.loadFeatures();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error deleting feature:', error);
          this.loading = false;
        }
      });
    }
  }
}