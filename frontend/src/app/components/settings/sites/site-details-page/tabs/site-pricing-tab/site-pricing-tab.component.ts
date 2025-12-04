import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SiteDto } from '../../../../../../services/sites.service';
import { PricingTableComponent, PricingRow } from './pricing-table/pricing-table.component';

@Component({
  selector: 'app-site-pricing-tab',
  standalone: true,
  imports: [CommonModule, PricingTableComponent],
  templateUrl: './site-pricing-tab.component.html',
  styleUrls: ['./site-pricing-tab.component.scss']
})
export class SitePricingTabComponent {
  @Input() site: SiteDto | null = null;
  @Output() editPricing = new EventEmitter<PricingRow>();
  @ViewChild(PricingTableComponent) pricingTableComponent!: PricingTableComponent;

  onExport() {
    console.log('Export pricing data');
    // TODO: Implement export functionality
  }

  onAddPricing() {
    // This will be handled by the parent component
    // The parent will open the drawer at its level
  }

  onMenuClick(event: { row: PricingRow; action: string }) {
    console.log('Menu action:', event.action, 'for row:', event.row);
    if (event.action === 'edit') {
      this.editPricing.emit(event.row);
    }
  }
}

