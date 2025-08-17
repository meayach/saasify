export interface PaymentMethods {
  paypal: boolean;
  wize: boolean;
  payonner: boolean;
}

export const DEFAULT_PAYMENT_METHODS: PaymentMethods = {
  paypal: false,
  wize: false,
  payonner: false,
};
