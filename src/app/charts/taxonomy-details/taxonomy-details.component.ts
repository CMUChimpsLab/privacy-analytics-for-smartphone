import { Component, Input, OnInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';

@Component({
    selector: 'app-taxonomy-item-details',
    templateUrl: './taxonomy-details.component.html',
    styleUrls: ['./taxonomy-details.component.scss']
})
export class TaxonomyItemDetailsComponent implements OnInit {
    @Input() data;
    @Input() title;
    taxonomy = {};
    availableTaxonomies;
    boxTitle;
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
        this.boxTitle = 'Who is sending DEVICE data ?';
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        const taxonomies = [];
        this.availableTaxonomies.forEach(y => taxonomies.push(...y.taxonomies));
        const _t = taxonomies.find(x => x.name === this.data.label);
        this.taxonomy = {
            name: _t.name,
            icon: _t.icon,
            color: _t.color
        };
    }
}