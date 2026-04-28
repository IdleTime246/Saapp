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

// Savio: Home delegate handler for the Timeline tab.
// This replaces the SiteHome with an Activities/Timeline view.

import { Injectable } from '@angular/core';
import { CoreMainMenuHomeHandler, CoreMainMenuHomeHandlerToDisplay } from '@features/mainmenu/services/home-delegate';
import { makeSingleton } from '@singletons';

export const SAVIO_TIMELINE_HOME_PAGE_NAME = 'savio-timeline';

/**
 * Handler to add Timeline into home page.
 * Savio: shown as the second tab (replacing the old Categorías/SiteHome tab).
 */
@Injectable({ providedIn: 'root' })
export class SavioTimelineHomeHandlerService implements CoreMainMenuHomeHandler {

    name = 'SavioTimeline';
    priority = 1100; // Same as the former SiteHome handler it replaces.

    /**
     * @inheritdoc
     */
    async isEnabled(): Promise<boolean> {
        return true;
    }

    /**
     * @inheritdoc
     */
    getDisplayData(): CoreMainMenuHomeHandlerToDisplay {
        return {
            title: 'Actividades pendientes',
            page: SAVIO_TIMELINE_HOME_PAGE_NAME,
            class: 'savio-timeline-home-handler',
            icon: 'fas-list-check', // Activities icon — relates to upcoming tasks.
        };
    }

}

export const SavioTimelineHomeHandler = makeSingleton(SavioTimelineHomeHandlerService);
