import { Injectable, Inject, Optional } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, Subject } from 'rxjs';
import { COLORS } from "./data";
import { GetColorsFn } from "./support";
import { GetDashboardDataForUpperTaxonomy, GetExtDataForTaxonomy } from './taxonomy/support';
import { ALL_DETAILS } from './taxonomy-details';
import { DashboardData } from './all-taxonomies/support';
declare var d3: any;

const USE_SAMPLE = true;

@Injectable()
export class TrafficService {

	private hostsApiUrl = 'api/hosts';
	private hostOnlyApiUrl = 'api/host';
	private appUrl = 'api/taxonomies';
	taxonomyStore = [];
	dashboardView = new Subject();
	dashboardView$ = this.dashboardView.asObservable();
	appDetails = new Subject();
	appDetails$ = this.appDetails.asObservable();
	showTaxonomyDetails = new Subject();
	showTaxonomyDetails$ = this.showTaxonomyDetails.asObservable();
	taxonomyChanged = new Subject();
	taxonomyChanged$ = this.taxonomyChanged.asObservable();
	currentRoute = new Subject();
	currentRoute$ = this.currentRoute.asObservable();
	constructor(
		private http: HttpClient,
		@Optional() @Inject(APP_BASE_HREF) origin: string) {
		this.hostsApiUrl = origin ? `${origin}${this.hostsApiUrl}` : this.hostsApiUrl;
	}

	init() {
		this.taxonomyStore = [];
		ALL_DETAILS.forEach((x, i) => {
			if (!x.label) {
				x.label = x.name;
			}
			let taxonomies = [];
			let color = d3.color(COLORS[i]);
			if (x.taxonomies.length > 0) {
				const internalColors = GetColorsFn(color.hex(), color.brighter(2).hex(), x.taxonomies.length + 1);
				taxonomies = (x.taxonomies as Array<any>).map((y, j) => {
					if (!y.label) {
						y.label = y.name;
					}
					return {
						label: y.label,
						name: y.name,
						_pid: x.name,
						_pIndex: i,
						icon: y.icon,
						purposes: y.purposes,
						outlineIcon: `outline-${y.icon}`,
						description: y.description
					};
				});
				taxonomies.forEach((x, i) => { x.color = internalColors(i) })
			}
			this.taxonomyStore.push({
				label: x.label,
				name: x.name,
				taxonomies: taxonomies,
				color: color.hex(),
				icon: x.icon,
				outlineIcon: `outline-${x.icon}`,
				description: x.description
			});
		});
	}

	getHostsList(sort, count): Observable<any[]> {
		return this.http.get<any[]>(this.hostsApiUrl + `?parameter=list&count=${count}&sort=${sort}`)
	}
	getHost(id: string): Observable<any[]> {
		return this.http.get<any[]>(this.hostOnlyApiUrl + `/${id}`);
	}
	getDashboardData(dataCategory?): Observable<any> {
		let url = this.appUrl + '/dashboard';
		if (dataCategory) {
			url += `/${dataCategory}`;
			if (USE_SAMPLE) {
				return of(GetDashboardDataForUpperTaxonomy());
			}
		} else {
			url += `/all`;
			if (USE_SAMPLE) {
				return of(DashboardData);
			}
		}
		return this.http.get<any[]>(url);
	}
	getTaxonomyData(dataCategory, innerCategory): Observable<any> {
		let url = `${this.appUrl}/detail/${dataCategory}/${innerCategory}`;
		if (USE_SAMPLE) {
			return of(GetExtDataForTaxonomy());
		}
		return this.http.get<any[]>(url);
	}
	getAppDataFromTweak(app) {
		let url = `https://data.42matters.com/api/v2.0/android/apps/lookup.json`;
		let url2 = `https://data.42matters.com/api/v2.0/android/apps/lookup.json?p=${app}&access_token=621357fb7d1bcbf5aff55f2cdef7395af6e5422f`;
		return this.http.get<any[]>(url2);	
	}
	getAppTaxonomyTransform(app) {
		app.taxonomies.forEach(x => {
			const splits = x.split('.');
            const parent = this.taxonomyStore.find(x => x.name === splits[0]);
            if (parent) {
                const child = parent.taxonomies.find(x => x.name === splits[1]);
                if (child) {
                    app.mappedTaxonomies.push({
						label: child.label,
                        icon: child.icon,
                        outlineIcon: `outline-${child.icon}`,
                        color: child.color,
                        name: child.name
                    });
                }
            }
		});
		return app;
	}
	getJelloApiData(taxonomy) {
		let url = `/api/taxonomies/jello/${taxonomy}`;
		return this.http.get<any[]>(url);	
	}
	getSearchApiData(params) {
		let url = `/api/taxonomies/search`;
		return this.http.post<any[]>(url, params);
	}
	getAppApiData(packageId) {
		let url = `/api/taxonomies/app/${packageId}`;
		return this.http.get<any[]>(url);
	}
	getAppSearchMetaData() {
		let url = `/api/taxonomies/searchMetaData`;
		return this.http.get<any[]>(url);
	}
}
