export class GetProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  deliveryPrice: number;
  formattedDeliveryPrice: string;
  taxPercentage: number;
  image: string | null;
  hasImage: boolean;
  stock: {
    quantity: number;
    available: boolean;
    outOfStock: boolean;
    lastUpdated: string;
  };
  createdAt: string;
}
