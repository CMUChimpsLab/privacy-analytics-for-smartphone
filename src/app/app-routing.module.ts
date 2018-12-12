import { NgModule }             from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { HostDetailComponent }  from './host-detail/host-detail.component';
import { TaxonomyComponent } from './taxonomy/taxonomy.component';
import { TaxonomyDetailComponent } from './taxonomy/taxonomy-detail/taxonomy-detail.component';
import { SearchComponent } from './search/search.component';
import { IndexComponent } from './index/index.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'index', component: IndexComponent },
  { path: 'index/:id', component: IndexComponent },
  { path: 'host/:id', component: HostDetailComponent },
  { path: 'taxonomy', component: TaxonomyComponent },
  { path: 'taxonomy/detail', component: TaxonomyDetailComponent },
  { path: 'search', component: SearchComponent },
  { path: 'apps', component: SearchComponent },
  { path: 'index', component: IndexComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {}
