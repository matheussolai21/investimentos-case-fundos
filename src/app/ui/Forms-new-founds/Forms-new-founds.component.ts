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

export interface TipoFundo {
  codigo: number;
  nome: string;
  descricao: string;
}

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
    FooterComponent
    ]
})
export class FormsNewFoundsComponent implements OnInit {
 
  fundoForm: FormGroup;
  loading = false;
  tiposFundo: TipoFundo[] = [];


  constructor(
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private foundsService: FoundsService,
    private router: Router

  ) { 
        this.fundoForm = this.fb.group({
      codigo: ['', [Validators.required, Validators.minLength(3)]],    
      nome: ['', [Validators.required, Validators.minLength(3)]],
      cnpj: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/)]],
      codigo_tipo: ['', Validators.required],
      patrimonio: ['', [Validators.required, Validators.min(0.01)]]
    });
  }

  

  ngOnInit() {
  }

  carregarTiposFundo() {
    this.foundsService.getFounds().subscribe({  // fazer lista dos codigos de investimento
      next: (fundos) => {
        console.log(fundos);
      },
      error: (error) => {
        console.error('Erro ao carregar tipos:', error);
        this.snackBar.open('Erro ao carregar tipos de fundo', 'Fechar', { duration: 3000 });
      }
    });
  }

onSubmit() {
  if (this.fundoForm.invalid) {
    this.snackBar.open('Preencha todos os campos corretamente', 'Fechar', { duration: 3000 });
    return;
  }

  this.loading = true;

  const cnpjLimpo = this.fundoForm.value.cnpj.replace(/\D/g, '');
  
  const fundoData: Fundo = {
    codigo: this.fundoForm.value.codigo, // Gerar código único ou usar um serviço para isso
    nome: this.fundoForm.value.nome.trim(),
    cnpj: this.fundoForm.value.cnpj.trim(),
    codigo_tipo: Number(this.fundoForm.value.codigo_tipo),
    patrimonio: Number(this.fundoForm.value.patrimonio)
  };

  this.AddFounds(fundoData) // inserir no component da proxima pagina
    

  this.snackBar.open(`Fundo ${fundoData.codigo} salvo com sucesso!`, 'Fechar', { duration: 3000 });
  this.router.navigate(['/found-list']);
}


  cancelar() {
    this.router.navigate(['found-list']);
  }

  AddFounds(fundo: Fundo) {  // inserir no component da proxima pagina
      this.foundsService.PostFounds(fundo).subscribe({
        next: (response) => {
          console.log('Sucesso:', response);
          this.snackBar.open('Fundo criado com sucesso!', 'Fechar', { duration: 3000 });
          setTimeout(() => this.router.navigate(['/found-list']), 2000);
        },
        error: (error) => {
          console.error('Erro:', error);
          this.snackBar.open(error.error?.error || 'Erro ao criar fundo', 'Fechar', { duration: 5000 });
        }
      });
  
      // this.dialog.open(DialogAdicionarFundoComponent);
  }
  
}
