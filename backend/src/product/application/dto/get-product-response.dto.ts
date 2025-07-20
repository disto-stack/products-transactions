export class GetProductResponseDto {
  id: string;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
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
