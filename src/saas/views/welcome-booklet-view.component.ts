import { Component, inject, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletService } from './welcome-booklet/welcome-booklet.service';
import { WelcomeBookletEditorComponent } from './welcome-booklet/components/welcome-booklet-editor.component';
import { WelcomeBookletListingComponent } from './welcome-booklet/components/welcome-booklet-listing.component';
import { WelcomeBookletMicrositeComponent } from './welcome-booklet/components/welcome-booklet-microsite.component';
import { WelcomeBookletPreviewComponent } from './welcome-booklet/components/welcome-booklet-preview.component';
import { TranslationService } from '../../services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
    selector: 'saas-welcome-booklet-view',
    standalone: true,
    imports: [
        CommonModule,
        WelcomeBookletEditorComponent,
        WelcomeBookletListingComponent,
        WelcomeBookletMicrositeComponent,
        WelcomeBookletPreviewComponent,
        TranslatePipe
    ],
    templateUrl: './welcome-booklet-view.component.html',
})
export class WelcomeBookletViewComponent implements OnInit {
    translationService = inject(TranslationService);
    service = inject(WelcomeBookletService);

    @Input() set propertyName(value: string) {
        this.service.propertyName.set(value);
    }

    @Input() hideTabs = false;

    activeTab = this.service.activeTab;
    isLoading = this.service.isLoading;
    saveMessage = this.service.saveMessage;

    ngOnInit() {
        // Force reload REMOVED: Service effect already handles loading when propertyName changes.
        // Calling it here overwrites local state (e.g. from AI tool save) with stale DB data.
        // this.refreshData(); 
    }

    setActiveTab(tab: 'edit' | 'listing' | 'microsite' | 'booklet') {
        this.service.activeTab.set(tab);
    }

    save() {
        this.service.save();
    }

    refreshData() {
        const name = this.service.propertyName();
        if (name) {
            this.service.loadData(name);
        }
    }
}
