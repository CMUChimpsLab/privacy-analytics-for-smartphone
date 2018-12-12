import { Component, Input, OnInit } from '@angular/core';
import { TrafficService } from '../../traffic.service';

@Component({
    selector: 'app-top-10-list',
    templateUrl: './top-10-list.component.html',
    styleUrls: ['./top-10-list.component.scss']
})
export class Top10ListComponent implements OnInit {
    @Input() data;
    @Input() title;
    @Input() color;
    constructor(private trafficService: TrafficService) {}
    ngOnInit() {
    }
}