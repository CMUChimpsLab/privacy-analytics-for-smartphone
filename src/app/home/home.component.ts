import { Component, OnInit } from '@angular/core';
import { TrafficService } from '../traffic.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: [ './home.component.scss' ]
})
export class HomeComponent implements OnInit {
    taxonomies;
    currentCriteria = 'apps';
    constructor(
        private trafficService: TrafficService,
        private router: Router) {}
    ngOnInit () {
        this.taxonomies = this.trafficService.taxonomyStore;
        this.trafficService.currentRoute.next('home');
    }
    openTaxonomy (taxonomy) {
        this.router.navigate([`/index/${taxonomy.name}`]);
    }
    openTypes() {
        this.router.navigate([`/index/types`]);
    }
}