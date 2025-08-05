import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../../@store/app.reducer';

@Component({
  selector: 'app-customer-developer-dashboard',
  template: `
    <div class="developer-dashboard">
      <div class="dashboard-header">
        <h2>Developer Dashboard</h2>
        <p>API sandbox, documentation and development tools</p>
      </div>

      <div class="dashboard-grid">
        <!-- API Sandbox -->
        <div class="sandbox-card">
          <h3>API Sandbox</h3>
          <div class="sandbox-actions">
            <button class="btn btn-primary" (click)="openApiExplorer()">
              <i class="pi pi-code"></i> API Explorer
            </button>
            <button class="btn btn-secondary" (click)="viewApiDocs()">
              <i class="pi pi-book"></i> Documentation
            </button>
            <button class="btn btn-info" (click)="generateApiKey()">
              <i class="pi pi-key"></i> Generate API Key
            </button>
          </div>
          <div class="recent-calls">
            <h4>Recent API Calls</h4>
            <div class="api-call">
              <span class="method get">GET</span>
              <span class="endpoint">/api/v1/users</span>
              <span class="status success">200</span>
              <span class="time">2 min ago</span>
            </div>
            <div class="api-call">
              <span class="method post">POST</span>
              <span class="endpoint">/api/v1/applications</span>
              <span class="status success">201</span>
              <span class="time">5 min ago</span>
            </div>
          </div>
        </div>

        <!-- Development Tools -->
        <div class="tools-card">
          <h3>Development Tools</h3>
          <div class="tools-grid">
            <div class="tool-item" (click)="openDebugger()">
              <i class="pi pi-bug"></i>
              <span>Debugger</span>
            </div>
            <div class="tool-item" (click)="openLogs()">
              <i class="pi pi-list"></i>
              <span>Logs</span>
            </div>
            <div class="tool-item" (click)="openWebhooks()">
              <i class="pi pi-send"></i>
              <span>Webhooks</span>
            </div>
            <div class="tool-item" (click)="openTesting()">
              <i class="pi pi-check-circle"></i>
              <span>Testing</span>
            </div>
          </div>
        </div>

        <!-- Code Examples -->
        <div class="examples-card">
          <h3>Code Examples</h3>
          <div class="examples-list">
            <div class="example-item">
              <h4>User Authentication</h4>
              <p>JavaScript example for user login</p>
              <button class="btn btn-sm" (click)="viewExample('auth')">View</button>
            </div>
            <div class="example-item">
              <h4>Create Application</h4>
              <p>React example for app creation</p>
              <button class="btn btn-sm" (click)="viewExample('create-app')">View</button>
            </div>
            <div class="example-item">
              <h4>Payment Integration</h4>
              <p>Node.js payment processing</p>
              <button class="btn btn-sm" (click)="viewExample('payment')">View</button>
            </div>
          </div>
        </div>

        <!-- Environment Status -->
        <div class="status-card">
          <h3>Environment Status</h3>
          <div class="status-list">
            <div class="status-item">
              <span class="status-indicator active"></span>
              <span class="status-label">Development API</span>
              <span class="status-value">Operational</span>
            </div>
            <div class="status-item">
              <span class="status-indicator active"></span>
              <span class="status-label">Staging Environment</span>
              <span class="status-value">Operational</span>
            </div>
            <div class="status-item">
              <span class="status-indicator warning"></span>
              <span class="status-label">Production API</span>
              <span class="status-value">Maintenance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .developer-dashboard {
        padding: 1.5rem;
      }

      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .sandbox-card,
      .tools-card,
      .examples-card,
      .status-card {
        background: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        padding: 1.5rem;
      }

      .sandbox-actions {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
      }

      .tools-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .tool-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .tool-item:hover {
        background: #f8f9fa;
        border-color: #007bff;
      }

      .tool-item i {
        font-size: 1.5rem;
        color: #007bff;
        margin-bottom: 0.5rem;
      }

      .api-call {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem;
        border-bottom: 1px solid #f0f0f0;
      }

      .method {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
        color: white;
      }

      .method.get {
        background: #28a745;
      }
      .method.post {
        background: #007bff;
      }
      .method.put {
        background: #ffc107;
        color: #212529;
      }
      .method.delete {
        background: #dc3545;
      }

      .endpoint {
        font-family: monospace;
        flex: 1;
      }

      .status {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: bold;
      }

      .status.success {
        background: #d4edda;
        color: #155724;
      }

      .time {
        font-size: 0.75rem;
        color: #666;
      }

      .example-item {
        padding: 1rem;
        border: 1px solid #e1e5e9;
        border-radius: 6px;
        margin-bottom: 0.5rem;
      }

      .example-item h4 {
        margin: 0 0 0.5rem 0;
      }

      .example-item p {
        margin: 0 0 1rem 0;
        color: #666;
        font-size: 0.875rem;
      }

      .status-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem 0;
        border-bottom: 1px solid #f0f0f0;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
      }

      .status-indicator.active {
        background: #28a745;
      }
      .status-indicator.warning {
        background: #ffc107;
      }
      .status-indicator.error {
        background: #dc3545;
      }

      .status-label {
        flex: 1;
      }

      .status-value {
        font-weight: 500;
      }
    `,
  ],
})
export class CustomerDeveloperDashboardComponent implements OnInit {
  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    // Load API status and recent calls
  }

  openApiExplorer(): void {
    // Navigate to API explorer
  }

  viewApiDocs(): void {
    // Open API documentation
  }

  generateApiKey(): void {
    // Generate new API key
  }

  openDebugger(): void {
    // Open debugging tools
  }

  openLogs(): void {
    // View application logs
  }

  openWebhooks(): void {
    // Manage webhooks
  }

  openTesting(): void {
    // Open testing tools
  }

  viewExample(type: string): void {
    // View specific code example
  }
}
