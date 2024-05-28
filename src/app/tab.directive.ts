import { Directive, Input, TemplateRef, booleanAttribute, inject } from '@angular/core';

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

  templateRef = inject(TemplateRef<void>);

}
