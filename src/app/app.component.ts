import { Component, OnInit, ViewChild, AfterViewInit, ElementRef, ChangeDetectorRef } from '@angular/core';
import { TrafficService } from './traffic.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SankeyConfig } from './search/search';
import * as _  from 'lodash';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'Tour of Heroes';
    currentPage = 'home';
    showTaxonomyDetails = false;
    showAppTaxonomyDetails = false;
    appDetails = null;
    appTaxonomyDetails = [];
    sankeyDataRef;
    sankeyData;
    parentTaxonomy = 'ID';
    childTaxonomy = 'GENERALID';
    showHeader = false;
    availableTaxonomies = [];
    @ViewChild('wrapper') wrapper: ElementRef;

    constructor(
        private trafficService: TrafficService,
        private router: Router,
        private cdr: ChangeDetectorRef,
        private activatedRouter: ActivatedRoute) { }
    ngOnInit() {
        this.trafficService.currentRoute$.subscribe(route => {
            this.showHeader = route !== 'home';
            this.cdr.detectChanges();
        });
        this.trafficService.init();
        this.availableTaxonomies = this.trafficService.taxonomyStore;
            this.availableTaxonomies.forEach(y => {
                y.visible = true;
                y.taxonomies.forEach(x => x.visible = true);
            })
        this.trafficService.appDetails$.subscribe((data: any) => {
            if (!data) {
                this.showAppTaxonomyDetails = false;
            } else {
                this.showAppTaxonomyDetails = false;
                this.processApp(data.package)
            }
        });
        this.trafficService.showTaxonomyDetails$.subscribe((data: any) => {
            this.showAppTaxonomyDetails = false;
            if (data) {
                this.parentTaxonomy = data.category;
                this.childTaxonomy = data.subcategory;
                this.showTaxonomyDetails = true;
            } else {
                this.showTaxonomyDetails = false;
            }
        });
        this.router.events.subscribe((data) => {
            if (data instanceof NavigationEnd) {
                if (data.url.indexOf('index') !== -1) {
                    this.currentPage = 'index';
                    this.currentPage = data.url.indexOf('index/types') === -1 ? this.currentPage : 'types';
                    this.currentPage = data.url.indexOf('index/id') === -1 ? this.currentPage : 'id';
                    this.currentPage = data.url.indexOf('index/phone') === -1 ? this.currentPage : 'phone';
                    this.currentPage = data.url.indexOf('index/personal') === -1 ? this.currentPage : 'personal';
                    this.currentPage = data.url.indexOf('index/sensor') === -1 ? this.currentPage : 'sensor';
                }
                if (data.url.indexOf('search') !== -1) {
                    this.currentPage = 'search';
                }
                if (data.url.indexOf('apps') !== -1) {
                    this.currentPage = 'apps';
                }
            }
        });
    }
    processApp(packageId) {
        this.trafficService.getAppApiData(packageId).subscribe((data: any) => {
            this.appDetails = data;
            this.appTaxonomyDetails = this.getTaxonomyDetailsForBar(data.taxonomies);
            this.appDetails.metaMissing = this.appDetails.meta ? false : true;
            const relationships = data.relationships;
            const sankeyConfig = SankeyConfig;
            sankeyConfig.series[0].name = 'Request sent by the app';
            (sankeyConfig.series as any)[0].data = this.getSankeyData(relationships, this.appDetails);
            this.sankeyData = sankeyConfig;
            setTimeout(() => {
                this.showAppTaxonomyDetails = true;
            }, 33);
        });
    }
    setPage(page, param = null) {
        this.currentPage = page;
        if (!param) {
            switch (page) {
                case 'index': {
                    this.router.navigate(['/index']);
                    break;
                }
                case 'search': {
                    this.router.navigate(['/search']);
                    break;
                }
                case 'apps': {
                    this.router.navigate(['/apps']);
                    break;
                }
            }
        } else {
            this.router.navigate([`/index/${param}`]);
        }
    }

    goHome() {
        this.router.navigate([`/home`]);
    }
    getTaxonomyDetailsForBar(data) {
        const taxonomies = [];
        (data as Array<any>).forEach(t => {
            const splits = t.split('.');
            const parent = this.availableTaxonomies.find(x => x.name === splits[0]);
            if (parent) {
                const child = parent.taxonomies.find(x => x.name === splits[1]);
                if (child) {
                    taxonomies.push({
                        icon: child.icon,
                        outlineIcon: `outline-${child.icon}`,
                        color: child.color,
                        name: child.name,
                        label: child.label
                    });
                }
            }
        });
        return taxonomies;
    }
    getSankeyData(relationships, appDetails) {
        const taxonomies = [];
        this.availableTaxonomies.forEach(x => {
            x.taxonomies.forEach(y => {
                taxonomies.push(`${x.name}.${y.name}`);
            });
        });
        let sankey = [];
        const sankeyObjects = [];
        let sankeyTaxonomies = [];
        relationships.forEach(x => {
            if (taxonomies.indexOf(x.taxonomy) !== -1) {
                sankeyTaxonomies.push(x.taxonomy);
                const taxonomy = (x.taxonomy.split('.') as Array<any>).pop();
                let item = sankeyObjects.find(y => y.from === appDetails.name && y.to === taxonomy);
                if (!item) {
                    item = { from: appDetails.name, to: taxonomy, count: 1 };
                    sankeyObjects.push(item);
                } else {
                    item.count = item.count + 1;
                }
                item = sankeyObjects.find(y => y.from === taxonomy && y.to === x.host);
                if (!item) {
                    item = { from: taxonomy, to: x.host, count: 1 };
                    sankeyObjects.push(item);
                } else {
                    item.count = item.count + 1;
                }
            }
        });
        sankeyTaxonomies = _.uniq(sankeyTaxonomies);
        sankey = sankeyObjects.map(x => [x.from, x.to, x.count]);
        this.sankeyDataRef = sankeyTaxonomies.length;
        return sankey;
    }
}
