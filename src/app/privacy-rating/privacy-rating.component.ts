import { Component, Input } from '@angular/core';

@Component({
    selector: 'privacy-rating',
    templateUrl: 'privacy-rating.component.html',
    styleUrls: [ './privacy-rating.component.scss' ]
})
export class PrivacyRatingComponent {
    @Input() rating = null;
}