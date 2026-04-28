import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Auth } from '../interfaces/auth.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

constructor(private http: HttpClient) { }
 private apiUrl: string = 'http://localhost:3000'

  PostLogin(auth: Auth): Observable<any> {
    console.log(' Enviando para:', `${this.apiUrl}/login`);
      return this.http.post(`${this.apiUrl}/login`, auth);

  }

}
