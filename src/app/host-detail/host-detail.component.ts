import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TrafficService }  from '../traffic.service';
import { sampleHost } from '../sample-host';

@Component({
  selector: 'app-host-detail',
  templateUrl: './host-detail.component.html',
  styleUrls: [ './host-detail.component.css' ]
})
export class HostDetailComponent implements OnInit {
  appName: string;
  host: any;
  boxes: Array<{key: string, value: string}> = [];

  constructor(
    private route: ActivatedRoute,
    private trafficService: TrafficService,
  ) {}

  ngOnInit(): void {
    this.getHostDetails();
  }

  getHostDetails(): void {
    this.host = null;
    this.appName = this.route.snapshot.paramMap.get('id');
    if (this.appName) {
      this.trafficService.getHost(this.appName).subscribe( data => {
        this.host = data;
        this.processData();
      });
    }
  }
  processData() {
    if (this.host) {
      this.boxes =[];
      this.boxes.push({
        key: 'Apps',
        value: this.host.apps.length || 0
      });
      this.boxes.push({
        key: 'Requests',
        value: this.host.count
      });
      this.boxes.push({
        key: 'https',
        value: this.host.schemes['https'] || 0
      });
      this.boxes.push({
        key: 'http',
        value: this.host.schemes['http'] || 0
      });
      this.boxes.push({
        key: 'PRI',
        value: this.host.methodTypes['PRI'] || 0
      });
      this.boxes.push({
        key: 'GET',
        value: this.host.methodTypes['GET'] || 0
      });
      this.boxes.push({
        key: 'POST',
        value: this.host.methodTypes['POST'] || 0
      });
    }
  }

}
