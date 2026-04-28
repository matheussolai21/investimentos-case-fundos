import { Routes } from '@angular/router';
import { LoginComponent } from './ui/login/login.component';
import { FoundsListComponent } from './ui/founds-list/founds-list.component';
import { FormsNewFoundsComponent } from './ui/Forms-new-founds/Forms-new-founds.component';

export const routes: Routes = [
  { 
    path: '', 
    redirectTo: 'login', 
    pathMatch: 'full' 
  },
  { 
    path: 'login', 
    component: LoginComponent 
  },
  {
    path: 'found-list',
    component: FoundsListComponent
  },
    {
    path: 'forms-new-founds',
    component: FormsNewFoundsComponent
  }

];
