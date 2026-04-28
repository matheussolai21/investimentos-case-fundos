import { TestBed } from '@angular/core/testing';
import { ValidatorsService } from './validators.service';

describe('ValidatorsService', () => {
  let service: ValidatorsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ValidatorsService);
  });

  it('should create', () => {
    expect(service).toBeTruthy();
  });

  describe('formatCNPJ', () => {
    it('formata 14 dígitos corretamente', () => {
      expect(service.formatCNPJ('21527101000195')).toBe('21.527.101/0001-95');
      expect(service.formatCNPJ('21.527.101/0001-95')).toBe('21.527.101/0001-95');
    });

    it('retorna vazio ou original quando inválido', () => {
      expect(service.formatCNPJ('')).toBe('');
      expect(service.formatCNPJ('123')).toBe('123');
      expect(service.formatCNPJ(null as any)).toBe('');
    });
  });

  describe('formatHeritage', () => {
    it('formata números para moeda BRL', () => {
      expect(service.formatHeritage(1500000)).toBe('R$ 1.500.000,00');
      expect(service.formatHeritage(1234.56)).toBe('R$ 1.234,56');
      expect(service.formatHeritage(0)).toBe('R$ 0,00');
    });
  });
});