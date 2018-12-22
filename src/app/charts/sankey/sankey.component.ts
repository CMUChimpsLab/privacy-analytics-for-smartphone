declare var require: any;

import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';
import * as Highcharts from 'highcharts';
require('highcharts/modules/sankey')(Highcharts);
// // require('highcharts/modules/sankey')(Highcharts);
// import * as HC_SANKEY from 'highcharts/modules/sankey';
// HC_SANKEY(Highcharts);

@Component({
    selector: 'app-sankey',
    templateUrl: './sankey.component.html',
    styleUrls: ['./sankey.component.scss']
})
export class SankeyComponent implements OnInit {
    Highcharts = Highcharts;
    @Input() data;
    @Input() count;
    @Input() height;
    @Input() title;
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
        this.count = this.count || 0;
        this.height = this.height * 100;
    }
}