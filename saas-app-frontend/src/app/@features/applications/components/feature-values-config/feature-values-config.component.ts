import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

export interface FeatureValue {
  featureName: string;
  description: string;
  featureType: 'LIMIT' | 'QUOTA' | 'BOOLEAN' | 'ACCESS';
  unit: string;
  values: {
    free: number | string;
    premium: number | string;
    enterprise: number | string;
  };
  isActive: boolean;
  sortOrder: number;
}

@Component({
  selector: 'app-feature-values-config',
  templateUrl: './feature-values-config.component.html',
  styleUrls: ['./feature-values-config.component.css'],
})
export class FeatureValuesConfigComponent implements OnInit {
  @Input() applicationId: string = '';
  @Output() featureValuesChange = new EventEmitter<FeatureValue[]>();

  featureTypes = [
    { value: 'LIMIT', label: 'Limite (ex: 10 emails/mois)' },
    { value: 'QUOTA', label: 'Quota (ex: 5GB de stockage)' },
    { value: 'BOOLEAN', label: 'Activé/Désactivé (ex: Support 24/7)' },
    { value: 'ACCESS', label: "Niveau d'accès (ex: API basique/complète)" },
  ];

  featureUnits = [
    // Communications
    { value: 'emails', label: 'Emails' },
    { value: 'sms', label: 'SMS' },

    // Stockage
    { value: 'bytes', label: 'Bytes' },
    { value: 'kb', label: 'Kilobytes (KB)' },
    { value: 'mb', label: 'Megabytes (MB)' },
    { value: 'gb', label: 'Gigabytes (GB)' },
    { value: 'tb', label: 'Terabytes (TB)' },

    // Utilisateurs et ressources
    { value: 'users', label: 'Utilisateurs' },
    { value: 'count', label: 'Nombre' },

    // Réseau
    { value: 'requests', label: 'Requêtes' },
    { value: 'transactions', label: 'Transactions' },

    // Temps
    { value: 'minutes', label: 'Minutes' },
    { value: 'hours', label: 'Heures' },
    { value: 'days', label: 'Jours' },
    { value: 'months', label: 'Mois' },

    // Vitesse
    { value: 'mbps', label: 'Mbps' },
    { value: 'gbps', label: 'Gbps' },

    // Spéciaux
    { value: 'percentage', label: 'Pourcentage (%)' },
    { value: 'unlimited', label: 'Illimité' },
  ];

  featureValues: FeatureValue[] = [
    {
      featureName: 'Emails par mois',
      description: "Nombre d'emails pouvant être envoyés par mois",
      featureType: 'LIMIT',
      unit: 'emails',
      values: { free: 10, premium: 200, enterprise: 'Illimité' },
      isActive: true,
      sortOrder: 1,
    },
    {
      featureName: 'Espace de stockage',
      description: 'Espace de stockage disponible',
      featureType: 'QUOTA',
      unit: 'gb',
      values: { free: 1, premium: 50, enterprise: 'Illimité' },
      isActive: true,
      sortOrder: 2,
    },
    {
      featureName: 'Utilisateurs',
      description: "Nombre d'utilisateurs pouvant accéder à l'application",
      featureType: 'LIMIT',
      unit: 'users',
      values: { free: 1, premium: 10, enterprise: 'Illimité' },
      isActive: true,
      sortOrder: 3,
    },
  ];

  ngOnInit(): void {
    this.emitFeatureValues();
  }

  addFeatureValue(): void {
    const newFeature: FeatureValue = {
      featureName: '',
      description: '',
      featureType: 'LIMIT',
      unit: 'count',
      values: { free: 0, premium: 0, enterprise: 0 },
      isActive: true,
      sortOrder: this.featureValues.length + 1,
    };

    this.featureValues.push(newFeature);
    this.emitFeatureValues();
  }

  removeFeatureValue(index: number): void {
    this.featureValues.splice(index, 1);
    this.emitFeatureValues();
  }

  onFeatureChange(): void {
    this.emitFeatureValues();
  }

  private emitFeatureValues(): void {
    this.featureValuesChange.emit(this.featureValues);
  }

  getUnitLabel(unitValue: string): string {
    const unit = this.featureUnits.find((u) => u.value === unitValue);
    return unit ? unit.label : unitValue;
  }

  isUnlimitedValue(value: any): boolean {
    return value === 'Illimité' || value === -1 || value === 'unlimited';
  }

  formatDisplayValue(value: any, unit: string): string {
    if (this.isUnlimitedValue(value)) {
      return 'Illimité';
    }

    switch (unit) {
      case 'emails':
        return `${value} emails/mois`;
      case 'gb':
        return `${value} GB`;
      case 'tb':
        return `${value} TB`;
      case 'users':
        return `${value} utilisateur${value > 1 ? 's' : ''}`;
      case 'percentage':
        return `${value}%`;
      default:
        return `${value} ${this.getUnitLabel(unit)}`;
    }
  }
}
