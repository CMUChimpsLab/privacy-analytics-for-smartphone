import { Component, OnInit, Input } from '@angular/core';
import { TrafficService } from '../traffic.service';
import * as _ from 'lodash';
import { DomSanitizer } from '@angular/platform-browser';
import { PhoneDashboardData, DashboardDataSampled } from './sample';
import { GetColorsFn } from '../support';
import { Router } from '@angular/router';
declare var d3: any;

@Component({
    selector: 'app-specific-taxonomy',
    templateUrl: './specific-taxonomy.component.html',
    styleUrls: ['./specific-taxonomy.component.scss']
})
export class SpecificTaxonomyComponent implements OnInit {
    title = 'Tour of Heroes';
    availableTaxonomies;
    appsCollection = [];
    hostsCollection = [];
    requestsCollection = [];
    locationNetworkData;
    accountContactsData;
    microphoneBatteryData;
    calendarListData;
    deviceOnlyNumbers;
    appsWithPermissions;
    currentCriteria = 'apps';
    showInnerTaxonomies = true;
    dashboardData = {
        combinations: [],
        topInstalledApps: null,
        topRatedApps: null,
        ratingDistribution: null,
        categoryDistribution: null
    };
    showAllTiles = true;
    loading = true;
    @Input() activeTaxonomyId;
    activeTaxonomy;
    activeTaxonomyLabel;
    privacyGradeRatings = [
        { id: 'A+', label: 'Best', color: '#000' },
        { id: 'A', label: 'Excellent', color: '#000' },
        { id: 'B', label: 'Good', color: '#000' },
        { id: 'C', label: 'Fair', color: '#000' },
        { id: 'D', label: 'Poor', color: '#000' },
        { id: '-', label: 'Unknown', color: '#000' }
    ];
    showAppSpreader = false;
    constructor(
        private trafficService: TrafficService, private sanitizer: DomSanitizer,
        private router: Router
        ) { }
    ngOnInit() {
        // this.chnageData();
        this.trafficService.taxonomyChanged$.subscribe(() => {
            this.showAppSpreader = false;
            this.chnageData();
        });
    }
    chnageData() {
        this.loading = true;
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        const taxonomy = this.availableTaxonomies.find(x => x.name === this.activeTaxonomyId);
        if (taxonomy) {
            this.activeTaxonomy = taxonomy;
            this.showAllTiles = this.activeTaxonomyId !== 'ID';
            this.activeTaxonomyLabel = taxonomy.label;
            this.trafficService.getJelloApiData(this.activeTaxonomy.name).subscribe((data) => {
                setTimeout(() => {
                    this.process(data);
                    setTimeout(() => {
                        this.loading = false;
                    }, 100)
                }, 100);
            });
        }
    }
    process(dashboardData) {
        // const dashboardData = DashboardDataSampled[this.activeTaxonomyId];
        this.dashboardData.combinations = [];
        if (dashboardData.distribution && this.activeTaxonomyId !== 'ID') {
            this.dashboardData.combinations.push({
                id: `${Math.floor(Math.random() * 10.e6)}-${this.activeTaxonomyId}`,
                color: 'rgb(41, 128, 185)',
                label: ``,
                type: 'COMPARISON',
                data: dashboardData.distribution.filter(x => x.value > 0)
            });
        } else {
            this.showAppSpreader = true;
        }
        this.dashboardData.categoryDistribution = (dashboardData as any).categoryDistribution;
        this.dashboardData.topInstalledApps = dashboardData.topInstalledApps.map(x => {
            const y = Object.assign({}, x, {
                key: x.name,
                value: `${x.avgRating} avg. rating`,
                summary: x.summary
            })
            return y;
        });
        this.dashboardData.topRatedApps = dashboardData.topRatedApps.map(x => {
            const y = Object.assign({}, x, {
                key: x.name,
                value: `${x.installs} installs`,
                summary: x.summary
            })
            return y;
        });
        this.dashboardData.ratingDistribution = dashboardData.ratingDistribution.map((x, i) => {
            const temp = this.privacyGradeRatings.find(y => y.id === x.key);
            return {
                key: x.key,
                value: x.value,
                color: temp ? temp.color : '#000'
            }
        });
    }
    showChildren() { }
    setCurrentCriteria(criteria: string) {
        if (this.currentCriteria !== criteria) {
          this.trafficService.dashboardView.next(criteria);
          this.currentCriteria = criteria;
        }
    }
    onCategoryActivated(data) {
        const subDataCategories = this.activeTaxonomy.taxonomies.map(x => `${x._pid}.${x.name}`);
        const params = {
            appCategories: [data.name],
            subDataCategories: subDataCategories
        };
        this.router.navigate(['/search'], { queryParams: params });
    }
    onSubCategoryActivated(data) {
        const params = {
            subDataCategories: [data.name]
        }
        this.router.navigate(['/search'], { queryParams: params });
    }
    onPrivacyGradeCategoryActivated(data) {
        const subDataCategories = this.activeTaxonomy.taxonomies.map(x => `${x._pid}.${x.name}`);
        const params = {
            privacyGrades: [data.name],
            subDataCategories: subDataCategories
        }
        this.router.navigate(['/search'], { queryParams: params });
    }
}
