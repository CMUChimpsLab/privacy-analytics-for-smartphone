import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as Highcharts from 'highcharts';
import { COLORS } from "../../data";
import { TrafficService } from "../../traffic.service";
import { GetExtDataForTaxonomy, PieChartConfig } from "../support";
import * as _ from 'lodash';
declare let d3: any;

@Component({
    selector: 'app-taxonomy-detail',
    templateUrl: './taxonomy-detail.component.html',
    styleUrls: ['./taxonomy-detail.component.scss']
})
export class TaxonomyDetailComponent implements OnInit {
    Highcharts = Highcharts;
    appsPieChartOptions = null;
    showPieChart = false;
    @Input() parent = 'ID';
    @Input() child = 'GENERALID';
    taxonomyData = [];
    tableData = [];
    showTaxonomyChart = false;
    currentLabel = '';
    apps = [];
    hosts = [];
    sankeyHeight = 0;
    showAppsData = true;
    @Input() currentCriteria = 'apps';
    @Input() embedded = false;
    constructor(
        private activateRoute: ActivatedRoute,
        private router: Router,
        private trafficService: TrafficService
    ) { }
    ngOnInit() {
        if (!this.embedded) {
            this.activateRoute.queryParams.subscribe((params) => {
                this.parent = params['category'];
                if (this.parent) {
                    this.child = params['subcategory'];
                    if (params && params['criteria']) {
                        this.currentCriteria = params['criteria'];
                    }
                    if (this.child) {
                        // INNER TAXONOMY INFO
                        this.currentLabel = this.parent + ' - ' + this.child;
                        this.processData();
                    }
                }
            });
        } else {
            this.startProcess();
        }
    }
    startProcess() {
        if (this.parent && this.child && this.currentCriteria) {
            if (this.child) {
                // INNER TAXONOMY INFO
                this.currentLabel = this.parent + ' - ' + this.child;
                this.processData();
            }
        }
    }
    toggle(criteria) {
        if (this.currentCriteria !== criteria) {
            this.router.navigate(['/taxonomy/detail'], { queryParams: { 
                category: this.parent,
                subcategory: this.child,
                criteria: criteria, 
            }});
        }
    }
    processData() {
        let gradientColors = null;
        const availableTaxonomies = this.trafficService.taxonomyStore;
        const parentTaxonnomy = availableTaxonomies.find(x => x.name === this.parent);
        this.trafficService.getTaxonomyData(this.parent, this.child).subscribe((data) => {
            this.appsPieChartOptions = PieChartConfig;
            this.hosts = data.uniqueHosts.data;
            this.apps = data.uniqueApps.data;
            const collection = data.collections;
            let topAppsCollection = null;
            if (this.showAppsData) {
                topAppsCollection = collection.find(c => c.name === 'top-apps');
            } else {
                topAppsCollection = collection.find(c => c.name === 'top-hosts');
            }
            if (topAppsCollection) {
                const data = topAppsCollection.data.map((x, i) => {
                    let _color = COLORS[i];
                    return {
                        name: x.name,
                        y: x.count,
                        color: _color
                    }
                });
                this.appsPieChartOptions.series = [];
                this.appsPieChartOptions.series.push({
                    name: 'Apps',
                    colorByPoint: true,
                    data: data
                });
                setTimeout(() => {
                    this.showPieChart = true;
                });
            }
        });
    }
}