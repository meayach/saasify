import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../@store/app.reducer';

@Component({
  selector: 'app-customer-manager-dashboard',
  template: `
    <div class="manager-dashboard">
      <div class="dashboard-header">
        <h2>Marketing Dashboard</h2>
        <p>Analytics, A/B testing and campaign management</p>
      </div>

      <div class="dashboard-grid">
        <!-- Analytics Overview -->
        <div class="analytics-card">
          <h3>Analytics Overview</h3>
          <div class="metrics-grid">
            <div class="metric">
              <span class="metric-value">12,543</span>
              <span class="metric-label">Active Users</span>
              <span class="metric-change positive">+15%</span>
            </div>
            <div class="metric">
              <span class="metric-value">€8,742</span>
              <span class="metric-label">Monthly Revenue</span>
              <span class="metric-change positive">+8%</span>
            </div>
            <div class="metric">
              <span class="metric-value">78%</span>
              <span class="metric-label">Retention Rate</span>
              <span class="metric-change negative">-2%</span>
            </div>
          </div>
        </div>

        <!-- A/B Testing -->
        <div class="ab-testing-card">
          <div class="card-header">
            <h3>A/B Tests</h3>
            <button class="btn btn-primary" (click)="createABTest()">
              <i class="pi pi-plus"></i> New Test
            </button>
          </div>
          <div class="tests-list">
            <div class="test-item">
              <div class="test-info">
                <h4>Checkout Button Color</h4>
                <span class="test-status running">Running</span>
              </div>
              <div class="test-metrics">
                <span>Conversion: +12%</span>
                <span>Confidence: 95%</span>
              </div>
            </div>
            <div class="test-item">
              <div class="test-info">
                <h4>Pricing Page Layout</h4>
                <span class="test-status completed">Completed</span>
              </div>
              <div class="test-metrics">
                <span>Conversion: +5%</span>
                <span>Winner: Variant B</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Campaign Management -->
        <div class="campaigns-card">
          <div class="card-header">
            <h3>Campaigns</h3>
            <button class="btn btn-secondary" (click)="createCampaign()">
              <i class="pi pi-megaphone"></i> New Campaign
            </button>
          </div>
          <div class="campaigns-list">
            <div class="campaign-item">
              <div class="campaign-info">
                <h4>Summer Promotion</h4>
                <span class="campaign-status active">Active</span>
              </div>
              <div class="campaign-metrics">
                <span>CTR: 3.2%</span>
                <span>Budget: €2,500</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Performance Reports -->
        <div class="reports-card">
          <h3>Performance Reports</h3>
          <div class="reports-list">
            <div class="report-item" (click)="viewReport('user-engagement')">
              <i class="pi pi-chart-bar"></i>
              <span>User Engagement Report</span>
              <i class="pi pi-chevron-right"></i>
            </div>
            <div class="report-item" (click)="viewReport('revenue-analysis')">
              <i class="pi pi-chart-line"></i>
              <span>Revenue Analysis</span>
              <i class="pi pi-chevron-right"></i>
            </div>
            <div class="report-item" (click)="viewReport('conversion-funnel')">
              <i class="pi pi-funnel"></i>
              <span>Conversion Funnel</span>
              <i class="pi pi-chevron-right"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .manager-dashboard {
        padding: 1.5rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .analytics-card,
      .ab-testing-card,
      .campaigns-card,
      .reports-card {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .metrics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .metric {
        text-align: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
      }

      .metric-value {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #333;
      }

      .metric-label {
        display: block;
        font-size: 0.875rem;
        color: #666;
        margin: 0.5rem 0;
      }

      .metric-change {
        font-size: 0.875rem;
        font-weight: 500;
      }

      .metric-change.positive {
        color: #28a745;
      }
      .metric-change.negative {
        color: #dc3545;
      }

      .test-item,
      .campaign-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        margin-bottom: 0.5rem;
      }

      .test-status,
      .campaign-status {
        padding: 0.25rem 0.5rem;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .test-status.running,
      .campaign-status.active {
        background: #d4edda;
        color: #155724;
      }

      .test-status.completed {
        background: #d1ecf1;
        color: #0c5460;
      }

      .report-item {
        display: flex;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .report-item:hover {
        background: #f8f9fa;
      }

      .report-item i:first-child {
        margin-right: 1rem;
        color: #007bff;
      }

      .report-item span {
        flex: 1;
      }
    `,
  ],
})
export class CustomerManagerDashboardComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // Load analytics and campaign data
  }

  createABTest(): void {
    // Navigate to A/B test creation
  }

  createCampaign(): void {
    // Navigate to campaign creation
  }

  viewReport(reportType: string): void {
    // Navigate to specific report
  }
}
