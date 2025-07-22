import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaService,
      ],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lifecycle hooks', () => {
    it('should connect on module init', async () => {
      const connectSpy = jest.spyOn(service, '$connect').mockResolvedValue();

      await service.onModuleInit();

      expect(connectSpy).toHaveBeenCalledTimes(1);

      connectSpy.mockRestore();
    });

    it('should handle connection errors gracefully', async () => {
      const connectionError = new Error('Database connection failed');
      const connectSpy = jest.spyOn(service, '$connect').mockRejectedValue(connectionError);

      await expect(service.onModuleInit()).rejects.toThrow('Database connection failed');

      expect(connectSpy).toHaveBeenCalledTimes(1);
      connectSpy.mockRestore();
    });

    it('should disconnect on module destroy', async () => {
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockResolvedValue();

      await service.onModuleDestroy();

      expect(disconnectSpy).toHaveBeenCalledTimes(1);

      disconnectSpy.mockRestore();
    });

    it('should handle disconnection errors gracefully', async () => {
      const disconnectionError = new Error('Error during disconnection');
      const disconnectSpy = jest.spyOn(service, '$disconnect').mockRejectedValue(disconnectionError);

      await expect(service.onModuleDestroy()).rejects.toThrow('Error during disconnection');

      disconnectSpy.mockRestore();
    });
  });

});