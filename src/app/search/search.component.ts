import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TrafficService } from '../traffic.service';
import * as _ from 'lodash';
import { SearchPageResult, SearchPageItemRelationShips, SankeyConfig } from './search';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SearchComponent implements OnInit {
    availableTaxonomies;
    searchDataAvailable = false;
    items = [];
    collection = [];
    taxonomyHeader = [];
    currentFilter;
    currentState;
    currentPageLength;
    currentPageIndex = 0;
    pageLengths = [40, 80, 120];
    searchText = null;
    isSettingsPane = false;
    columnSettings = [];
    showTaxonomyDetails = false;
    taxonomyPopOverTitle = null;
    taxonomyPopOverDescription = null;
    taxonomyPurposes = [];
    appDetails = null;
    appTaxonomyDetails = [];
    sankeyData;
    sankeyDataRef = 0;
    showSearchTitle = false;
    showSearchBar = false;
    currentSearchParams = null;
    showOnlyOneCategory = false;
    currentSkip = 0;
    paramsTitle = null;
    currentView = 'tiles';
    filtersData;
    filtersPaneOpened = false;
    filtersPaneLoaded = false;
    someFiltersActive = false;
    numOfFilters = 0;
    filetrParams = [];
    constructor(
        private trafficService: TrafficService,
        private activatedRoute: ActivatedRoute,
        private router: Router
    ) { }
    ngOnInit() {
        this.trafficService.currentRoute.next('search');
        this.currentPageLength = this.pageLengths[0];
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        this.activatedRoute.queryParams.subscribe((params) => {
            this.showSearchTitle = !_.isEmpty(params);
            this.checkAndProcess(params);
        });
        this.showSearchBar = window.location.pathname === '/search';
        this.showSearchTitle = window.location.pathname === '/search';
        this.trafficService.getAppSearchMetaData().subscribe((data) => {
            this.filtersData = data;
            this.filtersPaneLoaded = true;
        });
    }
    checkAndProcess(params) {
        this.showOnlyOneCategory = false;
        this.availableTaxonomies.forEach(y => {
            y.visible = true;
            y.taxonomies.forEach(x => x.visible = true);
        });
        this.availableTaxonomies.forEach(y => this.columnSettings.push(...y.taxonomies));
        this.columnSettings.forEach(x => x.visible = true);
        if (!_.isEmpty(params)) {
            this.currentSearchParams = params;
        } else {
            this.currentSearchParams = {};
        }
        setTimeout(() => {
            this.process();
        }, 100);
    }
    process() {
        if (!_.isEmpty(this.currentSearchParams)) {
            this.showOnlyOneCategory = true;
            this.correctSearchParams();
        } else {
            this.showOnlyOneCategory = false;
        }
        let taxonomies = [];
        this.items = [];
        this.availableTaxonomies.forEach(y => taxonomies.push(...y.taxonomies));
        taxonomies = taxonomies.filter(x => {
            if (!this.showOnlyOneCategory) {
                return x.visible;
            } else {
                if (!_.isEmpty(this.currentSearchParams.subDataCategories)) {
                    const tax = `${x._pid}.${x.name}`;
                    return this.currentSearchParams.subDataCategories.indexOf(tax) !== -1;
                }
            }
        });
        this.taxonomyHeader = [];
        this.taxonomyHeader = taxonomies.map((curr, i) => {
            return {
                label: curr.label,
                placement: 'bottom',
                name: curr.name,
                icon: curr.icon,
                outlineIcon: 'outline-' + curr.icon,
                color: curr.color,
                value: false,
                target: `${curr['_pid']}.${curr.name}`,
                purposes: curr.purposes,
                description: curr.description,
            };
        });
        let searchParams = Object.assign({}, this.currentSearchParams);
        searchParams = Object.assign({}, {
            skip: this.currentSkip,
            limit: this.currentPageLength
        }, searchParams);
        this.someFiltersActive = !_.isEmpty(this.currentSearchParams);
        this.trafficService.getSearchApiData(searchParams).subscribe((data) => {
            if (data && data.length > 0) {
                data.forEach((item, i) => {
                    if (i < 2 || true) {
                        const mappedItem = Object.assign({}, {
                            name: item.app,
                            title: item.name,
                            icon: item.iconUrl,
                            mappings: []
                        }, item);
                        this.taxonomyHeader.forEach(th => {
                            mappedItem.mappings.push(Object.assign({}, th));
                        })
                        mappedItem.mappings.forEach(x => {
                            x.value = item.taxonomies.indexOf(x.target) !== -1;
                        });
                        this.items.push(mappedItem);
                    }
                });
            }
        });
        // this.filterCollection();
        this.searchDataAvailable = true;
    }
    onPageLengthChange() {
        this.currentPageIndex = 0;
        this.process();
    }
    changePage(index) {
        this.currentPageIndex = this.currentPageIndex + parseInt(index);
        if (this.currentPageIndex < 0) {
            this.currentPageIndex = 0;
        }
        this.currentSkip = this.currentPageIndex * this.currentPageLength;
        this.process();
    }
    openSettingsPane() {
        this.isSettingsPane = true;
        const elem = document.querySelector('[data-tag="view-scroller"]');
        if (elem) {
            elem.classList.add('noOverflow');
        }
    }
    closeSettingsPane() {
        this.isSettingsPane = false;
        const elem = document.querySelector('[data-tag="view-scroller"]');
        if (elem) {
            elem.classList.remove('noOverflow');
        }
    }
    apply() {
        this.process();
        this.isSettingsPane = false;
    }
    onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Enter' || event.key === 'Backspace') {
            this.debouncedFilterCollection();
        }
    }
    toggleParentVisibility(parent) {
        for (let i = 0; i < this.availableTaxonomies.length; i++) {
            const parentTaxonomy = this.availableTaxonomies[i];
            if (parentTaxonomy.name === parent) {
                parentTaxonomy.visible = !parentTaxonomy.visible;
                parentTaxonomy.taxonomies.forEach(x => x.visible = parentTaxonomy.visible);
                break;
            }
        }
    }
    debouncedSearch = _.debounce(this.onKeyUp, 100);
    debouncedFilterCollection = _.debounce(this.filterCollection, 100);
    filterCollection() {
        this.applyFilters([]);
    }
    Collection
    showData(app) {
        this.appDetails = app;
        this.appTaxonomyDetails = this.getTaxonomyDetailsForBar();
        this.showTaxonomyDetails = true;
        this.appDetails.metaMissing = this.appDetails.meta ? false : true;
        const relationships = SearchPageItemRelationShips;
        const sankeyConfig = SankeyConfig;
        sankeyConfig.series[0].name = 'Request sent by the app';
        (sankeyConfig.series as any)[0].data = this.getSankeyData(relationships, this.appDetails);
        this.sankeyData = sankeyConfig;
        const data = {
            package: this.appDetails.package,
            appDetails: this.appDetails,
            appTaxonomyDetails: this.appTaxonomyDetails,
            sankeyDataRef: this.sankeyDataRef,
            sankeyData: this.sankeyData
        };
        this.trafficService.appDetails.next(data);
    }
    loadPopup(item) {
        this.taxonomyPopOverTitle = this.CapitalizeFirstLetter(item.label);
        this.taxonomyPopOverDescription = item.description;
        this.taxonomyPurposes = item.purposes;
    }

    getTaxonomyDetailsForBar() {
        const taxonomies = [];
        (this.appDetails.taxonomies as Array<any>).forEach(t => {
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
    applyFilters(filters) {
        this.numOfFilters = 0;
        let params = {};
        this.filetrParams = [];
        const subDataCategories = filters.find(x => x.id === 'taxonomies');
        if (subDataCategories && subDataCategories.values.length > 0) {
            params = Object.assign({}, params,{
                subDataCategories: subDataCategories.values.map(x => x.key)
            });
        }
        const appCategories = filters.find(x => x.id === 'category');
        if (appCategories && appCategories.values.length > 0) {
            params = Object.assign({}, params,{
                appCategories: appCategories.values.map(x => x.key)
            });
        }
        const privacyRatings = filters.find(x => x.id === 'privacyRating');
        if (privacyRatings && privacyRatings.values.length > 0) {
            params = Object.assign({}, params,{
                privacyGrades: privacyRatings.values.map(x => x.key)
            })
        }
        const metaInstalls = filters.find(x => x.id === 'meta.installs');
        if (metaInstalls && metaInstalls.values.length > 0) {
            params = Object.assign({}, params,{
                metaInstalls: metaInstalls.values.map(x => x.key)
            });
        }
        const metaFrees = filters.find(x => x.id === 'meta.free');
        if (metaFrees && metaFrees.values.length > 0) {
            params = Object.assign({}, params,{
                metaFrees: metaFrees.values.map(x => Boolean(x.key))
            });
        }
        const metaAdSupported = filters.find(x => x.id === 'meta.adSupported');
        if (metaAdSupported && metaAdSupported.values.length > 0) {
            params = Object.assign({}, params,{
                metaAdSupported: metaAdSupported.values.map(x => Boolean(x.key))
            });
        }
        if (!_.isEmpty(this.searchText)) {
            params = Object.assign({}, params,{
                search: this.searchText
            });
        }
        this.router.navigate(['/search'], { queryParams: params });
        
    }
    CapitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    correctSearchParams() {
        this.filetrParams = [];
        if (this.currentSearchParams.dataCategories) {
            if (!(this.currentSearchParams.dataCategories instanceof Array)) {
                const temp = this.currentSearchParams.dataCategories;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    dataCategories: [temp]
                })
            }
            this.numOfFilters += this.currentSearchParams.dataCategories.length;
        }
        if (this.currentSearchParams.subDataCategories) {
            if (!(this.currentSearchParams.subDataCategories instanceof Array)) {
                const temp = this.currentSearchParams.subDataCategories;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    subDataCategories: [temp]
                })
            }
            this.currentSearchParams.subDataCategories.forEach(x => {
                this.filetrParams.push({
                    key: 'taxonomies',
                    label: 'Taxonomy',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.subDataCategories.length;
        }
        if (this.currentSearchParams.appCategories) {
            if (!(this.currentSearchParams.appCategories instanceof Array)) {
                const temp = this.currentSearchParams.appCategories;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    appCategories: [temp]
                });
            }
            this.currentSearchParams.appCategories.forEach(x => {
                this.filetrParams.push({
                    key: 'category',
                    label: 'App Category',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.appCategories.length;
        }
        if (this.currentSearchParams.privacyGrades) {
            if (!(this.currentSearchParams.privacyGrades instanceof Array)) {
                const temp = this.currentSearchParams.privacyGrades;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    privacyGrades: [temp]
                })
            }
            this.currentSearchParams.privacyGrades.forEach(x => {
                this.filetrParams.push({
                    key: 'privacyRating',
                    label: 'PrivacyGrade',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.privacyGrades.length;
        }
        if (this.currentSearchParams.metaInstalls) {
            if (!(this.currentSearchParams.metaInstalls instanceof Array)) {
                const temp = this.currentSearchParams.metaInstalls;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    metaInstalls: [temp]
                })
            }
            this.currentSearchParams.metaInstalls.forEach(x => {
                this.filetrParams.push({
                    key: 'meta.installs',
                    label: 'Installs',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.metaInstalls.length;
        }
        if (this.currentSearchParams.metaFrees) {
            if (!(this.currentSearchParams.metaFrees instanceof Array)) {
                const temp = this.currentSearchParams.metaFrees;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    metaFrees: [temp]
                })
            }
            this.currentSearchParams.metaFrees.forEach(x => {
                this.filetrParams.push({
                    key: 'meta.free',
                    label: 'Price',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.metaFrees.length;
        }
        if (this.currentSearchParams.metaAdSupported) {
            if (!(this.currentSearchParams.metaAdSupported instanceof Array)) {
                const temp = this.currentSearchParams.metaAdSupported;
                this.currentSearchParams = Object.assign({}, this.currentSearchParams, {
                    metaAdSupported: [temp]
                })
            }
            this.currentSearchParams.metaAdSupported.forEach(x => {
                this.filetrParams.push({
                    key: 'adSupported',
                    label: 'Ads',
                    value: x
                });
            });
            this.numOfFilters += this.currentSearchParams.metaAdSupported.length;
        }
    }
    removeFilter(filter) {
        this.filtersPaneOpened = true;
    }
}