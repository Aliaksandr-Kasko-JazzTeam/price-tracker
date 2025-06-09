import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, RmqContext } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { PrismaService } from '@price-tracker/shared';
import { CacheService } from '../cache/cache.service';
import axios from 'axios';
import * as cheerio from 'cheerio';
import { of } from 'rxjs';

var mockNotificationClient = {
  emit: jest.fn().mockReturnValue(of(undefined)),
  connect: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

jest.mock('axios');
jest.mock('cheerio');
jest.mock('ioredis');

jest.mock('@nestjs/microservices', () => ({
  ...jest.requireActual('@nestjs/microservices'),
  ClientProxyFactory: {
    create: jest.fn(() => mockNotificationClient),
  },
}));

describe('ProductService', () => {
  let service: ProductService;
  let prismaService: PrismaService;
  let cacheService: CacheService;
  let notificationClient: ClientProxy;

  let mockPrismaService: any;
  let mockCacheService: any;

  const mockProduct = {
    id: '1',
    url: 'https://intersport.com.au/product',
    name: 'Test Product',
    currentPrice: 99.99,
    subscriptions: [],
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string | number> = {
        RABBITMQ_URL: 'amqp://localhost:5672',
        REDIS_HOST: 'localhost',
        REDIS_PORT: 6379,
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    mockPrismaService = {
      product: {
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      priceHistory: {
        create: jest.fn(),
      },
    };

    mockCacheService = {
      getPrice: jest.fn(),
      setPrice: jest.fn(),
    };

    mockNotificationClient = {
      emit: jest.fn().mockReturnValue(of(undefined)),
      connect: jest.fn().mockResolvedValue(undefined),
      close: jest.fn().mockResolvedValue(undefined),
    };

    mockPrismaService.product.findUnique.mockResolvedValue({ ...mockProduct, subscriptions: [] });
    mockPrismaService.product.findUniqueOrThrow.mockResolvedValue({ ...mockProduct, subscriptions: [] });
    mockPrismaService.product.upsert.mockResolvedValue({ ...mockProduct, subscriptions: [] });
    mockPrismaService.product.update.mockResolvedValue({ ...mockProduct, subscriptions: [] });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
        {
          provide: 'NOTIFICATION_CLIENT',
          useValue: mockNotificationClient,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
    prismaService = module.get<PrismaService>(PrismaService);
    cacheService = module.get<CacheService>(CacheService);
    notificationClient = module.get<ClientProxy>('NOTIFICATION_CLIENT');

    (cheerio.load as jest.Mock).mockImplementation((_html: string) => {
      return (_selector: string) => ({
        contents: jest.fn().mockReturnValue({
          filter: jest.fn().mockReturnValue({
            text: jest.fn().mockReturnValue('Test Product Name'),
          }),
        }),
        first: jest.fn().mockReturnValue({
          text: jest.fn().mockReturnValue('$99.99'),
        }),
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
    jest.resetModules();
  });

  describe('fetchAndCreateProduct', () => {
    const mockHtml = '<html><body><h1><span class="dot"></span>Test Product Name</h1><span class="price-item">$99.99</span></body></html>';
    const mockPrice = 99.99;

    beforeEach(() => {
      (axios.get as jest.Mock).mockResolvedValue({ data: mockHtml });
    });

    it('should fetch and create a new product', async () => {
      mockCacheService.getPrice.mockResolvedValue(null);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.upsert.mockResolvedValue({
        ...mockProduct,
        subscriptions: [],
      });
      mockCacheService.setPrice.mockResolvedValue(undefined);

      const result = await service.fetchAndCreateProduct('https://intersport.com.au/product');

      expect(result).toEqual({
        ...mockProduct,
        subscriptions: [],
      });
      expect(mockPrismaService.product.upsert).toHaveBeenCalled();
      expect(mockCacheService.setPrice).toHaveBeenCalledWith('https://intersport.com.au/product', mockPrice);
    });

    it('should use cached price if available', async () => {
      mockCacheService.getPrice.mockResolvedValue(mockPrice);
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        subscriptions: [],
      });

      const result = await service.fetchAndCreateProduct('https://intersport.com.au/product');

      expect(result).toEqual({
        ...mockProduct,
        subscriptions: [],
      });
      expect(mockPrismaService.product.upsert).not.toHaveBeenCalled();
      expect(mockCacheService.setPrice).not.toHaveBeenCalled();
    });

    it('should notify subscribers when price changes', async () => {
      const oldPrice = 89.99;
      const mockSubscriber = { user: { email: 'test@example.com' } };
      const productWithSubscriptions = {
        ...mockProduct,
        currentPrice: oldPrice,
        subscriptions: [mockSubscriber],
      };

      mockCacheService.getPrice.mockResolvedValue(null);

      mockPrismaService.product.findUnique.mockResolvedValue(productWithSubscriptions);

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue({
        ...productWithSubscriptions,
        subscriptions: [mockSubscriber],
      });

      mockPrismaService.product.upsert.mockResolvedValue({
        ...productWithSubscriptions,
        currentPrice: mockPrice,
      });

      (axios.get as jest.Mock).mockResolvedValue({
        data: '<html><body><h1><span class="dot"></span>Test Product Name</h1><span class="price-item">$99.99</span></body></html>'
      });

      mockCacheService.setPrice.mockResolvedValue(undefined);
      mockPrismaService.priceHistory.create.mockResolvedValue(undefined);

      await service.fetchAndCreateProduct('https://intersport.com.au/product');

      expect(mockNotificationClient.emit).toHaveBeenCalledWith(
        'price-change',
        expect.objectContaining({
          subscribers: [mockSubscriber.user.email],
          productName: 'Test Product',
          productUrl: 'https://intersport.com.au/product',
          currentPrice: mockPrice,
          previousPrice: oldPrice,
        })
      );
    });
  });

  describe('handlePriceUpdate', () => {
    const mockChannel = { nack: jest.fn(), ack: jest.fn() };
    const mockOriginalMessage = {};
    const mockContext = {
      getChannelRef: jest.fn(() => mockChannel),
      getMessage: jest.fn(() => mockOriginalMessage),
    } as unknown as RmqContext;

    it('should update product price and notify subscribers', async () => {
      const newPrice = 89.99;
      const mockSubscriber = { user: { email: 'test@example.com' } };
      const productWithSubscriptions = {
        ...mockProduct,
        currentPrice: newPrice,
        subscriptions: [mockSubscriber],
      };

      mockPrismaService.product.findUniqueOrThrow.mockResolvedValue(productWithSubscriptions);
      mockPrismaService.product.update.mockResolvedValue(productWithSubscriptions);
      mockCacheService.setPrice.mockResolvedValue(undefined);
      mockPrismaService.priceHistory.create.mockResolvedValue(undefined);

      await service.handlePriceUpdate(
        { url: 'https://intersport.com.au/product', price: newPrice },
        mockContext
      );

      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { url: 'https://intersport.com.au/product' },
        data: { currentPrice: newPrice },
      });
      expect(mockCacheService.setPrice).toHaveBeenCalledWith(
        'https://intersport.com.au/product',
        newPrice
      );
      expect(mockPrismaService.priceHistory.create).toHaveBeenCalled();
      expect(mockChannel.ack).toHaveBeenCalledWith(mockOriginalMessage);
    });
  });

  describe('Redis caching', () => {
    it('should cache price after fetching product', async () => {
      mockCacheService.getPrice.mockResolvedValue(null);
      mockPrismaService.product.findUnique.mockResolvedValue(null);
      mockPrismaService.product.upsert.mockResolvedValue({
        ...mockProduct,
        subscriptions: [],
      });

      await service.fetchAndCreateProduct('https://intersport.com.au/product');

      expect(mockCacheService.setPrice).toHaveBeenCalledWith(
        'https://intersport.com.au/product',
        mockProduct.currentPrice
      );
    });

    it('should retrieve price from cache if available', async () => {
      const cachedPrice = 89.99;
      mockCacheService.getPrice.mockResolvedValue(cachedPrice);
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        subscriptions: [],
      });

      await service.fetchAndCreateProduct('https://intersport.com.au/product');

      expect(mockCacheService.getPrice).toHaveBeenCalledWith('https://intersport.com.au/product');
      expect(mockPrismaService.product.upsert).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle invalid URLs', async () => {
      await expect(service.fetchAndCreateProduct('invalid-url')).rejects.toThrow();
    });

    it('should handle failed product fetches', async () => {
      (axios.get as jest.Mock).mockRejectedValue(new Error('Network error'));
      (cheerio.load as jest.Mock).mockReset();
      mockCacheService.getPrice.mockResolvedValue(null);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.fetchAndCreateProduct('https://intersport.com.au/product')).rejects.toThrow();
    });

    it('should handle missing product information', async () => {
      (cheerio.load as jest.Mock).mockImplementation((_html: string) => {
        return (_selector: string) => ({
          contents: jest.fn().mockReturnValue({
            filter: jest.fn().mockReturnValue({
              text: jest.fn().mockReturnValue(''),
            }),
          }),
          first: jest.fn().mockReturnValue({
            text: jest.fn().mockReturnValue(''),
          }),
        });
      });
      mockCacheService.getPrice.mockResolvedValue(null);
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.fetchAndCreateProduct('https://intersport.com.au/product')).rejects.toThrow();
    });
  });
});
