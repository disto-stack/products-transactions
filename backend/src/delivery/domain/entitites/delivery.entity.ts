export class DeliveryEntity {
  constructor(
    public readonly transactionId: string,
    public readonly address: string,
    public readonly city: string,
    public readonly department: string,
    public readonly createdAt: Date,
    public readonly updatedAt?: Date,
  ) {}

  static create(
    transactionId: string,
    address: string,
    city: string,
    department: string,
    createdAt?: Date,
    updatedAt?: Date,
  ): DeliveryEntity {
    return new DeliveryEntity(
      transactionId,
      address,
      city,
      department,
      createdAt || new Date(),
      updatedAt || new Date(),
    );
  }

  getFullAddress(): string {
    return `${this.address}, ${this.city}, ${this.department}`;
  }
}
