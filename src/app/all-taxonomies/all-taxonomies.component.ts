import { Component, OnInit, Input } from '@angular/core';
import { TrafficService } from '../traffic.service';
import * as _ from 'lodash';
import * as Highcharts from 'highcharts';
// import { SAMPLE_TAXONOMIES } from './transform';
import { Router, ActivatedRoute } from '@angular/router';
import { GetDashboardDataTransformForUpperTaxonomies, GetPlainBarTransformForUpperTaxonomy, GetStackedBarTransfromForInnerTaxonomy } from './support';
import { PlainBarConfig, StackedChartOptions } from '../support';

@Component({
    selector: 'app-all-taxonomies',
    templateUrl: './all-taxonomies.component.html',
    styleUrls: ['./all-taxonomies.component.scss']
})
export class AllTaxonomiesComponent implements OnInit {

    Highcharts = Highcharts;
    upperTaxonomyChartOptions: any = {};
    allTaxonomyChartOptions: any = {};
    @Input() showInnerTaxonomies = false;
    @Input() currentCriteria = 'apps';
    @Input() showHeader = true;
    taxonomyList = [];
    tableData = [];
    private availableTaxonomies = [];
    taxonomyFilterShown = false;
    private taxonomyData = null;
    showChart = false;

    private usableTaxonomyData = null;


    constructor(
        private trafficService: TrafficService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        if (this.showHeader) {
            this.activatedRoute.queryParams.subscribe((params) => {
                this.showInnerTaxonomies = false;
                this.showChart = false;
                setTimeout(() => {
                    this.trafficService.getDashboardData().subscribe((data) => {
                        this.usableTaxonomyData = data;
                        if (params && params['showChildren']) {
                            this.showInnerTaxonomies = true;
                        }
                        if (params && params['criteria']) {
                            this.currentCriteria = params['criteria'];
                        }
                        this.onToggle();
                        if (params && params['showChildren']) {
                            this.showInnerTaxonomies = true;
                        }
                        this.onToggle();
                    });
                });
            });
        } else {
            this.showChart = false;
            setTimeout(() => {
                this.trafficService.getDashboardData().subscribe((data) => {
                    this.usableTaxonomyData = data;
                    this.onToggle();
                });
            });
        }
        this.trafficService.dashboardView$.subscribe((criteria: string) => {
            if (this.currentCriteria !== criteria) {
                this.showChart = false;
                setTimeout(() => {
                    this.onToggle();
                });
            }
        });
    }

    processForAvaialableTaxonomies() {
        if (!this.showInnerTaxonomies) {
            this.availableTaxonomies.forEach(x => {
                const obj: any = {
                    name: x.name,
                    color: x.color
                }
                this.taxonomyList.push(obj);
            })
        } else {
            this.availableTaxonomies.forEach(x => {
                const temp = this.taxonomyData.find(y => x.name === y.name);
                x.taxonomies.forEach(y => {
                    const obj: any = {
                        name: y.name,
                        color: temp.color
                    };
                    this.taxonomyList.push(obj);
                });
            })
        }
    }

    onToggle() {
        this.showChart = false;
        this.taxonomyList = [];
        this.showOnlyUpperLevel();
        if (this.showInnerTaxonomies) {
            this.showInnerLevels();
        }
        this.taxonomyFilterShown = false;
        this.processForAvaialableTaxonomies();
    }

    setCurrentCriteria(criteria) {
        if (this.currentCriteria !== criteria) {
            this.showChart = false;
            setTimeout(() => {
                this.updateCurrentCriteria(criteria);
            });
        }
    }

    showOnlyUpperLevel() {
        this.upperTaxonomyChartOptions = PlainBarConfig;
        this.taxonomyData = GetDashboardDataTransformForUpperTaxonomies(this.availableTaxonomies, this.usableTaxonomyData);
        const data = GetPlainBarTransformForUpperTaxonomy(this.taxonomyData, this.currentCriteria);
        this.upperTaxonomyChartOptions.xAxis.labels.formatter = function () {
            const pos = this.pos;
            return data.data.map(x => x.name)[pos];
        };
        this.upperTaxonomyChartOptions.series = [];
        (data as any).events = {
            click: (e) => {
                if (e.point) {
                    const options = e.point.options;
                    if (options) {
                        if (options.name) {
                            // this.router.navigate(['/taxonomy'], { queryParams: { category: options.name } });
                        }
                    }
                }
            }
        };
        (data as any).className = 'cursor-pointer';
        this.upperTaxonomyChartOptions.series.push(data);
        this.tableData = data.data.map(x => {
            return {
                color: x.color,
                name: x.name,
                value: x.y,
                icon: x._obj['icon'],
                outlineIcon: `outline-${x._obj['icon']}`
            }
        });
        this.showChart = true;
    }
    showInnerLevels() {
        const data = GetStackedBarTransfromForInnerTaxonomy(this.taxonomyData, this.currentCriteria);
        this.allTaxonomyChartOptions = StackedChartOptions;
        this.allTaxonomyChartOptions.xAxis.categories = this.taxonomyData.map(x => x.name)
        this.allTaxonomyChartOptions.series = [];
        const router = this.router;
        const service = this.trafficService;
        (data as Array<any>).forEach(x => {
            const onClickListener = (function () {
                const taxonomy = x;
                return function (e) {
                    if (e.point) {
                        router.navigate([`/index/${(taxonomy.upper_taxonomy as string).toLowerCase()}`]);
                    }
                }
            })();
            x.events = {
                click: onClickListener,
                className: 'cursor-pointer'
            };
        })
        this.allTaxonomyChartOptions.series = data;
        this.tableData = [];
        this.taxonomyData.forEach((x, i) => {
            x.taxonomies.forEach((y, j) => {
                let value = 0;
                switch (this.currentCriteria) {
                    case 'apps': { value = y.appsCount; break; }
                    case 'hosts': { value = y.hostsCount; break; }
                    case 'requests': { value = y.requestsCount; break; }
                }
                this.tableData.push({
                    showParent: j === 0,
                    color: y.color,
                    parent: x.name,
                    name: y.name,
                    value: value,
                    borderBottom: j === x.taxonomies.length - 1 && i !== this.taxonomyData.length - 1,
                    start: j === 0,
                    end: j === x.taxonomies.length - 1,
                    outlineIcon: `outline-${y.icon}`,
                    icon: y.icon
                });
            });
        });
        this.showChart = true;
    }

    toggleDashboard() {
        this.showInnerTaxonomies = !this.showInnerTaxonomies;
        this.onToggle();
    }
    showChildren() {
        if (!this.showInnerTaxonomies) {
            this.router.navigate(['/dashboard'], { queryParams: { showChildren: true, criteria: this.currentCriteria } });
        } else {
            this.router.navigate(['/dashboard'], { queryParams: { criteria: this.currentCriteria } });
        }
    }
    updateCurrentCriteria(criteria) {
        if (!this.showInnerTaxonomies) {
            this.router.navigate(['/dashboard'], { queryParams: { criteria: criteria } });
        } else {
            this.router.navigate(['/dashboard'], { queryParams: { showChildren: true, criteria: criteria } });
        }
    }
}