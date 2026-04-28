import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient } from '@angular/common/http';
import { Fundo } from '../interfaces/fundos.interface';


@Injectable({
  providedIn: 'root'
})
export class FoundsService {

constructor(private http: HttpClient ) { }
 private apiUrl: string = 'http://localhost:3000'

 getFounds(): Observable<any> {
   return this.http.get<Fundo[]>( this.apiUrl + '/fundos');
 }

 getFoundsByCode(code: string): Observable<any> {
  const url = `${this.apiUrl}/fundos/${code}`;
  console.log(' Chamando:', url);
  return this.http.get(url);
}

  PostFounds(Founds: Fundo): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/fundos`, Founds);
  }


  DeleteFoundsByCode(code: string): Observable<any> {
    const url = `${this.apiUrl}/fundos/${code}`;
    return this.http.delete(url);
  }

  PatchFoundsByCode(code: string, updates: Partial<Fundo>): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/fundos/${code}`, updates);
  }

   getTypeFounds(): Observable<any> {
   return this.http.get('/tipos-fundo');
 }
}
