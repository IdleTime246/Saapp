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

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { CoreSites } from '@services/sites';
import { CoreQRScan } from '@services/qrscan';
import { CoreMainMenuDelegate, CoreMainMenuHandlerData, CoreMainMenuHandlerToDisplay } from '../../services/mainmenu-delegate';
import { CoreMainMenu, CoreMainMenuCustomItem } from '../../services/mainmenu';
import { CoreEventObserver, CoreEvents } from '@singletons/events';
import { CoreNavigator } from '@services/navigator';
import { Translate } from '@singletons';
import { CoreDom } from '@singletons/dom';
import { CorePlatform } from '@services/platform';
import { CoreAlerts } from '@services/overlays/alerts';
import { CoreViewer } from '@features/viewer/services/viewer';
import { CoreSharedModule } from '@/core/shared.module';
import { CoreContentLinksHelper } from '@features/contentlinks/services/contentlinks-helper';
import { CoreUrl } from '@singletons/url';
import { CoreSiteInfo } from '@classes/sites/unauthenticated-site';
import { CoreUser, CoreUserProfile } from '@features/user/services/user';
import {
    CoreUserDelegate,
    CoreUserDelegateContext,
    CoreUserProfileHandlerType,
    CoreUserProfileHandlerData,
} from '@features/user/services/user-delegate';
import { GRADES_PAGE_NAME } from '@features/grades/constants';
import { CoreReminders, CoreRemindersService } from '@features/reminders/services/reminders';
import { REMINDERS_DISABLED } from '@features/reminders/constants';
import { CorePopovers } from '@services/overlays/popovers';

/**
 * Page that displays the more page of the app.
 */
@Component({
    selector: 'page-core-mainmenu-more',
    templateUrl: 'more.html',
    styleUrl: 'more.scss',
    imports: [
        CoreSharedModule,
    ],
})
export default class CoreMainMenuMorePage implements OnInit, OnDestroy {

    handlers?: CoreMainMenuHandlerData[];
    handlersLoaded = false;
    showScanQR: boolean;
    customItems?: CoreMainMenuCustomItem[];
    siteInfo?: CoreSiteInfo;
    user?: CoreUserProfile;
    isIOS: boolean;
    defaultTimeLabel = '';

    protected defaultTime?: number;
    protected allHandlers?: CoreMainMenuHandlerToDisplay[];
    protected subscription!: Subscription;
    protected userSubscription?: Subscription;
    protected langObserver: CoreEventObserver;
    protected updateSiteObserver: CoreEventObserver;
    protected resizeListener?: CoreEventObserver;

    constructor() {
        this.langObserver = CoreEvents.on(CoreEvents.LANGUAGE_CHANGED, () => this.loadCustomMenuItems());

        this.updateSiteObserver = CoreEvents.on(CoreEvents.SITE_UPDATED, async () => {
            this.customItems = await CoreMainMenu.getCustomMenuItems();
            this.loadUserData();
        }, CoreSites.getCurrentSiteId());

        this.loadCustomMenuItems();
        this.loadUserData();

        this.showScanQR = CoreQRScan.canScanQR() &&
            !CoreSites.getCurrentSite()?.isFeatureDisabled('CoreMainMenuDelegate_QrReader');

        this.isIOS = CorePlatform.isIOS();
    }

    /**
     * Load user data for the current site.
     */
    protected async loadUserData(): Promise<void> {
        const currentSite = CoreSites.getCurrentSite();
        if (!currentSite) {
            return;
        }

        this.siteInfo = currentSite.getInfo();
        if (!this.siteInfo) {
            return;
        }

        try {
            this.user = await CoreUser.getProfile(this.siteInfo.userid);
        } catch {
            this.user = {
                id: this.siteInfo.userid,
                fullname: this.siteInfo.fullname,
            };
        }

        this.userSubscription?.unsubscribe();
        this.userSubscription = CoreUserDelegate.getProfileHandlersFor(this.user, CoreUserDelegateContext.USER_MENU)
            .subscribe(() => {
                this.initHandlers();
            });
    }

    /**
     * @inheritdoc
     */
    ngOnInit(): void {
        // Load the handlers.
        this.subscription = CoreMainMenuDelegate.getHandlersObservable().subscribe((handlers) => {
            this.allHandlers = handlers;

            this.initHandlers();
        });

        this.resizeListener = CoreDom.onWindowResize(() => {
            this.initHandlers();
        });

        CoreSites.loginNavigationFinished();
        this.updateDefaultTimeLabel();
    }

    /**
     * @inheritdoc
     */
    ngOnDestroy(): void {
        this.langObserver?.off();
        this.updateSiteObserver?.off();
        this.subscription?.unsubscribe();
        this.resizeListener?.off();
    }

    /**
     * Init handlers on change (size or handlers).
     */
    userHandlers: CoreUserProfileHandlerData[] = [];
    mainHandlers: CoreMainMenuHandlerData[] = [];
    otherHandlers: CoreMainMenuHandlerData[] = [];

