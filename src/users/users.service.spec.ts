import { faker } from '@faker-js/faker';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { JwtStrategy } from '../guards/jwt.strategy';
import { UsersService } from './users.service';
import { RegisterUserDto } from './dto/register-user.dto';

const mockPrisma = {
  users: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

const mockMailService = {
  sendMail: jest.fn(),
};

describe('UsersService', () => {
  let usersService: UsersService;
  let prisma: PrismaClient;
  let jwtService: JwtService;
  let mailService: MailerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        JwtStrategy,
        JwtService,
        MailerService,
        {
          provide: 'dbclient',
          useValue: mockPrisma,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: JwtStrategy,
          useValue: jest.fn(),
        },
        {
          provide: MailerService,
          useValue: mockMailService,
        },
      ],
    }).compile();
    usersService = await module.get<UsersService>(UsersService);
    prisma = await module.get<PrismaClient>('dbclient');
    jwtService = await module.get<JwtService>(JwtService);
    mailService = await module.get<MailerService>(MailerService);
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(prisma).toBeDefined();
    expect(mailService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('find all users', () => {
    it('should return a array with no data', async () => {
      const users = await prisma.users.create({
        data: MakeBody({}),
      });
      const reuslt = await usersService.findAll();
      expect(reuslt).toEqual(users);
    });
  });

  describe('Register a new user', () => {
    it('should register a new user', async () => {
      const users: RegisterUserDto = MakeBody({});
      const hashedPassword = await bcrypt.hash(users.password, 10);

      const result = await usersService.register({
        ...users,
        password: hashedPassword,
        passwordConfirmation: hashedPassword,
      });
      
      
      expect(result).not.toBeInstanceOf(Error);
      expect(result).toEqual(users);
      expect(mailService.sendMail).toHaveBeenCalled();
    });
  });
});

function MakeBody(props?: any) {
  const defaultData = {
    id: faker.number.int(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(10),
    passwordConfirmation: faker.internet.password(10),
    confirmationToken: faker.string.alphanumeric({ length: 100 }),
    role: UserRole.USER,
    status: true,
    recoverToken: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  return { ...defaultData, ...props };
}
