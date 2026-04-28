import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { FormsNewFoundsComponent } from './Forms-new-founds.component';
import { FoundsService } from '../../Services/founds.service';
import { Fundo } from '../../interfaces/fundos.interface';

describe('FormsNewFoundsComponent', () => {
  let component: FormsNewFoundsComponent;
  let fixture: ComponentFixture<FormsNewFoundsComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let foundsServiceStub: Pick<FoundsService, 'foundListServer'>;

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);
    foundsServiceStub = { foundListServer: [] };

    TestBed.configureTestingModule({
      imports: [
        FormsNewFoundsComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: FoundsService, useValue: foundsServiceStub }
      ]
    })
    .compileComponents();
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
    expect(routerSpy.navigate).not.toHaveBeenCalled();
  });

  it('should prepend new fund to datasource and navigate to list', () => {
    const existingFund: Fundo = {
      id: '1',
      codigo: 'FND-EXISTING',
      nome: 'Fundo Existente',
      cnpj: '11.111.111/0001-11',
      codigo_tipo: '1',
      patrimonio: 1000
    };
    foundsServiceStub.foundListServer = [existingFund];

    component.fundoForm.setValue({
      nome: 'Novo Fundo',
      cnpj: '12.345.678/0001-99',
      codigo_tipo: '2',
      patrimonio: 2500
    });

    component.onSubmit();

    expect(foundsServiceStub.foundListServer.length).toBe(2);
    expect(foundsServiceStub.foundListServer[0].nome).toBe('Novo Fundo');
    expect(foundsServiceStub.foundListServer[0].codigo).toBe('FND001');
    expect(foundsServiceStub.foundListServer[1]).toEqual(existingFund);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/found-list']);
  });

  it('should navigate to list on cancel', () => {
    component.cancelar();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['found-list']);
  });
});