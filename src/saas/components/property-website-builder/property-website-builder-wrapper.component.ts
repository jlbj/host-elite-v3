import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyWebsiteBuilderComponent } from './property-website-builder.component';
import { TranslatePipe } from '../../../pipes/translate.pipe';

@Component({
    selector: 'app-property-website-builder-wrapper',
    standalone: true,
    imports: [CommonModule, TranslatePipe, PropertyWebsiteBuilderComponent],
    template: `
        <app-property-website-builder 
            [propertyName]="propertyName()"
            (close)="close.emit()">
        </app-property-website-builder>
    `
})
export class PropertyWebsiteBuilderWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();
}
