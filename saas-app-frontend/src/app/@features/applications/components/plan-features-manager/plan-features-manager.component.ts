import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

// Types simplifiés
export interface Feature {
  _id: string;
  name: string;
  description: string;
  type: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlanFeatureConfig {
  featureId: string;
  status: 'ENABLED' | 'DISABLED' | 'LIMITED' | 'UNLIMITED';
  priority: number;
  customFieldValues: any[];
}

export interface PlanFeatures {
  planId: string;
  applicationId: string;
  features: PlanFeatureConfig[];
}

@Component({
  selector: 'app-plan-features-manager',
  templateUrl: './plan-features-manager.component.html',
  styleUrls: ['./plan-features-manager.component.css']
})
export class PlanFeaturesManagerComponent implements OnInit {
  @Input() planId: string = '';
  @Input() applicationId: string = '';
  @Output() featuresChanged = new EventEmitter<PlanFeatureConfig[]>();

  availableFeatures: Feature[] = [
    {
      _id: '1',
      name: 'Utilisateurs',
      description: 'Nombre d\'utilisateurs autorisés',
      type: 'NUMERIC',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: '2', 
      name: 'Stockage',
      description: 'Espace de stockage disponible',
      type: 'NUMERIC',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  selectedFeatures: PlanFeatureConfig[] = [];
  isLoading = false;

  constructor() {}

  ngOnInit(): void {
    console.log('PlanFeaturesManagerComponent initialized with planId:', this.planId);
    this.loadFeatures();
  }

  loadFeatures(): void {
    this.isLoading = true;
    // Simulation de chargement
    setTimeout(() => {
      this.isLoading = false;
    }, 1000);
  }

  addFeature(featureId: string): void {
    const exists = this.selectedFeatures.find(sf => sf.featureId === featureId);
    if (!exists) {
      const newFeature: PlanFeatureConfig = {
        featureId: featureId,
        status: 'ENABLED',
        priority: this.selectedFeatures.length + 1,
        customFieldValues: []
      };
      this.selectedFeatures.push(newFeature);
      this.featuresChanged.emit(this.selectedFeatures);
    }
  }

  removeFeature(index: number): void {
    this.selectedFeatures.splice(index, 1);
    this.featuresChanged.emit(this.selectedFeatures);
  }

  savePlanFeatures(): void {
    this.isLoading = true;
    console.log('Saving features:', this.selectedFeatures);
    
    // Simulation de sauvegarde
    setTimeout(() => {
      this.isLoading = false;
      console.log('Features saved successfully');
      this.featuresChanged.emit(this.selectedFeatures);
    }, 1500);
  }

  onCancel(): void {
    this.featuresChanged.emit([]);
  }
}
