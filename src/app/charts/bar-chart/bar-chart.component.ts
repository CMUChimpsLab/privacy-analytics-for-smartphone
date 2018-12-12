import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as Highcharts from 'highcharts';
import { TrafficService } from '../../traffic.service';
import * as _ from 'lodash';
import { StackedChartOptions, PlainBarConfig, GetColorsFn } from '../../support';
import { COLORS } from '../../data';
declare var d3: any;

@Component({
    selector: 'app-bar-chart',
    templateUrl: './bar-chart.component.html',
    styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit {
    Highcharts = Highcharts;
    showChart = false;
    chartOptions: any = Object.assign({}, PlainBarConfig);
    availableTaxonomies;
    @Input() collection = [];
    @Input() title;
    @Input() data;
    @Output() onColumnClicked = new EventEmitter<any>();
    constructor(private trafficService: TrafficService) { }
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        const data = Object.assign({}, GetDataTransform(this.data, this.availableTaxonomies));
        const formatter = (function(){
            return function() {
                const pos = this.pos;
                const icon = data.data[pos]['icon'];
                const name = data.data[pos]['name'];
                const outlineIcon = `outline-${icon}`;
                return `<span class="hc-label"><span class="hc-label-text">${name}</span><i class="md-outline-icon ${outlineIcon}"></i></span>`;
            }
        })();
        this.chartOptions.xAxis = Object.assign({}, {
            labels: {
                formatter: formatter,
                useHTML: true
            }
        });
        this.chartOptions.series = [];
        this.chartOptions.series.push(data);
        this.chartOptions.series[0].events = {
            click: (e) => {
                if (e.point) {
                    const options = e.point.options;
                    this.onColumnClicked.emit(options);
                }
            }
        };
        setTimeout(() => {
            this.showChart = true;
        });
    }
}
const  GetDataTransform = function(data, availableTaxonomies) {
    const taxonomies = [];
    availableTaxonomies.forEach(y => taxonomies.push(...y.taxonomies));
    const randomColor = d3.color(data.color);
    const internalColors = GetColorsFn(randomColor.hex(), randomColor.brighter(3).hex(), data.data.length);
    const result = {
        data: data.data.map((t, i) => {
            const _t = taxonomies.find(x => x.name === t.key)
            return {
                name: t.key,
                y: t.value,
                color: internalColors(i),
                icon: _t.icon,
                className: 'cursor-pointer'
            };
        }),
        dataLabels: {
            enabled: true,
            formatter: function () {
                return `${this.y} apps`;
            }
        },
        className: 'cursor-pointer'
    };
    return result;
}
