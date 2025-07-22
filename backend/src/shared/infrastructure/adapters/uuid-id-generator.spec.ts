import { UuidIdGenerator } from './uuid-id-generator';

describe('UuidIdGenerator', () => {
  let idGenerator: UuidIdGenerator;

  beforeEach(() => {
    idGenerator = new UuidIdGenerator();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('dependency injection', () => {
    it('should be defined', () => {
      expect(idGenerator).toBeDefined();
    });

    it('should be an instance of UuidIdGenerator', () => {
      expect(idGenerator).toBeInstanceOf(UuidIdGenerator);
    });
  });

  describe('generateId', () => {
    it('should generate a valid UUID v4', () => {
      const id = idGenerator.generateId();

      expect(id).toBeDefined();
      expect(typeof id).toBe('string');
      expect(id).toHaveLength(36);

      const uuidV4Regex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(id).toMatch(uuidV4Regex);
    });
  });
});
