import { HeaderComponent } from "../../component/header/header.component";
import { FooterComponent } from "../../component/footer/footer.component";
import { Component, HostListener, Inject, OnDestroy, OnInit, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule, DOCUMENT } from "@angular/common";
import { Fundo } from "../../interfaces/fundos.interface";
import { FoundsService } from "../../Services/founds.service";
import { Route, Router } from "@angular/router";
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ConfirmDeleteComponent } from "../../component/confirm-delete/confirm-delete.component";

@Component({
  selector: 'app-founds-list',
  templateUrl: './founds-list.component.html',
  styleUrls: ['./founds-list.component.css'],
  standalone: true,
  imports: [
    HeaderComponent,
    FooterComponent,
    ConfirmDeleteComponent,
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule
  ]
})
export class FoundsListComponent implements OnInit, OnDestroy {

  displayedColumns: string[] = ['codigo', 'nome', 'cnpj', 'codigo_tipo', 'patrimonio', 'acoes'];
  dataSource: Fundo[] = [];
  filteredDataSource: Fundo[] = [];
  searchTerm: string = '';
  loading = false;
  showEditModal = false;
  editLoading = false;
  editingOriginalCode = '';
  editFormGroup: FormGroup;

  // Paginação
  pageSize = 10;
  pageIndex = 0;
  pageSizeOptions: number[] = [5, 10, 25, 50];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private foundsService: FoundsService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private formBuilder: FormBuilder,
  ) {
    this.editFormGroup = this.formBuilder.group({
      codigo: [{ value: '', disabled: true }],
      nome: ['', Validators.required],
      cnpj: ['', Validators.required],
      codigo_tipo: ['', Validators.required],
      patrimonio: ['', [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.carregarFundos();
  }

  ngOnDestroy(): void {
    this.enableBodyScroll();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.showEditModal) {
      this.closeEditModal();
    }
  }
carregarFundos() {
  this.foundsService.getFounds().subscribe({
    next: (fundos: Fundo[]) => {
      // Armazena apenas na dataSource do componente
      this.dataSource = Array.isArray(fundos) ? fundos : [];
      
      // Atualiza o filteredDataSource para exibição
      this.filteredDataSource = [...this.dataSource];
      
      console.log('Lista carregada da API com sucesso:', this.dataSource.length, 'fundos');
      
      // Aplica filtro se existir
      this.atualizarFiltro();
    },
    error: (error: unknown) => {
      console.error('❌ Erro ao carregar fundos:', error);
      this.dataSource = [];
      this.filteredDataSource = [];
      this.atualizarFiltro();
      
      // Opcional: mostrar mensagem para o usuário
      this.snackBar?.open('Erro ao carregar lista de fundos', 'Fechar', { duration: 3000 });
    }
  });
}
  atualizarFiltro() {
    if (!this.searchTerm) {
      this.filteredDataSource = [...this.dataSource];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredDataSource = this.dataSource.filter(fundo =>
        fundo.codigo.toLowerCase().includes(term) ||
        fundo.nome.toLowerCase().includes(term) ||
        fundo.cnpj.includes(term) ||
        fundo.codigo_tipo.toString().includes(term)
      );
    }
  }


  // Paginação
  get paginatedData(): Fundo[] {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredDataSource.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  get totalRecords(): number {
    return this.filteredDataSource.length;
  }

  // Ações
  RedirectByForm() { // redirecionar pra tela nova
    this.snackBar.open('Abrindo formulário para adicionar fundo...', 'Fechar', { duration: 2000 });
    this.router.navigate(['forms-new-founds']);
  }

filterFoundByCode(code: string) {
  if (!code || code.trim() === '') {
    this.carregarFundos();
    return;
  }

  console.log(' Buscando código:', code);
  this.loading = true;
  
  const codigoBusca = code.trim().toUpperCase();
  
  // Primeiro tenta encontrar localmente
  const fundoLocal = this.dataSource.find(fundo => 
    fundo.codigo.toUpperCase() === codigoBusca
  );
  
  if (fundoLocal) {
    console.log('Fundo encontrado localmente:', fundoLocal);
    this.filteredDataSource = [fundoLocal];
    this.loading = false;
    this.snackBar.open(`Fundo ${fundoLocal.codigo} encontrado!`, 'Fechar', { duration: 3000 });
    return;
  }
  
  // Se não encontrar localmente, busca na API
  this.foundsService.getFoundsByCode(codigoBusca).subscribe({
    next: (fundo) => {
      console.log('Fundo encontrado na API:', fundo);
      this.dataSource = [fundo];
      this.filteredDataSource = [fundo];
      this.loading = false;
      this.snackBar.open(`Fundo ${fundo.codigo} - ${fundo.nome} encontrado!`, 'Fechar', { duration: 3000 });
    },
    error: (erro) => {
      console.error('❌ Erro:', erro.status, erro.statusText);
      this.filteredDataSource = [];
      this.loading = false;
      
      if (erro.status === 404) {
        this.snackBar.open(` Fundo com código ${code} não encontrado`, 'Fechar', { duration: 4000 });
      } else {
        this.snackBar.open(`❌Erro na busca: ${erro.message}`, 'Fechar', { duration: 4000 });
      }
    }
  });
}


  deleteFound(fundo: Fundo): void {
  const dialogRef = this.dialog.open(ConfirmDeleteComponent, {
    width: '400px',
    data: { 
      nome: fundo.nome,
      codigo: fundo.codigo
    }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      // ✅ Chama a API para deletar
      this.foundsService.DeleteFoundsByCode(fundo.codigo).subscribe({
        next: () => {
          // Remove da lista local após sucesso na API
          this.dataSource = this.dataSource.filter(f => f.codigo !== fundo.codigo);
          this.atualizarFiltro();
          this.snackBar.open(`✅ Fundo ${fundo.nome} excluído com sucesso!`, 'Fechar', { 
            duration: 3000,
            panelClass: ['success-snackbar']
          });
        },
        error: (error) => {
          console.error('Erro ao excluir:', error);
          let mensagemErro = 'Erro ao excluir o fundo';
          
          if (error.status === 404) {
            mensagemErro = `Fundo ${fundo.codigo} não encontrado`;
          } else if (error.error?.error) {
            mensagemErro = error.error.error;
          }
          
          this.snackBar.open(`❌ ${mensagemErro}`, 'Fechar', { 
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  });
}


  formatHeritage(valor: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  }

   editFound(fundo: Fundo) {
    this.editingOriginalCode = fundo.codigo;
    this.editFormGroup.patchValue({
      codigo: fundo.codigo,
      nome: fundo.nome,
      cnpj: fundo.cnpj,
      codigo_tipo: fundo.codigo_tipo,
      patrimonio: Number(fundo.patrimonio)
    });
    this.showEditModal = true;
    this.disableBodyScroll();
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editLoading = false;
    this.enableBodyScroll();
  }

  private disableBodyScroll(): void {
    this.document.body.style.overflow = 'hidden';
  }

  private enableBodyScroll(): void {
    this.document.body.style.overflow = 'auto';
  }

  saveEditFundo(): void {
  if (this.editFormGroup.invalid) return;
  
  this.editLoading = true;
  const formValue = this.editFormGroup.getRawValue();
  
  // Prepara apenas o patrimônio (se for o caso)
  const updates = {
    patrimonio: Number(formValue.patrimonio),
    nome: formValue.nome.trim(),
    cnpj: formValue.cnpj.trim(),
  };
  
  this.foundsService.PatchFoundsByCode(this.editingOriginalCode, updates).subscribe({
    next: (response) => {
      console.log('✅ Patrimônio atualizado:', response);
      this.editLoading = false;
      this.carregarFundos();
      this.closeEditModal();
    },
    error: (error) => {
      console.error('❌ Erro:', error);
      this.editLoading = false;
    }
  });
}

}