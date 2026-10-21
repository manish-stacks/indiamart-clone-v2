import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: any;
  let jwt: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      role: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      session: {
        create: jest.fn(),
        deleteMany: jest.fn(),
      },
    };

    jwt = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verify: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should throw ConflictException if user already exists', async () => {
      prisma.user.findFirst.mockResolvedValue({ id: '1', email: 'test@example.com' });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'Password123!',
          fullName: 'Test User',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create new user and return tokens', async () => {
      prisma.user.findFirst.mockResolvedValue(null);
      prisma.role.findUnique.mockResolvedValue({ id: 'role-1', name: 'BUYER' });
      prisma.user.create.mockResolvedValue({
        id: 'new-user-1',
        email: 'test@example.com',
        roles: [{ role: { name: 'BUYER' } }],
      });

      const res = await service.register({
        email: 'test@example.com',
        password: 'Password123!',
        fullName: 'Test User',
      });

      expect(res.accessToken).toBe('mock-jwt-token');
      expect(res.user.email).toBe('test@example.com');
    });
  });

  describe('login', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should validate password and return tokens on success', async () => {
      const hashedPassword = await bcrypt.hash('Password123!', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: hashedPassword,
        status: 'ACTIVE',
        roles: [{ role: { name: 'BUYER' } }],
      });

      const res = await service.login({
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(res.accessToken).toBe('mock-jwt-token');
      expect(res.user.id).toBe('user-123');
    });
  });
});

