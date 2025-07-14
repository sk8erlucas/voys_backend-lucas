import { Test, TestingModule } from '@nestjs/testing';
import { VoysStatusController } from './voys-status.controller';
import { VoysStatusService } from './voys-status.service';
import { CreateVoysStatusDto } from './dto/create-voys-status.dto';
import { UpdateVoysStatusDto } from './dto/update-voys-status.dto';

describe('VoysStatusController', () => {
  let controller: VoysStatusController;
  let service: VoysStatusService;

  const mockVoysStatus = {
    id: 1,
    name: 'Test Status',
    description: 'Test Description',
    ml_status_array: ['status1', 'status2'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VoysStatusController],
      providers: [
        {
          provide: VoysStatusService,
          useValue: {
            createVoysStatus: jest.fn().mockResolvedValue(mockVoysStatus),
            findAllVoysStatus: jest.fn().mockResolvedValue([mockVoysStatus]),
            updateVoysStatus: jest.fn().mockResolvedValue(mockVoysStatus),
            deleteVoysStatus: jest.fn().mockResolvedValue(mockVoysStatus),
          },
        },
      ],
    }).compile();

    controller = module.get<VoysStatusController>(VoysStatusController);
    service = module.get<VoysStatusService>(VoysStatusService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createVoysStatus', () => {
    it('should create a new voys status', async () => {
      const createDto: CreateVoysStatusDto = {
        name: 'New Status',
        description: 'New Description',
        ml_status_array: ['new_status1', 'new_status2'],
      };

      expect(await controller.createVoysStatus(createDto)).toEqual(mockVoysStatus);
      expect(service.createVoysStatus).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAllVoysStatus', () => {
    it('should return an array of voys statuses', async () => {
      expect(await controller.findAllVoysStatus()).toEqual([mockVoysStatus]);
      expect(service.findAllVoysStatus).toHaveBeenCalled();
    });
  });

  describe('updateVoysStatus', () => {
    it('should update a voys status', async () => {
      const updateDto: UpdateVoysStatusDto = {
        name: 'Updated Status',
        description: 'Updated Description',
        ml_status_array: ['updated_status1', 'updated_status2'],
      };

      expect(await controller.updateVoysStatus(1, updateDto)).toEqual(mockVoysStatus);
      expect(service.updateVoysStatus).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('deleteVoysStatus', () => {
    it('should delete a voys status', async () => {
      expect(await controller.deleteVoysStatus(1)).toEqual(mockVoysStatus);
      expect(service.deleteVoysStatus).toHaveBeenCalledWith(1);
    });
  });
});
