import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { PanelModule } from 'primeng/panel';
import { MenubarModule } from 'primeng/menubar';

import { DashboardComponent } from './components/dashboard.component';
import { SharedModule } from '../shared.module';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ChartModule,
    PanelModule,
    MenubarModule,
    SharedModule,
  ],
  exports: [DashboardComponent],
})
export class DashboardModule {}
