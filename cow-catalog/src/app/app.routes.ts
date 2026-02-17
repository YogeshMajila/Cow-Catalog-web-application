import { Routes } from '@angular/router';
import { CowListComponent } from './components/cow-list/cow-list.component';
import { CowDetailComponent } from './components/cow-detail/cow-detail.component';
import { CowFormComponent } from './components/cow-form/cow-form.component';

export const routes: Routes = [
    { path: '', component: CowListComponent },
    { path: 'add', component: CowFormComponent },
    { path: 'cow/:tag', component: CowDetailComponent },
    { path: '**', redirectTo: '' }
];
