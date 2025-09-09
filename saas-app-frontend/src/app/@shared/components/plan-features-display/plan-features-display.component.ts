import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import {
  FeatureManagementService,
  PlanFeatures,
  PlanFeatureResponse,
  FeatureStatus,
  FeatureCategory,
} from '../../@shared/services/feature-management.service';

@Component({
  selector: 'app-plan-features-display',
  templateUrl: './plan-features-display.component.html',
  styleUrls: ['./plan-features-display.component.css'],
})
export class PlanFeaturesDisplayComponent implements OnInit, OnChanges {
  @Input() planId!: string;
  @Input() applicationId!: string;
  @Input() displayMode: 'card' | 'list' | 'compact' = 'card';
  @Input() showCategories = true;
  @Input() showHighlighted = true;

  planFeatures: PlanFeatures | null = null;
  categorizedFeatures: Record<string, PlanFeatureResponse[]> = {};
  loading = false;
  error: string | null = null;

  // Énumérations pour le template
  FeatureStatus = FeatureStatus;
  FeatureCategory = FeatureCategory;

  constructor(private featureService: FeatureManagementService) {}

  ngOnInit(): void {
    this.loadPlanFeatures();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['planId'] || changes['applicationId']) {
      this.loadPlanFeatures();
    }
  }

  private async loadPlanFeatures(): Promise<void> {
    if (!this.planId || !this.applicationId) {
      return;
    }

    this.loading = true;
    this.error = null;

    try {
      this.planFeatures = await this.featureService
        .getPlanFeatures(this.planId, this.applicationId)
        .toPromise();

      if (this.planFeatures) {
        this.categorizeFeatures();
      }
    } catch (error) {
      console.error('Error loading plan features:', error);
      this.error = 'Erreur lors du chargement des fonctionnalités';
    } finally {
      this.loading = false;
    }
  }

  private categorizeFeatures(): void {
    if (!this.planFeatures) {
      return;
    }

    this.categorizedFeatures = {};

    this.planFeatures.features.forEach((feature) => {
      const category = feature.feature.category;
      if (!this.categorizedFeatures[category]) {
        this.categorizedFeatures[category] = [];
      }
      this.categorizedFeatures[category].push(feature);
    });

    // Trier les fonctionnalités dans chaque catégorie
    Object.keys(this.categorizedFeatures).forEach((category) => {
      this.categorizedFeatures[category].sort(
        (a, b) => a.configuration.sortOrder - b.configuration.sortOrder,
      );
    });
  }

  getFeatureCategories(): string[] {
    return Object.keys(this.categorizedFeatures);
  }

  getFeaturesForCategory(category: string): PlanFeatureResponse[] {
    return this.categorizedFeatures[category] || [];
  }

  getCategoryLabel(category: string): string {
    return this.featureService.getFeatureCategoryLabel(category as FeatureCategory);
  }

  getStatusLabel(status: FeatureStatus): string {
    return this.featureService.getFeatureStatusLabel(status);
  }

  getFeatureIcon(feature: PlanFeatureResponse): string {
    return feature.feature.icon || this.getDefaultIcon(feature.feature.category);
  }

  private getDefaultIcon(category: FeatureCategory): string {
    const iconMap: Record<FeatureCategory, string> = {
      [FeatureCategory.STORAGE]: '💾',
      [FeatureCategory.COMMUNICATION]: '✉️',
      [FeatureCategory.API]: '🔌',
      [FeatureCategory.ANALYTICS]: '📊',
      [FeatureCategory.SUPPORT]: '🎧',
      [FeatureCategory.SECURITY]: '🔒',
      [FeatureCategory.INTEGRATION]: '🔗',
      [FeatureCategory.CUSTOMIZATION]: '🎨',
      [FeatureCategory.REPORTING]: '📈',
      [FeatureCategory.USER_MANAGEMENT]: '👥',
      [FeatureCategory.OTHER]: '⚙️',
    };
    return iconMap[category] || '⚙️';
  }

  getFeatureDisplayName(feature: PlanFeatureResponse): string {
    return (
      feature.configuration.customDisplayName || feature.feature.displayName || feature.feature.name
    );
  }

  getFeatureDescription(feature: PlanFeatureResponse): string {
    return (
      feature.configuration.customDescription ||
      feature.feature.description ||
      'Aucune description disponible'
    );
  }

  getFieldValues(feature: PlanFeatureResponse): Array<{
    label: string;
    value: string;
    isUnlimited: boolean;
  }> {
    return feature.fieldValues.map((fieldValue) => {
      const customField = feature.customFields.find((cf) => cf._id === fieldValue.customFieldId);

      return {
        label: customField?.displayName || customField?.fieldName || 'Valeur',
        value:
          fieldValue.displayValue ||
          this.featureService.formatFieldValue(
            fieldValue.fieldValue,
            customField?.unit || ('none' as any),
            fieldValue.isUnlimited,
          ),
        isUnlimited: fieldValue.isUnlimited,
      };
    });
  }

  isFeatureHighlighted(feature: PlanFeatureResponse): boolean {
    return this.showHighlighted && feature.configuration.isHighlighted;
  }

  getHighlightText(feature: PlanFeatureResponse): string {
    return feature.configuration.highlightText || '';
  }

  getStatusClass(status: FeatureStatus): string {
    const classMap: Record<FeatureStatus, string> = {
      [FeatureStatus.ENABLED]: 'status-enabled',
      [FeatureStatus.DISABLED]: 'status-disabled',
      [FeatureStatus.LIMITED]: 'status-limited',
      [FeatureStatus.UNLIMITED]: 'status-unlimited',
    };
    return classMap[status] || '';
  }

  getCategoryClass(category: string): string {
    return `category-${category.toLowerCase().replace('_', '-')}`;
  }

  hasVisibleFeatures(): boolean {
    return this.planFeatures?.features.length > 0;
  }

  refresh(): void {
    this.loadPlanFeatures();
  }
}
