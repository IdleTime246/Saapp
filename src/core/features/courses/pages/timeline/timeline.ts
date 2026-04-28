// (C) Copyright 2015 Moodle Pty Ltd.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Savio: Standalone Timeline page reusing block component logic directly.
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CoreSharedModule } from '@/core/shared.module';
import {
    AddonBlockTimelineComponent,
    AddonBlockTimelineSort,
} from '@addons/block/timeline/components/timeline/timeline';
import { AddonBlockTimelineEventsComponent } from '@addons/block/timeline/components/events/events';
import { CoreSearchBoxComponent } from '@features/search/components/search-box/search-box';
import { CoreMainMenuUserButtonComponent } from '@features/mainmenu/components/user-menu-button/user-menu-button';
import { CoreSiteLogoComponent } from '../../../../components/site-logo/site-logo';

/**
 * Savio: Timeline page — shows upcoming course activities as a main tab.
 * Extends AddonBlockTimelineComponent to reuse all its logic.
 */
@Component({
    selector: 'page-savio-timeline',
    templateUrl: 'timeline.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CoreSharedModule,
        CoreMainMenuUserButtonComponent,
        CoreSiteLogoComponent,
        CoreSearchBoxComponent,
        AddonBlockTimelineEventsComponent,
    ],
})
export default class SavioTimelinePage extends AddonBlockTimelineComponent {

    get AddonBlockTimelineSortRef(): typeof AddonBlockTimelineSort {
        return AddonBlockTimelineSort;
    }

}
