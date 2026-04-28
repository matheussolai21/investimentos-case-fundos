import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';

import { FoundsListComponent } from './founds-list.component';
import { FoundsService } from '../../Services/founds.service';
import { Fundo } from '../../interfaces/fundos.interface';

describe('FoundsListComponent', () => {
  let component: FoundsListComponent;
  let fixture: ComponentFixture<FoundsListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let foundsServiceSpy: jasmine.SpyObj<FoundsService>;

  const apiFundA: Fundo = {
    codigo: 'FND-A',
    nome: 'Fundo A',
    cnpj: '11.111.111/0001-11',
    codigo_tipo: 1,
    patrimonio: 1000
  };

  const apiFundB: Fundo = {
    codigo: 'FND-B',
    nome: 'Fundo B',
    cnpj: '22.222.222/0001-22',
    codigo_tipo: 2,
    patrimonio: 2000
  };

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    const serviceSpy = jasmine.createSpyObj<FoundsService>('FoundsService', [
      'getFounds',
      'getFoundsByCode',
      'PatchFoundsByCode',
      'DeleteFoundsByCode'
    ]);
    serviceSpy.getFounds.and.returnValue(of([apiFundA, apiFundB]));
    serviceSpy.getFoundsByCode.and.returnValue(of(apiFundB));
    serviceSpy.PatchFoundsByCode.and.returnValue(of({}));
    serviceSpy.DeleteFoundsByCode.and.returnValue(of({}));
    foundsServiceSpy = serviceSpy;

    TestBed.configureTestingModule({
      imports: [
        FoundsListComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: FoundsService, useValue: foundsServiceSpy }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FoundsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load and copy API funds to dataSource and filteredDataSource', () => {
    component.carregarFundos();

    expect(component.dataSource).toEqual([apiFundA, apiFundB]);
    expect(component.filteredDataSource).toEqual([apiFundA, apiFundB]);
  });

  it('should redirect to form page', () => {
    component.RedirectByForm();

    expect(routerSpy.navigate).toHaveBeenCalledWith(['forms-new-founds']);
  });

  it('should filter funds by search term', () => {
    component.dataSource = [apiFundA, apiFundB];
    component.searchTerm = 'fnd-b';

    component.atualizarFiltro();

    expect(component.filteredDataSource.length).toBe(1);
    expect(component.filteredDataSource[0].codigo).toBe('FND-B');
  });

  it('should return early when saveEditFundo is invalid', () => {
    component.editFormGroup.reset();

    component.saveEditFundo();

    expect(foundsServiceSpy.PatchFoundsByCode).not.toHaveBeenCalled();
  });

  it('should search locally before API call when code exists in dataSource', () => {
    component.dataSource = [apiFundA, apiFundB];

    component.filterFoundByCode('fnd-a');

    expect(foundsServiceSpy.getFoundsByCode).not.toHaveBeenCalled();
    expect(component.filteredDataSource).toEqual([apiFundA]);
  });

  it('should call API when code is not in local dataSource', () => {
    component.dataSource = [apiFundA];

    component.filterFoundByCode('fnd-b');

    expect(foundsServiceSpy.getFoundsByCode).toHaveBeenCalledWith('FND-B');
    expect(component.filteredDataSource).toEqual([apiFundB]);
  });

  it('should clear list and notify on search API error', () => {
    foundsServiceSpy.getFoundsByCode.and.returnValue(
      throwError(() => ({ status: 404, statusText: 'Not Found', message: 'Not Found' }))
    );
    component.dataSource = [];

    component.filterFoundByCode('nao-existe');

    expect(component.filteredDataSource).toEqual([]);
  });


});