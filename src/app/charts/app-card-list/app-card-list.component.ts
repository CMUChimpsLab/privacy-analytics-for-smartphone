import { Component, Input, OnInit } from '@angular/core';
import { DashboardDataSampled } from '../../specific-taxonomy/sample';
import { SearchPageResult, SearchPageItemRelationShips, SankeyConfig } from '../../search/search';
import { TrafficService } from '../../traffic.service';
import  * as _  from 'lodash';

@Component({
    selector: 'app-card-list',
    templateUrl: 'app-card-list.component.html',
    styleUrls: [ './app-card-list.component.scss' ]
})
export class AppCardListComponent implements OnInit {
    @Input() data = DashboardDataSampled.ID.topRatedApps;
    title = 'Top rated apps sending phone data';
    sankeyDataRef;
    availableTaxonomies = [];
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
    }
    showData(app) {
        this.trafficService.appDetails.next({
            package: app.package
        });
    }
}
