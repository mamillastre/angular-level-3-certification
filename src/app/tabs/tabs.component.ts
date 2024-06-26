import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, ElementRef, QueryList, inject, signal } from '@angular/core';
import { TabDirective } from 'app/tab.directive';

/**
 * A generic tabs management component.
 * The tab content is lazy loaded when the tab is active.
 * Use the TabDirective to manage the tabs in this component.
 * 
 * @example
 * <app-tabs>
 *   <ng-template appTab="uniqueTabId" appTabLabel="Title of the tab">
 *     Tab 1 content
 *   </ng-template>
 *   <ng-template appTab="anOtherUniqueTabId" appTabLabel="A closable tab with a closed event" appTabClosable (appTabOnClosed)="doExtraAction()">
 *     Tab 2 content
 *   </ng-template>
 * </app-tabs>
 */
@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [NgClass, NgIf, NgFor, NgTemplateOutlet],
  templateUrl: './tabs.component.html',
  styleUrl: './tabs.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TabsComponent implements AfterViewInit {

  @ContentChildren(TabDirective) tabsQuery!: QueryList<TabDirective>;
  
  protected tabDirectives = signal<TabDirective[]>([]);

  /** The active tab */
  protected activeTab = signal<TabDirective | null>(null);

  /** The focused tab for keyboard navigation. If null, use the active tab */
  protected focusedTab = signal<TabDirective | null>(null);

  private elementRef = inject(ElementRef<HTMLElement>);
  
  async ngAfterViewInit(): Promise<void> {

    // Init the available tabs
    this.tabDirectives.set(this.tabsQuery.toArray());

    // Init the activate tab
    if (this.tabDirectives()[0]) {
      this.activeTab.set(this.tabDirectives()[0]);
    }

    // Manage the tab updates
    this.tabsQuery.changes.subscribe(() => {
      this.tabDirectives.set(this.tabsQuery.toArray());

      // Reinit the active tab if there is no activated element or if the tab does not exists anymore
      if (!this.activeTab() || !this.tabDirectives().find(d => d.id === this.activeTab().id)) {
        this.activeTab.set(this.tabDirectives()[0] ?? null);
      }

      this.focusedTab.set(null);
    });
  }

  /**
   * Select a tab
   * @param tab The tab directive to select. null to unselect all tabs
   */
  protected selectTab(tab: TabDirective | null): void {
    this.activeTab.set(tab);
    this.focusedTab.set(null);
  }

  /**
   * Close a tab from the view
   */
  protected closeTab(tab: TabDirective): void {
    // Compute the tab to activate if the closed tab is active (Next tab, then previous tab, then first tab, else deselect all tabs)
    if (tab.id === this.activeTab().id) {
      const tabs = this.tabDirectives();
      const currentTabIndex = tabs.findIndex(t => t.id === tab.id);
      this.selectTab(tabs[currentTabIndex + 1] ?? tabs[currentTabIndex - 1] ?? tabs[0] ?? null);
    }

    // Close the tab
    tab.close();
  }

  /**
   * Manage the keyboard navigation on the tabs using the left & right arrows
   * More detail here: https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role
   * @param event A Keyboard event
   */
  protected onTabListKeydown(event: KeyboardEvent): void {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const tabs = this.tabDirectives();
      const focusedTabId = this.focusedTab()?.id ?? this.activeTab()?.id;
      const focusedIndex = tabs.findIndex(t => t.id === focusedTabId);

      // Compute the new focused index by adding or removing 1 to the current index.
      // The new index can be "-1" or "tabs.length+1". It is managed by a modulo of the tabs length. The tabs length is also added to manage the negative "-1" number.
      const newFocusedIndex = (focusedIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;

      this.focusedTab.set(
        tabs[newFocusedIndex]
      );

      // Force the focus on the new tab
      this.elementRef.nativeElement.querySelector(`#tab-${this.focusedTab()?.id}`)?.focus?.();
    }
  }

  protected trackByTabId(index: number, tab: TabDirective): string {
    return tab.id;
  }
}
