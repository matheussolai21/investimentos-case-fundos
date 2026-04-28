import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FoundsService } from './founds.service';
import { Fundo } from '../interfaces/fundos.interface';

describe('Service: Founds', () => {
  let service: FoundsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(FoundsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should get all funds', () => {
    const mockFunds: Fundo[] = [
      { id: '1', codigo: 'FND-1', nome: 'Fundo 1', cnpj: '11.111.111/0001-11', codigo_tipo: '1', patrimonio: 1000 }
    ];

    service.getFounds().subscribe((result) => {
      expect(result).toEqual(mockFunds);
    });

    const req = httpMock.expectOne('http://localhost:3000/fundos');
    expect(req.request.method).toBe('GET');
    req.flush(mockFunds);
  });

  it('should get fund by code', () => {
    const fund = { id: '1', codigo: 'ABC', nome: 'Fundo ABC', cnpj: '22.222.222/0001-22', codigo_tipo: '2', patrimonio: 5000 };

    service.getFoundsByCode('ABC').subscribe((result) => {
      expect(result).toEqual(fund);
    });

    const req = httpMock.expectOne('http://localhost:3000/fundos/:ABC');
    expect(req.request.method).toBe('GET');
    req.flush(fund);
  });

  it('should post a new fund', () => {
    const payload: Fundo = {
      id: '2',
      codigo: 'FND-2',
      nome: 'Fundo 2',
      cnpj: '33.333.333/0001-33',
      codigo_tipo: '3',
      patrimonio: 9000
    };

    service.PostFounds(payload).subscribe((result) => {
      expect(result).toEqual(payload);
    });

    const req = httpMock.expectOne('http://localhost:3000/fundos');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(payload);
  });
});