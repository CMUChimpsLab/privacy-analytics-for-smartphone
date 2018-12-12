import { Component, Input, OnInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-list-card',
    templateUrl: './list-card.component.html',
    styleUrls: ['./list-card.component.scss']
})
export class ListCardComponent implements OnInit {
    @Input() data;
    boxTitle;
    availableTaxonomies;
    color;
    constructor(private trafficService: TrafficService, private sanitizer: DomSanitizer) {}
    ngOnInit() {
        this.boxTitle = 'Who is sending CALENDAR data ?';
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        const taxonomies = [];
        this.availableTaxonomies.forEach(y => taxonomies.push(...y.taxonomies));
        const _t = taxonomies.find(x => x.name === this.data.label);
        this.color = _t.color;
        this.data.data.forEach(x => {
            x.icon = this.sanitizer.bypassSecurityTrustUrl(x.iconUrl)
        })
    }
}