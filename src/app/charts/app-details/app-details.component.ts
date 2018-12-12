import { Component, Input, OnInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';

@Component({
    selector: 'app-app-details',
    templateUrl: './app-details.component.html',
    styleUrls: ['./app-details.component.scss']
})
export class AppDetailsComponent implements OnInit {
    @Input() data;
    availableTaxonomies;
    app;
    taxonomies = [];
    boxTitle;
    title;
    icon;
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        this.app = this.data.data.app;
        this.title = this.data.data.name;
        this.icon = this.data.data.iconUrl;
        if (this.data && this.data.data && this.data.data.taxonomies && this.data.data.taxonomies) {
            (this.data.data.taxonomies as Array<any>).forEach(t => {
                const splits = t.split('.');
                const parent = this.availableTaxonomies.find(x => x.name === splits[0]);
                if (parent) {
                    const child = parent.taxonomies.find(x => x.name === splits[1]);
                    if (child) {
                        this.taxonomies.push({
                            icon: child.icon,
                            outlineIcon: `outline-${child.icon}`,
                            color: child.color,
                            name: child.name
                        });
                    }
                }
            });
        }
    }
}