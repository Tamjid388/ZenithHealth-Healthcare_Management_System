export interface ICreatePaymentIntentPayload {
  amount: number;
  appointmentId: string;
  currency?: string;
}
