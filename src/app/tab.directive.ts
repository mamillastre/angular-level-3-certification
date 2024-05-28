import { Directive, EventEmitter, Input, Output, TemplateRef, booleanAttribute, inject } from '@angular/core';

/**
 * A tab element inside a TabsComponent
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
