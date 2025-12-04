import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Gate {
  id: number;
  name: string;
  status: 'Active' | 'Inactive';
}

@Component({
  selector: 'app-gates-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gates-grid.component.html',
  styleUrls: ['./gates-grid.component.scss']
})
export class GatesGridComponent {
  @Input() gates: Gate[] = [];
  @Output() gateMenuClick = new EventEmitter<Gate>();

  onMenuClick(gate: Gate, event: Event) {
    event.stopPropagation();
    this.gateMenuClick.emit(gate);
  }
}


