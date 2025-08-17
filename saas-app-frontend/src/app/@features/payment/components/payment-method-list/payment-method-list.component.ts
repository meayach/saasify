import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'stripe' | 'paypal' | 'bank_transfer' | 'crypto';
  description: string;
  status: 'active' | 'inactive' | 'testing';
  configuration: any;
  associatedApps: string[];
  createdDate: Date;
  lastUsed?: Date;
  transactionCount: number;
  totalAmount: number;
}

@Component({
  selector: 'app-payment-method-list',
  templateUrl: './payment-method-list.component.html',
  styleUrls: ['./payment-method-list.component.css'],
})
export class PaymentMethodListComponent implements OnInit {
  paymentMethods: PaymentMethod[] = [];
  loading = false;

  // Statistiques
  stats = {
    totalMethods: 0,
    activeMethods: 0,
    totalTransactions: 0,
    totalRevenue: 0,
  };

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.loadPaymentMethods();
  }

  loadPaymentMethods(): void {
    this.loading = true;

    // Simuler le chargement des données
    setTimeout(() => {
      this.paymentMethods = [
        {
          id: 'payment-1',
          name: 'Stripe Principale',
          type: 'stripe',
          description: 'Configuration Stripe pour les paiements par carte',
          status: 'active',
          configuration: {
            publicKey: 'pk_test_****',
            webhookUrl: 'https://api.example.com/webhooks/stripe',
          },
          associatedApps: ['app-1', 'app-2'],
          createdDate: new Date('2023-01-15'),
          lastUsed: new Date('2024-08-05'),
          transactionCount: 156,
          totalAmount: 4680.5,
        },
        {
          id: 'payment-2',
          name: 'PayPal Business',
          type: 'paypal',
          description: 'Compte PayPal pour les paiements internationaux',
          status: 'active',
          configuration: {
            clientId: 'AY****',
            mode: 'live',
          },
          associatedApps: ['app-1'],
          createdDate: new Date('2023-02-10'),
          lastUsed: new Date('2024-08-04'),
          transactionCount: 89,
          totalAmount: 2340.0,
        },
        {
          id: 'payment-3',
          name: 'Virement Bancaire',
          type: 'bank_transfer',
          description: 'Paiements par virement pour les gros montants',
          status: 'active',
          configuration: {
            iban: 'FR76****',
            bic: 'BNPAFRPP',
          },
          associatedApps: ['app-3'],
          createdDate: new Date('2023-03-01'),
          lastUsed: new Date('2024-07-20'),
          transactionCount: 23,
          totalAmount: 15600.0,
        },
        {
          id: 'payment-4',
          name: 'Crypto Payments',
          type: 'crypto',
          description: 'Paiements en cryptomonnaies (Bitcoin, Ethereum)',
          status: 'testing',
          configuration: {
            walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
            supportedCoins: ['BTC', 'ETH'],
          },
          associatedApps: [],
          createdDate: new Date('2024-01-15'),
          transactionCount: 5,
          totalAmount: 890.0,
        },
      ];

      this.updateStats();
      this.loading = false;
    }, 1000);
  }

  updateStats(): void {
    this.stats.totalMethods = this.paymentMethods.length;
    this.stats.activeMethods = this.paymentMethods.filter((p) => p.status === 'active').length;
    this.stats.totalTransactions = this.paymentMethods.reduce(
      (sum, p) => sum + p.transactionCount,
      0,
    );
    this.stats.totalRevenue = this.paymentMethods.reduce((sum, p) => sum + p.totalAmount, 0);
  }

  onCreatePaymentMethod(): void {
    this.router.navigate(['/payment/create']);
  }

  onEditPaymentMethod(method: PaymentMethod): void {
    this.router.navigate(['/payment/edit', method.id]);
  }

  onToggleStatus(method: PaymentMethod): void {
    if (method.status === 'active') {
      method.status = 'inactive';
    } else if (method.status === 'inactive') {
      method.status = 'active';
    }
    console.log(`Méthode ${method.name} ${method.status === 'active' ? 'activée' : 'désactivée'}`);
    this.updateStats();
  }

  onDeletePaymentMethod(method: PaymentMethod): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la méthode "${method.name}" ?`)) {
      this.paymentMethods = this.paymentMethods.filter((p) => p.id !== method.id);
      this.updateStats();
      console.log('Méthode de paiement supprimée:', method.name);
    }
  }

  onViewTransactions(method: PaymentMethod): void {
    console.log('Voir les transactions pour:', method.name);
    // Naviguer vers la liste des transactions pour cette méthode
  }

  onTestPayment(method: PaymentMethod): void {
    console.log('Test de paiement pour:', method.name);
    // Lancer un test de paiement
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'stripe':
        return 'pi-credit-card';
      case 'paypal':
        return 'pi-paypal';
      case 'bank_transfer':
        return 'pi-building';
      case 'crypto':
        return 'pi-bitcoin';
      default:
        return 'pi-wallet';
    }
  }

  getTypeLabel(type: string): string {
    switch (type) {
      case 'stripe':
        return 'Stripe';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Virement';
      case 'crypto':
        return 'Crypto';
      default:
        return type;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'active':
        return 'Actif';
      case 'inactive':
        return 'Inactif';
      case 'testing':
        return 'Test';
      default:
        return status;
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  }
}
