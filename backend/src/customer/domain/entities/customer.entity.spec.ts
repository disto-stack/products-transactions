import { CustomerEntity } from './customer.entity';

describe('CustomerEntity', () => {
  describe('constructor', () => {
    it('should create customer entity with all properties', () => {
      const id = '123';
      const name = 'Juan Pérez';
      const email = 'juan@example.com';
      const phone = '3007304451';

      const customer = new CustomerEntity(id, name, email, phone);

      expect(customer.id).toBe(id);
      expect(customer.name).toBe(name);
      expect(customer.email).toBe(email);
      expect(customer.phone).toBe(phone);
    });
  });

  describe('business rules', () => {
    it('should validate email format', () => {
      const validEmails = [
        'simple@example.com',
        'with+plus@example.com',
        'with.dots@example.com',
        'user123@domain.co.uk',
      ];

      validEmails.forEach(email => {
        expect(() => {
          new CustomerEntity('1', 'Test User', email, '3007304451');
        }).not.toThrow();
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        '',
      ];

      invalidEmails.forEach(email => {
        expect(() => {
          new CustomerEntity('1', 'Test User', email, '3007304451');
        }).toThrow();
      });
    });

    it('should reject invalid names', () => {
      expect(() => {
        new CustomerEntity('1', '', 'test@example.com', '3007304451');
      }).toThrow();
    });

    it('should validate phone format', () => {
      const validPhones = [
        '3007304451',
        '3126789054',
        '3450765987',
        '3235678901',

      ];

      validPhones.forEach(phone => {
        expect(() => {
          new CustomerEntity('1', 'Test User', 'juan@example.com', phone);
        }).not.toThrow();
      });
    });

    it('should reject invalid phone format', () => {
      const validPhones = [
        '12344657',
        '6   ',
        'notNumber',
        '5678999',
      ];

      validPhones.forEach(phone => {
        expect(() => {
          new CustomerEntity('1', 'Test User', 'juan@example.com', phone);
        }).toThrow();
      });
    });
  });

  describe('updateInfo', () => {
    it('should update name and phone', () => {
      const customer = new CustomerEntity('1', 'Juan Pérez', 'juan@example.com', '3007304451');
      const updatedCustomer = customer.updateInfo('Juan Updated', '3001234567');

      expect(updatedCustomer.name).toBe('Juan Updated');
      expect(updatedCustomer.phone).toBe('3001234567');
      expect(updatedCustomer.email).toBe(customer.email);
    });

    it('should update name', () => {
      const customer = new CustomerEntity('1', 'Juan Pérez', 'juan@example.com', '3007304451');
      const updatedCustomer = customer.updateInfo('Juan Updated');

      expect(updatedCustomer.name).toBe('Juan Updated');
      expect(updatedCustomer.phone).toBe('3007304451');
      expect(updatedCustomer.email).toBe(customer.email);
    });

    it('should update phone', () => {
      const customer = new CustomerEntity('1', 'Juan Pérez', 'juan@example.com', '3007304451');
      const updatedCustomer = customer.updateInfo(undefined, '3001234567');

      expect(updatedCustomer.name).toBe('Juan Pérez');
      expect(updatedCustomer.phone).toBe('3001234567');
      expect(updatedCustomer.email).toBe(customer.email);
    });

  });
});
