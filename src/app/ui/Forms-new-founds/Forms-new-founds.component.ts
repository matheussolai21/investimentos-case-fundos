import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from '../../component/header/header.component';
import { FooterComponent } from '../../component/footer/footer.component';
import { FoundsService } from '../../Services/founds.service';
import { Fundo } from '../../interfaces/fundos.interface';
import { NgxMaskDirective } from 'ngx-mask';
import { ValidatorsService } from '../../Services/validators.service';

@Component({
  selector: 'app-Forms-new-founds',
  templateUrl: './Forms-new-founds.component.html',
  styleUrls: ['./Forms-new-founds.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    HeaderComponent,
    FooterComponent,
    NgxMaskDirective
  ]
})
export class FormsNewFoundsComponent implements OnInit {

  fundoForm: FormGroup;
  loading = false;


  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private foundsService: FoundsService,
    private router: Router,
    public validatorsService: ValidatorsService

  ) {
    this.fundoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.maxLength(20)]],
      nome: ['', [Validators.required, Validators.maxLength(100)]],
      cnpj: ['', [Validators.required, Validators.maxLength(18)]],
      codigo_tipo: ['', [Validators.required]],
      patrimonio: ['', [Validators.required]]
    });
  }

  ngOnInit() {
  }


  onSubmit() {
    if (this.fundoForm.invalid) {
      this.snackBar.open('Preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
      return;
    }

    this.loading = true;

    const fundoData: Fundo = {
      codigo: this.fundoForm.value.codigo, 
      nome: this.fundoForm.value.nome.trim(),
      cnpj: this.validatorsService.formatCNPJ(this.fundoForm.value.cnpj.trim()),
      codigo_tipo: Number(this.fundoForm.value.codigo_tipo),
      patrimonio: Number(this.fundoForm.value.patrimonio)
    };

    this.AddFounds(fundoData) 


  }


  cancelar() {
    this.router.navigate(['found-list']);
  }

  AddFounds(fundo: Fundo) { 
    this.foundsService.PostFounds(fundo).subscribe({
      next: (response) => {
        console.log('Sucesso:', response);
        this.snackBar.open('Fundo criado com sucesso!', 'Fechar', { duration: 3000 });
        setTimeout(() => this.router.navigate(['/found-list']), 2000);
      },
      error: (error) => {
        console.error('Erro:', error);
        this.loading = false;
        this.snackBar.open(error.error?.error || 'Erro ao criar fundo');
      }
    });
  }

}
