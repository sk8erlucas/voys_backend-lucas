import { Test, TestingModule } from '@nestjs/testing';
import { VoysStatusService } from '@src/voys-status/voys-status.service';
import { PrismaService } from '@src/prisma/prisma.service';
import { CreateVoysStatusDto } from './dto/create-voys-status.dto';
import { UpdateVoysStatusDto } from './dto/update-voys-status.dto';
import { NotFoundException } from '@nestjs/common';
import { ErrorCodes } from '@src/errors/error-codes.enum';

describe('VoysStatusService', () => {
  let service: VoysStatusService;
  let prismaService: PrismaService;

  const mockVoysStatus = {
    id: 1,
    name: 'Test Status',
    description: 'Test Description',
    slug: 'test_status',
    ml_status_array: JSON.stringify(['status1', 'status2']),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VoysStatusService,
        {
          provide: PrismaService,
          useValue: {
            voysStatus: {
              create: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              findUnique: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<VoysStatusService>(VoysStatusService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createVoysStatus', () => {
    it('should create a new voys status', async () => {
      const createDto: CreateVoysStatusDto = {
        name: 'New Status',
        description: 'New Description',
        ml_status_array: ['new_status1', 'new_status2'],
      };

      (prismaService.voysStatus.create as jest.Mock).mockResolvedValue({
        ...mockVoysStatus,
        name: createDto.name,
        description: createDto.description,
        slug: 'new_status',
        ml_status_array: JSON.stringify(createDto.ml_status_array),
      });

      const result = await service.createVoysStatus(createDto);

      expect(result).toEqual({
        ...mockVoysStatus,
        name: createDto.name,
        description: createDto.description,
        slug: 'new_status',
        ml_status_array: createDto.ml_status_array,
      });
      expect(prismaService.voysStatus.create).toHaveBeenCalledWith({
        data: {
          name: createDto.name,
          description: createDto.description,
          slug: 'new_status',
          ml_status_array: JSON.stringify(createDto.ml_status_array),
        },
      });
    });
  });

  describe('findAllVoysStatus', () => {
    it('should return an array of voys statuses', async () => {
      (prismaService.voysStatus.findMany as jest.Mock).mockResolvedValue([mockVoysStatus]);

      const result = await service.findAllVoysStatus();

      expect(result).toEqual([{
        ...mockVoysStatus,
        ml_status_array: JSON.parse(mockVoysStatus.ml_status_array),
      }]);
      expect(prismaService.voysStatus.findMany).toHaveBeenCalled();
    });

    it('should return an empty array if no voys statuses found', async () => {
      (prismaService.voysStatus.findMany as jest.Mock).mockResolvedValue(null);

      const result = await service.findAllVoysStatus();

      expect(result).toEqual([]);
    });
  });

  describe('updateVoysStatus', () => {
    it('should update a voys status', async () => {
      const updateDto: UpdateVoysStatusDto = {
        name: 'Updated Status',
        description: 'Updated Description',
        ml_status_array: ['updated_status1', 'updated_status2'],
      };

      (prismaService.voysStatus.update as jest.Mock).mockResolvedValue({
        ...mockVoysStatus,
        name: updateDto.name,
        description: updateDto.description,
        slug: 'updated_status',
        ml_status_array: JSON.stringify(updateDto.ml_status_array),
      });

      const result = await service.updateVoysStatus(1, updateDto);

      expect(result).toEqual({
        ...mockVoysStatus,
        name: updateDto.name,
        description: updateDto.description,
        slug: 'updated_status',
        ml_status_array: updateDto.ml_status_array,
      });
      expect(prismaService.voysStatus.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          name: updateDto.name,
          description: updateDto.description,
          slug: 'updated_status',
          ml_status_array: JSON.stringify(updateDto.ml_status_array),
        },
      });
    });
  });

  describe('deleteVoysStatus', () => {
    it('should delete a voys status', async () => {
      (prismaService.voysStatus.findUnique as jest.Mock).mockResolvedValue(mockVoysStatus);
      (prismaService.voysStatus.delete as jest.Mock).mockResolvedValue(mockVoysStatus);

      const result = await service.deleteVoysStatus(1);

      expect(result).toEqual(mockVoysStatus);
      expect(prismaService.voysStatus.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(prismaService.voysStatus.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException if voys status not found', async () => {
      (prismaService.voysStatus.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteVoysStatus(1)).rejects.toThrow(NotFoundException);
      expect(prismaService.voysStatus.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
    });
  });
});
