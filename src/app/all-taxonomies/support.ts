export function GetDashboardDataTransformForUpperTaxonomies(taxonomies, usableTaxonomyData) {
    const temp = [];
    taxonomies.forEach((x, i) => {
        let appsCountSum = 0;
        let hostsCountSum = 0;
        let requestsCountSum = 0;
        let usableData = null;
        if (usableTaxonomyData) {
            usableData = (usableTaxonomyData.data as Array<any>).find(ut => ut.name === x.name);
        }
        if (x.taxonomies.length > 0) {
            (x.taxonomies as Array<string>).forEach((y: any, j) => {
                y.appsCount = 0;
                y.hostsCount = 0;
                y.requestsCount = 0;
                if (usableData && usableData.taxonomies) {
                    let it = usableData.taxonomies.find(x => x.name === y.name);
                    if (it) {
                        y.appsCount = it.appsCount || 0;
                        y.hostsCount = it.hostsCount || 0;
                        y.requestsCount = it.requestsCount || 0;
                    }
                }
            })
            appsCountSum = x.taxonomies.reduce((prev, curr) => prev + curr.appsCount, 0);
            hostsCountSum = x.taxonomies.reduce((prev, curr) => prev + curr.hostsCount, 0);
            requestsCountSum = x.taxonomies.reduce((prev, curr) => prev + curr.requestsCount, 0);
        }
        temp.push({
            name: x.name,
            requestsCount: requestsCountSum,
            appsCount: appsCountSum,
            hostsCount: hostsCountSum,
            taxonomies: x.taxonomies,
            color: x.color,
            icon: x.icon
        });
    });
    return temp;
}

export function GetPlainBarTransformForUpperTaxonomy(taxonomies, criteria) {
    const result = {
        data: taxonomies.map(t => {
            let value = 0;
            switch (criteria) {
                case 'apps': { value = t.appsCount; break; }
                case 'hosts': { value = t.hostsCount; break; }
                case 'requests': { value = t.requestsCount; break; }
            }
            return {
                name: t.name,
                y: value,
                color: t.color,
                _obj: t,
                taxonomies: t.taxonomies,
                className: 'cursor-pointer'
            };
        }),
        dataLabels: {
            enabled: true,
            formatter: function () {
                return this.y + ` ${criteria}`;
            }
        },
        className: 'cursor-pointer',
        name: CapitalizeFirstLetter(criteria)
    };
    return result;
}

export function GetStackedBarTransfromForInnerTaxonomy(taxonomies, criteria) {
    const internalTaxonomies = [];
    taxonomies.forEach(x => {
        x.taxonomies.forEach(y => {
            internalTaxonomies.push(y);
        })
    });
    const result = [];
    internalTaxonomies.reverse();
    internalTaxonomies.forEach(st => {
        let value = 0;
        switch (criteria) {
            case 'apps': { value = st.appsCount; break; }
            case 'hosts': { value = st.hostsCount; break; }
            case 'requests': { value = st.requestsCount; break; }
        }
        const item = {
            name: st.name,
            data: Array(taxonomies.length).fill(0),
            color: st.color,
            upper_taxonomy: st._pid,
            className: 'cursor-pointer'
        };
        item.data[st._pIndex] = value;
        result.push(item);
    })
    return result;
}

export function CapitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}


export const DashboardData = {
    "length": 6,
    "data": [
        {
            "name": "ID",
            "requestsCount": 17797,
            "taxonomies": [
                {
                    "name": "GENERALID",
                    "requestsCount": 17797,
                    "appsCount": 3598,
                    "hostsCount": 3602
                }
            ]
        },
        {
            "name": "PHONE",
            "requestsCount": 24356,
            "taxonomies": [
                {
                    "name": "BATTERY",
                    "requestsCount": 25,
                    "appsCount": 8,
                    "hostsCount": 14
                },
                {
                    "name": "DEVICE",
                    "requestsCount": 22042,
                    "appsCount": 4069,
                    "hostsCount": 2750
                },
                {
                    "name": "NETWORK",
                    "requestsCount": 2289,
                    "appsCount": 695,
                    "hostsCount": 895
                },
                {
                    "name": "RUNNINGSTATE",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                },
                {
                    "name": "NOTIFICATION",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                }
            ]
        },
        {
            "name": "PERSONAL",
            "requestsCount": 1130,
            "taxonomies": [
                {
                    "name": "CONTACTS",
                    "requestsCount": 98,
                    "appsCount": 66,
                    "hostsCount": 70
                },
                {
                    "name": "CALENDAR",
                    "requestsCount": 3,
                    "appsCount": 3,
                    "hostsCount": 3
                },
                {
                    "name": "SMS",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                },
                {
                    "name": "STORAGE",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                },
                {
                    "name": "ACCOUNT",
                    "requestsCount": 1029,
                    "appsCount": 410,
                    "hostsCount": 421
                }
            ]
        },
        {
            "name": "SENSOR",
            "requestsCount": 1508,
            "taxonomies": [
                {
                    "name": "CAMERA",
                    "requestsCount": 1,
                    "appsCount": 1,
                    "hostsCount": 1
                },
                {
                    "name": "LOCATION",
                    "requestsCount": 1497,
                    "appsCount": 424,
                    "hostsCount": 375
                },
                {
                    "name": "MICROPHONE",
                    "requestsCount": 10,
                    "appsCount": 9,
                    "hostsCount": 8
                },
                {
                    "name": "INERTIAL",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                },
                {
                    "name": "PROXIMITY",
                    "requestsCount": 0,
                    "appsCount": 0,
                    "hostsCount": 0
                }
            ]
        },
        {
            "name": "NONPRIVACY",
            "requestsCount": 47212,
            "taxonomies": [
                {
                    "name": "NONPRIVACY",
                    "requestsCount": 47212,
                    "appsCount": 3877,
                    "hostsCount": 2900
                }
            ]
        },
        {
            "name": "INSUFFICIENT",
            "requestsCount": 87265,
            "taxonomies": [
                {
                    "name": "INSUFFICIENT",
                    "requestsCount": 87265,
                    "appsCount": 4266,
                    "hostsCount": 5652
                }
            ]
        }
    ]
};  