    /**
     * Init handlers on change (size or handlers).
     */
    initHandlers(): void {
        if (!this.allHandlers || !this.user) {
            return;
        }

        const numItems = CoreMainMenu.getNumItems();

        // Filter out unwanted items: Blog, Marks, etc.
        const unwantedNames = [
            'AddonBlog', 'CoreTag', 'AddonBadges', 'CoreUserDelegate_CoreBlog',
            'CoreUserDelegate_CoreFiles', 'CoreUserDelegate_CoreNotes', 'CoreUserDelegate_CoreUserInsights',
            'CoreCalendar',
        ];

        // Get main handlers that ARE NOT in the bottom bar.
        this.mainHandlers = this.allHandlers
            .filter((handler) => !handler.onlyInMore)
            .slice(numItems)
            .filter((handler) => !handler.name || !unwantedNames.includes(handler.name));

        // Get other handlers (services like Calendar, Blog, etc.).
        this.otherHandlers = this.allHandlers.filter((handler) => {
            if (handler.onlyInMore) {
                return !handler.name || !unwantedNames.includes(handler.name);
            }

            return false;
        });

        // Filter user handlers for Grades.
        this.userSubscription?.unsubscribe();
        this.userSubscription = CoreUserDelegate.getProfileHandlersFor(this.user, CoreUserDelegateContext.USER_MENU)
            .subscribe((handlers) => {
                this.userHandlers = handlers
                    .filter((h) => h.type === CoreUserProfileHandlerType.LIST_ITEM && h.data.title === 'core.grades.grades')
                    .map((h) => h.data);
            });

        this.handlersLoaded = CoreMainMenuDelegate.areHandlersLoaded() &&
            CoreUserDelegate.areHandlersLoaded(this.user.id, CoreUserDelegateContext.USER_MENU);
    }

    /**
     * Load custom menu items.
     */
    protected async loadCustomMenuItems(): Promise<void> {
        this.customItems = await CoreMainMenu.getCustomMenuItems();
    }

    /**
     * Open a handler.
     *
     * @param handler Handler to open.
     */
    openHandler(handler: CoreMainMenuHandlerData): void {
        const params = handler.pageParams;

        CoreNavigator.navigateToSitePath(handler.page, { params });
    }

    /**
     * Open an embedded custom item.
     *
     * @param item Item to open.
     */
    openItem(item: CoreMainMenuCustomItem): void {
        CoreViewer.openIframeViewer(item.label, item.url);
    }

    /**
     * Open settings section.
     *
     * @param path Path to the section.
     * @param params Params to pass to the section.
     */
    openSettings(path: string = '', params?: Record<string, unknown>): void {
        CoreNavigator.navigateToSitePath(`settings/${path}`, { params });
    }

    /**
     * Open grades.
     */
    openGrades(): void {
        CoreNavigator.navigateToSitePath(GRADES_PAGE_NAME);
    }

    /**
     * Open preferences.
     */
    openPreferences(): void {
        CoreNavigator.navigateToSitePath('preferences');
    }

    /**
     * Logout the user.
     */
    async logout(): Promise<void> {
        try {
            await CoreAlerts.confirm('¿Estás seguro de que deseas cerrar sesión?');
        } catch {
            // User cancelled, stop.
            return;
        }

        await CoreSites.logout();
    }

    /**
     * Scan and treat a QR code.
     */
    async scanQR(): Promise<void> {
        // Scan for a QR code.
        const text = await CoreQRScan.scanQRWithUrlHandling();

        if (!text) {
            return;
        }

        // Check if it's a URL.
        if (/^[^:]{2,}:\/\/[^ ]+$/i.test(text)) {
            await CoreContentLinksHelper.visitLink(CoreUrl.decodeURI(text), {
                checkRoot: true,
                openBrowserRoot: true,
            });
        } else {
            // It's not a URL, open it in a modal so the user can see it and copy it.
            CoreViewer.viewText(Translate.instant('core.qrscanner'), text, {
                displayCopyButton: true,
            });
        }
    }

    /**
     * Change default time.
     *
     * @param e Event.
     * @returns Promise resolved when done.
     */
    async changeDefaultTime(e: Event): Promise<void> {
        e.stopPropagation();
        e.stopImmediatePropagation();
        e.preventDefault();

        const { CoreRemindersSetReminderMenuComponent } =
            await import('@features/reminders/components/set-reminder-menu/set-reminder-menu');

        const reminderTime = await CorePopovers.open<{ timeBefore: number }>({
            component: CoreRemindersSetReminderMenuComponent,
            componentProps: {
                initialValue: this.defaultTime,
                noReminderLabel: 'core.settings.disabled',
            },
            event: e,
        });

        if (reminderTime === undefined) {
            // User canceled.
            return;
        }

        await CoreReminders.setDefaultNotificationTime(reminderTime.timeBefore ?? REMINDERS_DISABLED);
        this.updateDefaultTimeLabel();
    }

    /**
     * Update default time label.
     */
    async updateDefaultTimeLabel(): Promise<void> {
        this.defaultTime = await CoreReminders.getDefaultNotificationTime();

        const defaultTime = CoreRemindersService.convertSecondsToValueAndUnit(this.defaultTime);
        this.defaultTimeLabel = CoreReminders.getUnitValueLabel(defaultTime.value, defaultTime.unit);
    }

}
