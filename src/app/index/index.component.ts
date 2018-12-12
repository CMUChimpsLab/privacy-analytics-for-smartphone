import { Component, OnInit } from '@angular/core';
import { TrafficService } from '../traffic.service';
import * as _ from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { GetColorsFn } from '../support';
declare var d3: any;

@Component({
    selector: 'app-index',
    templateUrl: './index.component.html',
    styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
    availableTaxonomies;
    currentCriteria = 'apps';
    showHome = true;
    showSpecificTaxonomyDetails = false;
    showTypesOnly = false;
    activeTaxonomyId = null;
    activeTaxonomy;
    collapseHeader = false;
    constructor(
        private trafficService: TrafficService,
        private activatedRouter: ActivatedRoute
    ) { }
    ngOnInit() {
        this.trafficService.currentRoute.next('index');
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        this.activatedRouter.params.subscribe((data) => {
            this.activeTaxonomyId = null;
            if (!_.isEmpty(data['id'])) {
                const id = (data['id'] as string);
                if (id === 'types') {
                    this.showHome = true;
                    this.showSpecificTaxonomyDetails = false;
                } else {
                    this.showHome = false;
                    this.showSpecificTaxonomyDetails = true;
                    this.activeTaxonomyId = (data['id'] as string).toUpperCase();
                    this.activeTaxonomy = this.availableTaxonomies.find(x => x.name === this.activeTaxonomyId);
                    const internalColors = GetColorsFn(d3.color('#fff').hex(), d3.color('#f1f3f5').hex(), this.activeTaxonomy.taxonomies.length);
                    this.activeTaxonomy.taxonomies.forEach((x, i) => {
                        x.bgColor = internalColors(i);
                    });
                    setTimeout(() => {
                        this.trafficService.taxonomyChanged.next(this.activeTaxonomyId);
                    });
                }
            }
        });
    }
    setCurrentCriteria(criteria: string) {
        if (this.currentCriteria !== criteria) {
            this.trafficService.dashboardView.next(criteria);
            this.currentCriteria = criteria;
        }
    }
}