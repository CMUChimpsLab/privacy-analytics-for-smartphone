import { Component, Input, OnInit } from '@angular/core'
import { SearchAllAppsResult } from './sample';

@Component({
    selector: 'all-apps',
    templateUrl: './all-apps.component.html',
    styleUrls: [ './all-apps.component.scss' ]
})
export class AllAppsComponent implements OnInit {
    @Input() taxonomy;
    apps = [];
    constructor() {}
    ngOnInit() {
        this.apps = SearchAllAppsResult;
    }
}