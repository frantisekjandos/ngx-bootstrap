import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  forwardRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RATING_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  // tslint:disable-next-line
  useExisting: forwardRef(() => RatingComponent),
  multi: true
};

@Component({
  selector: 'rating',
  templateUrl: './rating.component.html',
  providers: [RATING_CONTROL_VALUE_ACCESSOR]
})
export class RatingComponent implements ControlValueAccessor, OnInit {
  /** number of icons */
  @Input() max = 5;
  /** selected icon class */
  @Input() stateOn: string;
  /** unselected icon class */
  @Input() stateOff: string;
  /** if true will not react on any user events */
  @Input() readonly: boolean;
  /** array of icons titles, default: (["one", "two", "three", "four", "five"]) */
  @Input() titles: string[];
  /** array of custom icons classes */
  @Input() ratingStates: { stateOn: string; stateOff: string }[];
  /** fired when icon selected, $event:number equals to selected rating */
  @Output() onHover: EventEmitter<number> = new EventEmitter();
  /** fired when icon selected, $event:number equals to previous rating value */
  @Output() onLeave: EventEmitter<number> = new EventEmitter();

  onChange: any = Function.prototype;
  onTouched: any = Function.prototype;

  range: any[];
  value: number;
  protected preValue: number;

  @HostListener('keydown', ['$event'])
  onKeydown(event: any): void {
    if ([37, 38, 39, 40].indexOf(event.which) === -1) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    const sign = event.which === 38 || event.which === 39 ? 1 : -1;
    this.rate(this.value + sign);
  }

  ngOnInit(): void {
    this.max = typeof this.max !== 'undefined' ? this.max : 5;
    this.readonly = this.readonly;
    this.stateOn =
      typeof this.stateOn !== 'undefined' ? this.stateOn : 'glyphicon-star';
    this.stateOff =
      typeof this.stateOff !== 'undefined'
        ? this.stateOff
        : 'glyphicon-star-empty';
    this.titles =
      typeof this.titles !== 'undefined' && this.titles.length > 0
        ? this.titles
        : ['one', 'two', 'three', 'four', 'five'];
    this.range = this.buildTemplateObjects(this.ratingStates, this.max);
  }

  // model -> view
  writeValue(value: number): void {
    if (value % 1 !== value) {
      this.value = Math.round(value);
      this.preValue = value;

      return;
    }

    this.preValue = value;
    this.value = value;
  }

  enter(value: number): void {
    if (!this.readonly) {
      this.value = value;
      this.onHover.emit(value);
    }
  }

  reset(): void {
    this.value = this.preValue;
    this.onLeave.emit(this.value);
  }

  registerOnChange(fn: (_: any) => {}): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => {}): void {
    this.onTouched = fn;
  }

  rate(value: number): void {
    if (!this.readonly && value >= 0 && value <= this.range.length) {
      this.writeValue(value);
      this.onChange(value);
    }
  }

  protected buildTemplateObjects(_ratingStates: any[], max: number): any[] {
    const ratingStates = _ratingStates || [];
    const count = ratingStates.length || max;
    const result: any[] = [];
    for (let i = 0; i < count; i++) {
      result.push(
        Object.assign(
          {
            index: i,
            stateOn: this.stateOn,
            stateOff: this.stateOff,
            title: this.titles[i] || i + 1
          },
          ratingStates[i] || {}
        )
      );
    }

    return result;
  }
}
