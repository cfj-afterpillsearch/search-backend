import { Test, TestingModule } from '@nestjs/testing';
import { MedicalinstitutionService } from './medicalinstitution.service';

describe('MedicalinstitutionService', () => {
  let service: MedicalinstitutionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MedicalinstitutionService],
    }).compile();

    service = module.get<MedicalinstitutionService>(MedicalinstitutionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
