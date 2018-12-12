import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import * as Highcharts from 'highcharts';
import { TrafficService } from '../../traffic.service';
import * as _ from 'lodash';
import { GetColorsFn } from '../../support';
declare var d3: any;

@Component({
    selector: 'app-donut-chart',
    templateUrl: './donut-chart.component.html',
    styleUrls: ['./donut-chart.component.scss']
})
export class DonutChartComponent implements OnInit {
    Highcharts = Highcharts;
    showChart = false;
    donutChartOptions: any = Object.assign({}, DonutChartOptions);
    availableTaxonomies;
    @Input() collection = [];
    @Input() title;
    @Input() meta;
    @Output() onColumnClicked = new EventEmitter<any>();
    privacyGradeRatings: any[] = [
        { id: 'A+', label: 'Best', color: '#000', percentage: 0 },
        { id: 'A', label: 'Excellent', color: '#000', percentage: 0 },
        { id: 'B', label: 'Good', color: '#000', percentage: 0 },
        { id: 'C', label: 'Fair', color: '#000', percentage: 0 },
        { id: 'D', label: 'Poor', color: '#000', percentage: 0 },
        { id: 'UNKNOWN', label: 'Unknown', color: '#000', percentage: 0 }
    ];
    constructor(private trafficService: TrafficService) { }
    ngOnInit() {
        const internalColors = GetColorsFn(d3.color('#3498db').hex(), d3.color('#f1f3f5').hex(), this.privacyGradeRatings.length - 1);
        this.privacyGradeRatings.forEach((x, i) => {
            if (i < this.privacyGradeRatings.length - 1) {
                x.color = internalColors(i) as any;
            }
            x.meta = x.id;
            if (x.id === 'UNKNOWN') {
                x.meta = '—';
            }
        });
        const sum = this.collection.reduce((s, f) => {
            return s + parseFloat(f.value);
        }, 0);
        this.collection.forEach(x => {
            let percentage = (x.value/sum) * 100;
            percentage = Math.round(percentage * 100) / 100;
            x.percentage = percentage;
            const rating = this.privacyGradeRatings.find( y => y.id === x.key);
            if (rating) {
                rating.percentage = percentage;
            }
        });
        const pieData = this.collection.map(x => {
            const temp = this.privacyGradeRatings.find(y => y.id === x.key);
            return {
                y: x.value,
                name: x.key,
                color: temp ? temp.color : '#000'
            };
        });
        this.donutChartOptions.series = [{
            type: 'pie',
            name: `${this.meta}`,
            innerSize: '50%',
            data: pieData,
            events: {
                click: (e) => {
                    if (e.point) {
                        const options = e.point.options;
                        this.onColumnClicked.emit(options);
                    }
                }
            }
        }];
        setTimeout(() => {
            this.showChart = true;
        });
    }
}

const DonutChartOptions = {
    chart: {
        plotBackgroundColor: null,
        plotBorderWidth: 0,
        plotShadow: false
    },
    credits: {
        enabled: false
    },
    title: {
        text: '',
        align: 'center',
        verticalAlign: 'middle',
        y: 40
    },
    tooltip: {
        pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
    },
    plotOptions: {
        pie: {
            dataLabels: {
                enabled: true,
                distance: -50,
                style: {
                    fontWeight: 'bold',
                    color: 'white'
                }
            },
            startAngle: -90,
            endAngle: 90,
            center: ['50%', '100%'],
            size: '110%'
        }
    },
    series: [{
        type: 'pie',
        name: 'Browser share',
        innerSize: '50%',
        data: []
    }]
};
