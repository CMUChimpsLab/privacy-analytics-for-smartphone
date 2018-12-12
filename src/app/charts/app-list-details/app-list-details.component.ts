import { Component, OnInit } from "@angular/core";
import { SocialApps } from "./sample";
import { TrafficService } from "../../traffic.service";

@Component({
    selector: 'app-list-details',
    templateUrl: 'app-list-details.component.html',
    styleUrls: [ 'app-list-details.component.scss']
})
export class AppListDetailsComponent implements OnInit {
    apps: Array<any> = SocialApps;
    limit = 10;
    sortDirection = 'DESC';
    sortField = 'avgRating';
    constructor(private appService: TrafficService) {
    }
    ngOnInit () {
        this.apps.forEach(x => {
            x.mappedTaxonomies = [];
            let rating = 0;
            if (x.meta && x.meta.histogram) {
                rating = GetAverageRating(x.meta.histogram);
            }
            x.avgRating = rating;
            x = this.appService.getAppTaxonomyTransform(x);
        });
        this.apps = this.apps.filter(x => x.mappedTaxonomies.length !== 0);
        this.sortData();
    }
    showMore() {
        this.limit = this.limit + 10;
    }
    sort(field) {
        if (this.sortField !== field) {
            this.sortField = field
        } else {
            if (this.sortDirection === 'ASC') {
                this.sortDirection = 'DESC';
            } else {
                this.sortDirection = 'ASC';
            }
        }
        this.sortData();
    }
    sortData() {
        if (this.sortField === 'avgRating') {
            this.apps.sort( (x, y) => {
                if (this.sortDirection === 'DESC') {
                    return y.avgRating - x.avgRating;
                }
                else {
                    return x.avgRating - y.avgRating;
                }
            });
        } else {
            this.apps.sort( (x, y) => {
                const xReviews = x.meta ? ((x.meta.reviews) ? x.meta.reviews : 0) : 0;
                const yReviews = y.meta ? ((y.meta.reviews) ? y.meta.reviews : 0) : 0;
                if (this.sortDirection === 'DESC') {
                    return yReviews - xReviews;
                }
                else {
                    return xReviews - yReviews;
                }
            });
        }
    }
}

function GetAverageRating(histogram) {
    let result = 0;
    const mul = ( 1 * (histogram[1] || 0) + 2 * (histogram[2] || 0) + 3 * (histogram[3] || 0) + 4 * (histogram[4] || 0) + 5 * (histogram[5] || 0));
    const div = (histogram[1] || 0) + (histogram[2] || 0) + (histogram[3] || 0) + (histogram[4] || 0) + (histogram[5] || 0);
    if (mul != 0) {
        result = mul / div;
    }
    if (result > 0) {
        result = Math.floor((Math.floor(result * 100))) / 100;
    }
    return result;
}