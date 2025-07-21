export class CreateTransactionResponseDto {
  id: string;
  status: string;
  productId: string;
  productQuantity: number;
  pricing: {
    subtotal: number;
    formattedSubtotal: string;
    taxPercentage: number;
    taxAmount: number;
    formattedTaxAmount: string;
    deliveryPrice: number;
    formattedDeliveryPrice: string;
    totalAmount: number;
    formattedTotalAmount: string;
  };
  customerId: string;
  paymentMethod: string;
  createdAt: Date;
}
