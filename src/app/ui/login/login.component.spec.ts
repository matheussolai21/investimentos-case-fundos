import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(waitForAsync(() => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['PostLogin']);
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      imports: [LoginComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

 it('should show message when submit with invalid form', () => {
  // Arrange - Garantir que o formulário está inválido
  component.loginForm.setValue({
    username: '',
    password: ''  
  });
  
  // Marcar como touched para ativar validação
  component.loginForm.markAllAsTouched();
  
  // Act
  component.onSubmit();
  
  // Assert
  expect(authServiceSpy.PostLogin).not.toHaveBeenCalled();
});

  it('should call login method with form values when submit is valid', () => {
    spyOn(component, 'Login');
    component.loginForm.setValue({ username: 'admin', password: '123' });

    component.onSubmit();

    expect(component.Login).toHaveBeenCalledWith({ username: 'admin', password: '123' });
  });

  it('should handle successful login', () => {
    const payload = { username: 'admin', password: '123' };
    const response = { username: 'admin', password: '123', token: 'token-123' };
    authServiceSpy.PostLogin.and.returnValue(of(response));
    spyOn(localStorage, 'setItem');

    component.Login(payload);

    expect(authServiceSpy.PostLogin).toHaveBeenCalledWith(payload);
    expect(localStorage.setItem).toHaveBeenCalledWith('token', 'token-123');
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify('admin'));
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/found-list']);
    expect(component.loading()).toBeFalse();
  });
  


});''