import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { HighchartsChartModule } from 'highcharts-angular';
import { AppRoutingModule }     from './app-routing.module';
import { AppComponent }         from './app.component';
import { HostDetailComponent }  from './host-detail/host-detail.component';
import { TrafficService }          from './traffic.service';
import { PLATFORM_ID, APP_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TaxonomyComponent } from './taxonomy/taxonomy.component';
import { TaxonomyDetailComponent } from './taxonomy/taxonomy-detail/taxonomy-detail.component';
import { DonutChartComponent } from './charts/donut-chart/donut-chart.component';
import { BarChartComponent } from './charts/bar-chart/bar-chart.component';
import { AppDetailsComponent } from './charts/app-details/app-details.component';
import { ListCardComponent } from './charts/list-card/list-card.component';
import { TaxonomyItemDetailsComponent } from './charts/taxonomy-details/taxonomy-details.component';
import { SearchComponent } from './search/search.component';
import { NgbTooltipModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Top10ListComponent } from './charts/top-10-list/top-10-list.component';
import { Top10AppsComponent } from './charts/top-10-apps/top-10-apps.component';
import { SankeyComponent } from './charts/sankey/sankey.component';
import { AppListDetailsComponent } from './charts/app-list-details/app-list-details.component';
import { IndexComponent } from './index/index.component';
import { SpecificTaxonomyComponent } from './specific-taxonomy/specific-taxonomy.component';
import { AllTaxonomiesComponent } from './all-taxonomies/all-taxonomies.component';
import { HomeComponent } from './home/home.component';
import { AllAppsComponent } from './all-apps/all-apps.component';
import { PrivacyRatingComponent } from './privacy-rating/privacy-rating.component';
import { ColumnChartComponent } from './charts/column-chart/column-chart.component';
import { AppCardListComponent } from './charts/app-card-list/app-card-list.component';
import { FiltersPaneComponent } from './filters-pane/filters-pane.component';

@NgModule({
  imports: [
    BrowserModule.withServerTransition({ appId: 'tour-of-heroes' }),
    FormsModule,
    AppRoutingModule,
    HttpClientModule,
    HighchartsChartModule,
    NgbTooltipModule,
    NgbPopoverModule
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    AllTaxonomiesComponent,
    TaxonomyComponent,
    TaxonomyDetailComponent,
    HostDetailComponent,
    DonutChartComponent,
    BarChartComponent,
    AppDetailsComponent,
    ListCardComponent,
    TaxonomyItemDetailsComponent,
    SearchComponent,
    Top10ListComponent,
    Top10AppsComponent,
    SankeyComponent,
    AppListDetailsComponent,
    IndexComponent,
    SpecificTaxonomyComponent,
    AllAppsComponent,
    PrivacyRatingComponent,
    ColumnChartComponent,
    AppCardListComponent,
    FiltersPaneComponent
  ],
  providers: [ TrafficService ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(APP_ID) private appId: string) {
    const platform = isPlatformBrowser(platformId) ?
      'in the browser' : 'on the server';
  }
}
