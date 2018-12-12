import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GetDummyTaxonomyData, GetPlainBarTransformForTaxonomy, GetDashboardDataForUpperTaxonomy } from "./support";
import { TrafficService } from "../traffic.service";
import * as Highcharts from 'highcharts';
import { PlainBarConfig } from "../support";
declare let d3: any;

@Component({
    selector: 'app-taxonomy',
    templateUrl: './taxonomy.component.html',
    styleUrls: ['./taxonomy.component.scss']
})
export class TaxonomyComponent implements OnInit {
    Highcharts = Highcharts;
    private parent;
    private child;
    taxonomyChartOptions = null;
    private availableTaxonomies = [];
    taxonomyData = [];
    tableData = [];
    showTaxonomyChart = false;
    currentLabel = '';
    currentCriteria = 'apps';
    constructor(
        private activateRoute: ActivatedRoute,
        private router: Router,
        private trafficService: TrafficService
    ) { }
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        this.activateRoute.queryParams.subscribe((params) => {
            this.parent = params['category'];
            if (params && params['criteria']) {
                this.currentCriteria = params['criteria'];
            }
            this.showTaxonomyChart = false;
            setTimeout(() => {
                if (this.parent) {
                    this.currentLabel = this.parent;
                    this.getUpperTaxonomyDetails();
                }
            });
        });
    }

    setCurrentCriteria(criteria) {
        if (this.currentCriteria !== criteria) {
            setTimeout(() => {
                this.updateCurrentCriteria(criteria);
            });
        }
    }

    getUpperTaxonomyDetails() {
        const taxonomy = this.availableTaxonomies.find(x => x.name === this.parent);
        if (taxonomy) {
            const childTaxonomies = taxonomy.taxonomies;
            this.trafficService.getDashboardData(this.parent).subscribe((result) => {
                this.taxonomyData = [];
                (childTaxonomies as Array<any>).forEach(t => {
                    const data = result.data.find(y => y.name === t.name);
                    if (data) {
                        this.taxonomyData.push({
                            ...t,
                            data: data
                        });
                    }
                })
                this.processForPlainBar();
            });
        }
    }
    processForPlainBar() {
        this.taxonomyChartOptions = PlainBarConfig;
        const data = Object.assign({}, GetPlainBarTransformForTaxonomy(this.taxonomyData, this.currentCriteria));
        this.taxonomyChartOptions.xAxis.labels.formatter = function () {
            const pos = this.pos;
            return data.data.map(x => x.name)[pos];
        };
        this.taxonomyChartOptions.series = [];
        (data as any).events = {
            click: (e) => {
                if (e.point) {
                    const options = e.point.options;
                    if (options) {
                        if (options.name) {
                            this.router.navigate([`/taxonomy/detail`], {
                                queryParams: {
                                    category: this.parent,
                                    subcategory: options.name
                                }
                            });
                        }
                    }
                }
            }
        };
        this.taxonomyChartOptions.series.push(data);
        this.showTaxonomyChart = true;
        this.tableData = [];
        this.tableData = data.data.map(x => {
            return {
                color: x.color,
                name: x.name,
                value: x.y,
                icon: x['_obj'].icon,
                outlineIcon: `outline-${x['_obj'].icon}`
            }
        });
    }
    updateCurrentCriteria(criteria) {
        this.router.navigate(['/taxonomy'], { queryParams: { criteria: criteria, category: this.parent } });
    }
}
