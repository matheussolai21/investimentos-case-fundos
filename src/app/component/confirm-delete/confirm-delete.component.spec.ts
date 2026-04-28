import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDeleteComponent } from './confirm-delete.component';

describe('ConfirmDeleteComponent', () => {
  let component: ConfirmDeleteComponent;
  let fixture: ComponentFixture<ConfirmDeleteComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ConfirmDeleteComponent>>;

  beforeEach(waitForAsync(() => {
    dialogRefSpy = jasmine.createSpyObj<MatDialogRef<ConfirmDeleteComponent>>('MatDialogRef', ['close']);

    TestBed.configureTestingModule({
      imports: [ConfirmDeleteComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { nome: 'Fundo X', codigo: 'FND-X' } }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close dialog with true on confirm', () => {
    component.onConfirm();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });

  it('should close dialog with false on cancel', () => {
    component.onCancel();

    expect(dialogRefSpy.close).toHaveBeenCalledWith(false);
  });
});