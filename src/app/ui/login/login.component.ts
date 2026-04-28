import { Component, OnInit } from '@angular/core';
import {ChangeDetectionStrategy, signal} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import { FooterComponent } from '../../component/footer/footer.component';
import { HeaderComponent } from '../../component/header/header.component';
import { Auth, AuthResponse } from '../../interfaces/auth.interface';
import { AuthService } from '../../Services/auth.service';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [    FooterComponent, 
    HeaderComponent, 
    MatFormFieldModule, 
    MatInputModule, 
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    ReactiveFormsModule,
  MatProgressSpinnerModule],

  changeDetection: ChangeDetectionStrategy.OnPush,

})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  hide = signal(true);
  loading = signal(false);

  constructor(
    private authService: AuthService,
    private  router: Router,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,

  ) { 
       this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

   ngOnInit() {
   }
   
  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
   }

 Login(auth: Auth): void {
    this.loading.set(true);
    
    this.authService.PostLogin(auth).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login realizado com sucesso:', response);
        
        // Salvar token no localStorage
        if (response.token) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.username));
        }
        
        this.snackBar.open('Login realizado com sucesso!', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        
        // Redirecionar para dashboard ou lista de fundos
        this.router.navigate(['/found-list']);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Erro no login:', error);
        
        let mensagemErro = 'Erro ao realizar login';
        if (error.status === 401) {
          mensagemErro = 'Usuário ou senha inválidos';
        } else if (error.error?.error) {
          mensagemErro = error.error.error;
        }
        
        this.snackBar.open(mensagemErro, 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
        
        this.loading.set(false);
      }
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.snackBar.open('Preencha usuário e senha', 'Fechar', { duration: 3000 });
      return;
    }

    const auth: Auth = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.Login(auth);
  }

  // Método para limpar formulário
  limparFormulario(): void {
    this.loginForm.reset();
  }

}
