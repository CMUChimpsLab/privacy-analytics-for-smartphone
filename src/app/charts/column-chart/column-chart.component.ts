
import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as Highcharts from 'highcharts';
import { TrafficService } from '../../traffic.service';
import * as _ from 'lodash';
import { StackedChartOptions, PlainBarConfig, GetColorsFn } from '../../support';
import { COLORS } from '../../data';
declare var d3: any;

@Component({
    selector: 'app-column-chart',
    templateUrl: './column-chart.component.html',
    styleUrls: ['./column-chart.component.scss']
})
export class ColumnChartComponent implements OnInit {
    Highcharts = Highcharts;
    showChart = false;
    chartOptions: any = Object.assign({}, GetChartsDataConfig);
    availableTaxonomies;
    @Input() collection = [];
    @Input() title;
    @Input() data;
    @Output() onColumnClicked = new EventEmitter<any>();
    constructor(private trafficService: TrafficService) { }
    ngOnInit() {
        this.availableTaxonomies = this.trafficService.taxonomyStore;
        const data = this.data.filter(x => !_.isEmpty(x.key) && x.key !== 'UNKNOWN').sort((x, y) => x.key.localeCompare(y.key)).map(x => [x.key, x.value]);
        this.chartOptions.series[0].data = data;
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
const GetChartsDataConfig = {
    chart: {
        type: 'column'
    },
    title: {
        enabled: false,
        text: ''
    },
    subtitle: {
        enabled: false,
        text: ''
    },
    xAxis: {
        type: 'category',
        labels: {
            rotation: -45,
            style: {
                fontSize: '13px',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    },
    yAxis: {
        min: 0,
        title: {
            text: 'Apps'
        }
    },
    credits: {
        enabled: false
    },
    legend: {
        enabled: false
    },
    tooltip: {
        pointFormat: '<b>{point.y} </b> Apps'
    },
    series: [{
        name: 'Apps',
        colorByPoint: true,
        data: [],
        dataLabels: {
            enabled: true,
            rotation: -90,
            color: '#565656',
            align: 'bottom',
            format: '{point.y} apps', // one decimal
            y: -10, // 10 pixels down from the top
            style: {
                fontSize: '10px',
                fontFamily: 'Verdana, sans-serif'
            }
        }
    }]
};
