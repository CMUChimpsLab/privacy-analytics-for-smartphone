import * as d3  from 'd3';

export function GetColorsFn(colorA, colorB, len) {
    return d3.scaleLinear().domain([0, len]).range(<any[]>[colorA, colorB]);
}

export const PlainBarConfig = {
    chart: {
        type: 'bar',
        backgroundColor: 'transparent'
    },
    credits: {
        enabled: false
    },
    series: [],
    title: false,
    legend: {
        enabled: false
    },
    xAxis: {
        labels: {
            formatter: function () { }
        }
    },
    yAxis: {
        title: {
            enabled: false
        }
    },
    tooltip: {
        enabled: false
    },
    plotOptions: {
        line: {
            color: 'transparent'
        }
    }
};

export const StackedChartOptions = {
    chart: {
        type: 'bar',
        backgroundColor: 'transparent'
    },
    credits: {
        enabled: false
    },
    series: [],
    title: false,
    xAxis: {},
    legend: {
        enabled: false,
        reversed: true
    },
    yAxis: {
        title: {
            enabled: false
        }
    },
    tooltip: {
        enabled: true,
        headerFormat: '',
    },
    plotOptions: {
        series: {
            stacking: 'normal'
        },
        line: {
            color: 'transparent'
        }
    }
};