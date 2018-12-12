import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { TrafficService } from '../traffic.service';
@Component({
    selector: 'app-filters-pane',
    templateUrl: 'filters-pane.component.html',
    styleUrls: [
        './filters-pane.component.scss'
    ]
})
export class FiltersPaneComponent implements OnInit {
    @Input() data;
    privacyRatingMeta;
    appCategoriesMeta;
    freeAppsMeta;
    appCategories;
    taxonomiesMeta;
    taxonomyStore = [];
    adSupportedMeta;
    installsMeta;
    @Input() params: any = {};
    @Input() open = false;
    @Output() openChange = new EventEmitter();
    @Output() applyFilters = new EventEmitter();
    constructor(private trafficService: TrafficService) { }
    ngOnInit() {
        this.taxonomyStore = this.trafficService.taxonomyStore;
        const metas = [];
        this.taxonomyStore.forEach(x => {
            x.taxonomies.forEach(y => {
                metas.push({
                    value: y.label,
                    key: `${x.name}.${y.name}`,
                    parent: x.name,
                    checked: false
                });
            });
            this.taxonomiesMeta = {
                name: 'What data type is being sent?',
                values: metas
            }
        });
        this.privacyRatingMeta = this.data.find(x => x.id === 'privacyRating') || {};
        if (this.privacyRatingMeta) {
            this.privacyRatingMeta.values.forEach(x => x.checked = false);
        }
        this.installsMeta = this.data.find(x => x.id === 'meta.installs') || {};
        if (this.installsMeta) {
            this.installsMeta.values.forEach(x => x.checked = false);
        }
        this.appCategoriesMeta = this.data.find(x => x.id === 'category') || {};
        if (this.appCategoriesMeta) {
            this.appCategoriesMeta.values.forEach(x => x.checked = false);
        }
        this.adSupportedMeta = this.data.find(x => x.id === 'meta.adSupported') || {};
        if (this.adSupportedMeta) {
            this.adSupportedMeta.values.forEach(x => x.checked = false);
        }
        this.freeAppsMeta = this.data.find(x => x.id === 'meta.free') || {};
        if (this.freeAppsMeta) {
            this.freeAppsMeta.values.forEach(x => x.checked = false);
        }
        console.log(this.params);
        if (this.params.appCategories) {
            if (this.appCategoriesMeta) {
                const meta = this.appCategoriesMeta.values.find(x => this.params.appCategories.indexOf(x.key ) !== -1);
                if (meta) {
                    meta.checked = true;
                }
            }
        }
        if (this.params.dataCategories) {
            if (this.taxonomiesMeta) {
                if (!this.params.subDataCategories) {
                    const metas = this.taxonomiesMeta.values.filter(x =>  this.params.dataCategories.indexOf(x.parent) !== -1);
                    if (metas.length > 0) {
                        metas.forEach(x => x.checked = true);
                    }
                } else {
                    // const metas = this.taxonomiesMeta.values.filter(x => x.key === `${this.params.dataCategory}.${this.params.subDataCategories}`);
                    // if (metas.length > 0) {
                    //     metas.forEach(x => x.checked = true);
                    // }
                }
            }
        }
    }
    close() {
        this.open = false;
        this.openChange.emit(this.open);
    }
    apply() {
        this.open = false;
        this.openChange.emit(this.open);
        const filters = [];
        if (this.privacyRatingMeta) {
            const values = this.privacyRatingMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: this.privacyRatingMeta.id,
                    values: values
                });
            }
        }
        if (this.installsMeta) {
            const values = this.installsMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: this.installsMeta.id,
                    values: values
                });
            }
        }
        if (this.appCategoriesMeta) {
            const values = this.appCategoriesMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: this.appCategoriesMeta.id,
                    values: values
                });
            }
        }
        if (this.adSupportedMeta) {
            const values = this.adSupportedMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: this.adSupportedMeta.id,
                    values: values
                });
            }
        }
        if (this.freeAppsMeta) {
            const values = this.freeAppsMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: this.freeAppsMeta.id,
                    values: values
                });
            }
        }
        if (this.taxonomiesMeta) {
            const values = this.taxonomiesMeta.values.filter( x=> x.checked === true);
            if (values.length > 0) {
                filters.push({
                    id: 'taxonomies',
                    values: values
                });
            }
        }
        this.applyFilters.emit(filters);
    }
    clear() {
        this.open = false;
        this.openChange.emit(this.open);
        if (this.privacyRatingMeta) {
            this.privacyRatingMeta.values.forEach(x => x.checked = false);
        }
        this.installsMeta = this.data.find(x => x.id === 'meta.installs') || {};
        if (this.installsMeta) {
            this.installsMeta.values.forEach(x => x.checked = false);
        }
        this.appCategoriesMeta = this.data.find(x => x.id === 'category') || {};
        if (this.appCategoriesMeta) {
            this.appCategoriesMeta.values.forEach(x => x.checked = false);
        }
        this.adSupportedMeta = this.data.find(x => x.id === 'meta.adSupported') || {};
        if (this.adSupportedMeta) {
            this.adSupportedMeta.values.forEach(x => x.checked = false);
        }
        this.freeAppsMeta = this.data.find(x => x.id === 'meta.free') || {};
        if (this.freeAppsMeta) {
            this.freeAppsMeta.values.forEach(x => x.checked = false);
        }
        if (this.taxonomiesMeta) {
            this.taxonomiesMeta.values.forEach(x => x.checked = false);
        }
        this.applyFilters.emit([]);
    }
}