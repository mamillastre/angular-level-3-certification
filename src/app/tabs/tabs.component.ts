import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, ContentChildren, ElementRef, QueryList, inject, signal } from '@angular/core';
import { TabDirective } from 'app/tab.directive';

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
   * @param tab The tab directive to select
   */
  protected selectTab(tab: TabDirective): void {
    this.activeTab.set(tab);
    this.focusedTab.set(null);
  }

  /**
   * Remove a tab from the view
   */
  protected removeTab(tab: TabDirective): void {
    console.log('REMOVE', tab);
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
