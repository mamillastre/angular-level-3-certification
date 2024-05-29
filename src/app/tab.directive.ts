import { Directive, EventEmitter, Input, Output, TemplateRef, booleanAttribute, inject } from '@angular/core';

/**
 * A tab element inside a TabsComponent
 * Apply this directive on a ng-template (to manage lazy-loading) directly inside the app-tabs component.
 * 
 * @example
 * <ng-template appTab="uniqueTabId" appTabLabel="Title of the tab" appTabClosable (appTabOnClosed)="doExtraAction()">
 *   My tab content
 * </ng-template>
 * 
 * @example You can also use the structural directive syntax. But the ng-template syntax is preferred since it can manage directive's outputs
 * <div *appTab="'uniqueTabIdWithStructuralDirectiveSyntax'; label: 'Title'">
 *   My tab content
 * </div>
 */
@Directive({
  selector: 'app-tabs > ng-template[appTab]',
  standalone: true
})
export class TabDirective {

  /** The tab unique id */
  @Input({required: true, alias: 'appTab'}) id!: string;

  /** The tab label */
  @Input({required: true, alias: 'appTabLabel'}) label!: string;

  /** Is the tab closable. False by default */
  @Input({alias: 'appTabClosable', transform: booleanAttribute}) closable = false;

  /** Fired when the tab is closed */
  @Output('appTabOnClosed') onClosed = new EventEmitter<void>();

  templateRef = inject(TemplateRef<void>);

  /** Is the tab closed */
  protected isClosed = false;

  /**
   * Close the tab
   */
  close(): void {
    this.isClosed = true;
    this.onClosed.emit();
  }

}
