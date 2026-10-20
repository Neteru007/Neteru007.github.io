import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  viewChild,
  afterNextRender,
  output,
} from '@angular/core';
@Component({
  selector: 'mg-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  readonly closed = output<void>();
  private readonly element = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  constructor() {
    afterNextRender(() => this.element().nativeElement.showModal());
  }
  close() {
    this.element().nativeElement.close();
  }
}
