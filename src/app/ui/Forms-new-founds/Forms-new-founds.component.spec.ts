import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { FormsNewFoundsComponent } from './Forms-new-founds.component';
import { FoundsService } from '../../Services/founds.service';
import { ValidatorsService } from '../../Services/validators.service';
import { Fundo } from '../../interfaces/fundos.interface';
import { NgxMaskService, provideNgxMask } from 'ngx-mask';

describe('FormsNewFoundsComponent', () => {
  let component: FormsNewFoundsComponent;
  let fixture: ComponentFixture<FormsNewFoundsComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let foundsServiceSpy: jasmine.SpyObj<FoundsService>;
  let validatorsServiceSpy: jasmine.SpyObj<ValidatorsService>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    foundsServiceSpy = jasmine.createSpyObj<FoundsService>('FoundsService', ['PostFounds', 'getFounds']);
    validatorsServiceSpy = jasmine.createSpyObj<ValidatorsService>('ValidatorsService', ['formatCNPJ']);

    foundsServiceSpy.PostFounds.and.returnValue(of({}));
    foundsServiceSpy.getFounds.and.returnValue(of([]));
    validatorsServiceSpy.formatCNPJ.and.callFake((cnpj: string) => cnpj); // default: retorna o mesmo

    TestBed.configureTestingModule({
      imports: [
        FormsNewFoundsComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: FoundsService, useValue: foundsServiceSpy },
        { provide: ValidatorsService, useValue: validatorsServiceSpy },
        provideNgxMask()
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormsNewFoundsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show message when submit with invalid form', () => {
    component.onSubmit();

    expect(snackBarSpy.open).toHaveBeenCalledWith('Preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    expect(foundsServiceSpy.PostFounds).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should call AddFounds with formatted CNPJ on valid submit', () => {
    const formattedCnpj = '12.345.678/0001-99';
    validatorsServiceSpy.formatCNPJ.and.returnValue(formattedCnpj);

    component.fundoForm.setValue({
      codigo: 'FND001',
      nome: 'Novo Fundo',
      cnpj: '12345678000199',      // sem formatação
      codigo_tipo: '2',
      patrimonio: 2500
    });

    spyOn(component, 'AddFounds').and.callThrough();
    component.onSubmit();

    // Verifica se formatCNPJ foi chamado com o CNPJ cru
    expect(validatorsServiceSpy.formatCNPJ).toHaveBeenCalledWith('12345678000199');

    // Verifica se AddFounds foi chamado com o payload correto (CNPJ formatado)
    const expectedPayload: Fundo = {
      codigo: 'FND001',
      nome: 'Novo Fundo',
      cnpj: formattedCnpj,
      codigo_tipo: 2,
      patrimonio: 2500
    };
    expect(component.AddFounds).toHaveBeenCalledWith(expectedPayload);

    // Snackbar de "salvo com sucesso" (do onSubmit) deve ter sido chamado
    expect(snackBarSpy.open).toHaveBeenCalledWith(`Fundo FND001 salvo com sucesso!`, 'Fechar', { duration: 3000 });
  });

  it('should call PostFounds and navigate after successful creation', fakeAsync(() => {
    const fundoData: Fundo = {
      codigo: 'FND002',
      nome: 'Fundo Teste',
      cnpj: '12.345.678/0001-99',
      codigo_tipo: 1,
      patrimonio: 10000
    };

    foundsServiceSpy.PostFounds.and.returnValue(of({}));
    component.AddFounds(fundoData);

    tick(2000); // aguarda o setTimeout dentro do next

    expect(foundsServiceSpy.PostFounds).toHaveBeenCalledWith(fundoData);
    expect(snackBarSpy.open).toHaveBeenCalledWith('Fundo criado com sucesso!', 'Fechar', { duration: 3000 });
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/found-list']);
  }));

  it('should show error snackbar and set loading to false when AddFounds fails', () => {
    const errorResponse = { error: { error: 'Erro de negócio' } };
    foundsServiceSpy.PostFounds.and.returnValue(throwError(() => errorResponse));

    const fundoData: Fundo = {
      codigo: 'FND003',
      nome: 'Fundo Erro',
      cnpj: '12.345.678/0001-99',
      codigo_tipo: 1,
      patrimonio: 5000
    };

    component.AddFounds(fundoData);

    expect(foundsServiceSpy.PostFounds).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should navigate to list on cancel', () => {
    component.cancelar();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['found-list']);
  });
});