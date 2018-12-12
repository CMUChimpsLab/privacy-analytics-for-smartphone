import { Component, Input, OnInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';
import { SearchPageItemRelationShips, SankeyConfig, SearchPageResult } from '../../search/search';
import * as _ from 'lodash';

@Component({
    selector: 'app-top-10-apps',
    templateUrl: './top-10-apps.component.html',
    styleUrls: ['./top-10-apps.component.scss']
})
export class Top10AppsComponent implements OnInit {
    @Input() data;
    @Input() title;
    @Input() color;
    availableTaxonomies = [];
    sankeyDataRef;
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
    }
    showData(app) {
        const appDetails = SearchPageResult.data[0];
        appDetails.name = app.name;
        appDetails.icon = app.iconUrl;
        const appTaxonomyDetails = this.getTaxonomyDetailsForBar(appDetails);
        appDetails.metaMissing = appDetails.meta ? false : true;
        const relationships = SearchPageItemRelationShips;
        const sankeyConfig = SankeyConfig;
        sankeyConfig.series[0].name = 'Request sent by the app';
        (sankeyConfig.series as any)[0].data = this.getSankeyData(relationships, appDetails);
        const sankeyData = sankeyConfig;
        const data = {
            appDetails: appDetails,
            appTaxonomyDetails: appTaxonomyDetails,
            sankeyDataRef: this.sankeyDataRef,
            sankeyData: sankeyData
        };
        this.trafficService.appDetails.next(data);
    }
    getTaxonomyDetailsForBar(appDetails) {
        const taxonomies = [];
        (appDetails.taxonomies as Array<any>).forEach(t => {
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