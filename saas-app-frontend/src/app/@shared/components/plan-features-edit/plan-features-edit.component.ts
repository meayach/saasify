import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { Subject, BehaviorSubject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import {
  PlanFeatureConfiguration,
  Feature,
  FeatureCustomField,
  FeatureCustomFieldValue,
  FeatureStatus,
  FieldType,
  FeatureCategory,
} from '../../../core/services/feature-management.service';

export interface PlanFeatureEditData {
  planId: string;
  applicationId?: string;
  features: PlanFeatureConfiguration[];
}

export interface FeatureFormGroup {
  featureId: string;
  status: FeatureStatus;
  customFieldValues: FeatureCustomFieldValue[];
  priority: number;
  feature?: Feature;
}

@Component({
  selector: 'app-plan-features-edit',
  templateUrl: './plan-features-edit.component.html',
  styleUrls: ['./plan-features-edit.component.scss'],
})
export class PlanFeaturesEditComponent implements OnInit, OnDestroy {
  @Input() planId!: string;
  @Input() applicationId?: string;
  @Input() readonly: boolean = false;
  @Input() showCategories: boolean = true;
  @Input() compactMode: boolean = false;

  @Output() featuresChanged = new EventEmitter<PlanFeatureConfiguration[]>();
  @Output() validationChanged = new EventEmitter<boolean>();

  private destroy$ = new Subject<void>();
  private featuresSubject = new BehaviorSubject<Feature[]>([]);
  private configurationSubject = new BehaviorSubject<PlanFeatureConfiguration[]>([]);

  // Form and UI state
  form!: FormGroup;
  loading = false;
  error: string | null = null;

  // Data
  availableFeatures: Feature[] = [];
  currentConfiguration: PlanFeatureConfiguration[] = [];

  // UI state
  expandedCategories: Set<FeatureCategory> = new Set();
  searchTerm = '';
  selectedCategory: FeatureCategory | 'all' = 'all';

  // Enums for template
  FeatureStatus = FeatureStatus;
  FeatureCategory = FeatureCategory;
  FieldType = FieldType;

  constructor(
    private fb: FormBuilder,
    private featureService: any, // FeatureManagementService will be injected
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.loadData();
    this.setupFormSubscriptions();
    this.expandDefaultCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.form = this.fb.group({
      features: this.fb.array([]),
    });
  }

  private setupFormSubscriptions() {
    // Watch for form changes and emit updates
    this.form.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(() => {
        this.onFormChange();
      });

    // Watch for validation changes
    this.form.statusChanges.pipe(takeUntil(this.destroy$)).subscribe((status) => {
      this.validationChanged.emit(status === 'VALID');
    });
  }

  private async loadData() {
    try {
      this.loading = true;
      this.error = null;

      // Load available features
      const features = await this.featureService.getFeatures(this.applicationId).toPromise();
      this.availableFeatures = features || [];
      this.featuresSubject.next(this.availableFeatures);

      // Load current configuration
      if (this.planId) {
        const config = await this.featureService.getPlanFeatures(this.planId).toPromise();
        this.currentConfiguration = config?.features || [];
        this.configurationSubject.next(this.currentConfiguration);
      }

      this.buildForm();
    } catch (error) {
      console.error('Error loading plan features:', error);
      this.error = 'Erreur lors du chargement des fonctionnalités';
    } finally {
      this.loading = false;
    }
  }

  private buildForm() {
    const featuresArray = this.fb.array([]);

    // Add form groups for each available feature
    this.availableFeatures.forEach((feature) => {
      const existingConfig = this.currentConfiguration.find((c) => c.featureId === feature._id);
      const featureGroup = this.createFeatureFormGroup(feature, existingConfig);
      featuresArray.push(featureGroup);
    });

    this.form.setControl('features', featuresArray);
  }

  private createFeatureFormGroup(feature: Feature, config?: PlanFeatureConfiguration): FormGroup {
    const customFieldsArray = this.fb.array([]);

    // Create form controls for custom fields
    feature.customFields.forEach((field) => {
      const existingValue = config?.customFieldValues.find((v) => v.fieldId === field._id);
      const fieldControl = this.createCustomFieldControl(field, existingValue);
      customFieldsArray.push(fieldControl);
    });

    return this.fb.group({
      featureId: [feature._id, Validators.required],
      status: [config?.status || FeatureStatus.INACTIVE, Validators.required],
      priority: [config?.priority || 0, [Validators.min(0), Validators.max(100)]],
      customFields: customFieldsArray,
      _feature: [feature], // Store feature reference for UI
    });
  }

  private createCustomFieldControl(
    field: FeatureCustomField,
    existingValue?: FeatureCustomFieldValue,
  ): FormGroup {
    let value = existingValue?.value || field.defaultValue;
    let validators = [];

    // Add validators based on field type and requirements
    if (field.isRequired) {
      validators.push(Validators.required);
    }

    if (field.fieldType === FieldType.NUMBER) {
      validators.push(Validators.pattern(/^\d+$/));
      if (field.validation?.min !== undefined) {
        validators.push(Validators.min(field.validation.min));
      }
      if (field.validation?.max !== undefined) {
        validators.push(Validators.max(field.validation.max));
      }
    }

    if (field.fieldType === FieldType.EMAIL) {
      validators.push(Validators.email);
    }

    if (field.fieldType === FieldType.TEXT && field.validation?.maxLength) {
      validators.push(Validators.maxLength(field.validation.maxLength));
    }

    return this.fb.group({
      fieldId: [field._id, Validators.required],
      value: [value, validators],
      _field: [field], // Store field reference for UI
    });
  }

  // Getters for template
  get featuresFormArray(): FormArray {
    return this.form.get('features') as FormArray;
  }

  getFeatureFormGroup(index: number): FormGroup {
    return this.featuresFormArray.at(index) as FormGroup;
  }

  getCustomFieldsArray(featureIndex: number): FormArray {
    return this.getFeatureFormGroup(featureIndex).get('customFields') as FormArray;
  }

  getCustomFieldGroup(featureIndex: number, fieldIndex: number): FormGroup {
    return this.getCustomFieldsArray(featureIndex).at(fieldIndex) as FormGroup;
  }

  // Category management
  toggleCategory(category: FeatureCategory) {
    if (this.expandedCategories.has(category)) {
      this.expandedCategories.delete(category);
    } else {
      this.expandedCategories.add(category);
    }
  }

  isCategoryExpanded(category: FeatureCategory): boolean {
    return this.expandedCategories.has(category);
  }

  private expandDefaultCategories() {
    // Expand categories that have active features
    const activeCategories = new Set<FeatureCategory>();

    this.currentConfiguration.forEach((config) => {
      const feature = this.availableFeatures.find((f) => f._id === config.featureId);
      if (feature && config.status === FeatureStatus.ACTIVE) {
        activeCategories.add(feature.category);
      }
    });

    this.expandedCategories = activeCategories;
  }

  // Feature filtering and grouping
  getFilteredFeatures(): Feature[] {
    let filtered = this.availableFeatures;

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (f) => f.name.toLowerCase().includes(term) || f.description.toLowerCase().includes(term),
      );
    }

    // Filter by category
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter((f) => f.category === this.selectedCategory);
    }

    return filtered;
  }

  getFeaturesForCategory(category: FeatureCategory): Feature[] {
    return this.getFilteredFeatures().filter((f) => f.category === category);
  }

  getFeatureCategories(): FeatureCategory[] {
    const categories = new Set<FeatureCategory>();
    this.getFilteredFeatures().forEach((f) => categories.add(f.category));
    return Array.from(categories).sort();
  }

  // Feature status management
  toggleFeatureStatus(featureIndex: number) {
    const featureGroup = this.getFeatureFormGroup(featureIndex);
    const currentStatus = featureGroup.get('status')?.value;

    const newStatus =
      currentStatus === FeatureStatus.ACTIVE ? FeatureStatus.INACTIVE : FeatureStatus.ACTIVE;

    featureGroup.get('status')?.setValue(newStatus);
  }

  setFeatureStatus(featureIndex: number, status: FeatureStatus) {
    const featureGroup = this.getFeatureFormGroup(featureIndex);
    featureGroup.get('status')?.setValue(status);
  }

  // Form utilities
  isFeatureActive(featureIndex: number): boolean {
    const featureGroup = this.getFeatureFormGroup(featureIndex);
    return featureGroup.get('status')?.value === FeatureStatus.ACTIVE;
  }

  isFieldRequired(field: FeatureCustomField): boolean {
    return field.isRequired;
  }

  getFieldValidationError(featureIndex: number, fieldIndex: number): string | null {
    const fieldGroup = this.getCustomFieldGroup(featureIndex, fieldIndex);
    const control = fieldGroup.get('value');

    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'Ce champ est requis';
      if (control.errors['email']) return 'Format email invalide';
      if (control.errors['pattern']) return 'Format invalide';
      if (control.errors['min']) return `Valeur minimale: ${control.errors['min'].min}`;
      if (control.errors['max']) return `Valeur maximale: ${control.errors['max'].max}`;
      if (control.errors['maxlength'])
        return `Longueur maximale: ${control.errors['maxlength'].requiredLength}`;
    }

    return null;
  }

  // Form change handling
  private onFormChange() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const configurations: PlanFeatureConfiguration[] = [];

      formValue.features.forEach((featureForm: any) => {
        const feature = featureForm._feature;

        if (featureForm.status !== FeatureStatus.INACTIVE) {
          const customFieldValues: FeatureCustomFieldValue[] = featureForm.customFields.map(
            (fieldForm: any) => ({
              fieldId: fieldForm.fieldId,
              value: fieldForm.value,
            }),
          );

          configurations.push({
            featureId: featureForm.featureId,
            status: featureForm.status,
            priority: featureForm.priority,
            customFieldValues,
          });
        }
      });

      this.featuresChanged.emit(configurations);
    }
  }

  // Public methods
  refresh() {
    this.loadData();
  }

  resetForm() {
    this.buildForm();
  }

  validateForm(): boolean {
    this.form.markAllAsTouched();
    return this.form.valid;
  }

  getCurrentConfiguration(): PlanFeatureConfiguration[] {
    this.onFormChange();
    return this.currentConfiguration;
  }

  // Utility methods for template
  getCategoryLabel(category: FeatureCategory): string {
    const labels = {
      [FeatureCategory.CORE]: 'Fonctionnalités de base',
      [FeatureCategory.ADVANCED]: 'Fonctionnalités avancées',
      [FeatureCategory.PREMIUM]: 'Fonctionnalités premium',
      [FeatureCategory.ADDON]: 'Modules complémentaires',
    };
    return labels[category] || category;
  }

  getStatusLabel(status: FeatureStatus): string {
    const labels = {
      [FeatureStatus.ACTIVE]: 'Actif',
      [FeatureStatus.INACTIVE]: 'Inactif',
      [FeatureStatus.LIMITED]: 'Limité',
      [FeatureStatus.COMING_SOON]: 'Bientôt disponible',
    };
    return labels[status] || status;
  }

  getFieldTypeLabel(type: FieldType): string {
    const labels = {
      [FieldType.TEXT]: 'Texte',
      [FieldType.NUMBER]: 'Nombre',
      [FieldType.BOOLEAN]: 'Oui/Non',
      [FieldType.EMAIL]: 'Email',
      [FieldType.URL]: 'URL',
      [FieldType.JSON]: 'Configuration JSON',
    };
    return labels[type] || type;
  }
}
