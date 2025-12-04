import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ExtraService {
  id: number;
  name: string;
  cost: number | string;
}

@Component({
  selector: 'app-services-grid',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-grid.component.html',
  styleUrls: ['./services-grid.component.scss']
})
export class ServicesGridComponent {
  @Input() services: ExtraService[] = [];
  @Output() serviceMenuClick = new EventEmitter<ExtraService>();

  onMenuClick(service: ExtraService, event: Event) {
    event.stopPropagation();
    this.serviceMenuClick.emit(service);
  }

  formatCost(cost: number | string): string {
    if (cost == null || cost === '' || cost === 'None') {
      return '0 SAR';
    }
    
    if (typeof cost === 'number') {
      return `${cost} SAR`;
    }
    
    if (typeof cost === 'string') {
      const normalized = cost.replace(/[^0-9.-]/g, '');
      if (normalized) {
        return `${normalized} SAR`;
      }
      return cost.includes('SAR') ? cost : `${cost} SAR`;
    }
    
    return '0 SAR';
  }
}
















