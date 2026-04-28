import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { AuthResponse } from '../interfaces/auth.interface';

describe('Service: Auth', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create service', () => {
    expect(service).toBeTruthy();
  });

  it('should post login payload to usuarios endpoint', () => {
    const payload = { username: 'admin', password: '123456' };
    const response: AuthResponse = {
      username: 'admin',
      password: '123456',
      token: 'jwt-token'
    };

    service.PostLogin(payload).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush(response);
  });

  it('should propagate login error response', () => {
    const payload = { username: 'admin', password: 'wrong' };
    const errorPayload = { error: 'Credenciais invalidas' };

    service.PostLogin(payload).subscribe({
      next: () => fail('expected an error response'),
      error: (error) => {
        expect(error.status).toBe(401);
        expect(error.error).toEqual(errorPayload);
      }
    });

    const req = httpMock.expectOne('http://localhost:3000/login');
    expect(req.request.method).toBe('POST');
    req.flush(errorPayload, { status: 401, statusText: 'Unauthorized' });
  });
});