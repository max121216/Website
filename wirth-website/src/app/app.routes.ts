import { Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { FraktaleComponent } from './components/fraktale/fraktale.component';

export const routes: Routes = [
  { path: '', component: AboutComponent }, // Standard-Komponente (About)
  { path: 'fractals', component: FraktaleComponent } // Fraktal-Seite
];
