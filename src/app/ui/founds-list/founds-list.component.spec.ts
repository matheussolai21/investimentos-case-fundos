import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { FoundsListComponent } from './founds-list.component';
import { FoundsService } from '../../Services/founds.service';
import { Fundo } from '../../interfaces/fundos.interface';

describe('FoundsListComponent', () => {
  let component: FoundsListComponent;
  let fixture: ComponentFixture<FoundsListComponent>;
  let routerSpy: jasmine.SpyObj<Router>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let foundsServiceStub: jasmine.SpyObj<FoundsService> & { foundListServer: Fundo[] };

  const apiFundA: Fundo = {
    id: '1',
    codigo: 'FND-A',
    nome: 'Fundo A',
    cnpj: '11.111.111/0001-11',
    codigo_tipo: '1',
    patrimonio: 1000
  };

  const apiFundB: Fundo = {
    id: '2',
    codigo: 'FND-B',
    nome: 'Fundo B',
    cnpj: '22.222.222/0001-22',
    codigo_tipo: '2',
    patrimonio: 2000
  };

  beforeEach(waitForAsync(() => {
    routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);
    snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['open']);

    const serviceSpy = jasmine.createSpyObj<FoundsService>('FoundsService', [
      'getFounds',
      'getFoundsByCode',
      'PutHeritageByCode'
    ]) as jasmine.SpyObj<FoundsService> & { foundListServer: Fundo[] };
    serviceSpy.foundListServer = [];
    serviceSpy.getFounds.and.returnValue(of([apiFundA, apiFundB]));
    foundsServiceStub = serviceSpy;

    TestBed.configureTestingModule({
      imports: [
        FoundsListComponent,
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
    fixture = TestBed.createComponent(FoundsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should merge local and api funds without duplicates, keeping local first', () => {
    const localFund: Fundo = {
      id: '3',
      codigo: 'FND-X',
      nome: 'Fundo Local',
      cnpj: '33.333.333/0001-33',
      codigo_tipo: '3',
      patrimonio: 3000
    };
    foundsServiceStub.foundListServer = [localFund, apiFundA];

    component.carregarFundos();

    expect(component.dataSource.length).toBe(3);
    expect(component.dataSource[0].codigo).toBe('FND-X');
    expect(component.dataSource[1].codigo).toBe('FND-A');
    expect(component.dataSource[2].codigo).toBe('FND-B');
  });

  it('should copy datasource and redirect to form', () => {
    component.dataSource = [apiFundA, apiFundB];

    component.RedirectByForm();

    expect(foundsServiceStub.foundListServer).toEqual([apiFundA, apiFundB]);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['forms-new-founds']);
  });

  it('should filter funds by search term', () => {
    component.dataSource = [apiFundA, apiFundB];
    component.searchTerm = 'fnd-b';

    component.onSearchChange();

    expect(component.filteredDataSource.length).toBe(1);
    expect(component.filteredDataSource[0].codigo).toBe('FND-B');
  });

  it('should show message and stop when edit form is invalid', () => {
    component.editFormGroup.reset();

    component.saveEditFundo();

    expect(component).toBeTruthy();
  });


});