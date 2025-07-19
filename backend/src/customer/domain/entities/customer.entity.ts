// TODO: Improve error handling

export class CustomerEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly phone: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {
    this.validateEmail(email);
    this.validateName(name);
    this.validatePhone(phone);
  }

  private validateEmail(email: string): void {
    if (email.length === 0) {
      throw new Error('Email cannot be empty');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const testEmail = emailRegex.test(email);
    if (!testEmail) {
      throw new Error('Invalid email format');
    }
  }

  private validateName(name: string): void {
    if (name.length === 0) {
      throw new Error('Name cannot be empty');
    }
  }

  private validatePhone(phone: string): void {
    if (phone.length === 0) {
      throw new Error('Phone cannot be empty');
    }

    const phoneRegex = /^(\+?57)?3(0(0|1|2|4|5)|1\d|2[0-4]|5(0|1))\d{7}$/;
    const testPhone = phoneRegex.test(phone);
    if (!testPhone) {
      throw new Error('Invalid phone format');
    }
  }

  updateInfo(name?: string, phone?: string): CustomerEntity {
    if (name) {
      this.validateName(name);
    }

    if (phone) {
      this.validatePhone(phone);
    }

    return new CustomerEntity(
      this.id,
      name ?? this.name,
      this.email,
      phone ?? this.phone,
    );
  }
}
