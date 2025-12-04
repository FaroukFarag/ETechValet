import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportRow {
  siteName: string;
  requestNo: string;
  createdTime: string;
  plateNumber: string;
  customerName: string;
  frontendBy: string;
  parkingBy: string;
  deliveryBy: string;
  carLocation: string;
  amount: string;
  paymentType: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
}

@Component({
  selector: 'app-settings-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent {
  filterOptions = {
    date: ['By shift', 'By day/night'],
    gate: ['All Gates', 'Main', 'A1', 'b2'],
    shift: ['Shift Type', 'Morning', 'Evening']
  };

  selectedFilters = {
    date: 'By shift',
    gate: 'All Gates',
    shift: 'Shift Type'
  };

  reports: ReportRow[] = Array.from({ length: 8 }).map((_, index) => ({
    siteName: 'King faisal specialist hospital and research center',
    requestNo: `46${index}`,
    createdTime: '2024-02-27 | 16:24:47',
    plateNumber: 'BGD4570',
    customerName: index % 2 === 0 ? 'Mohamed' : 'Salim',
    frontendBy: 'Mohamed',
    parkingBy: 'Mohamed',
    deliveryBy: 'Mohamed',
    carLocation: 'Samanoud',
    amount: '37 SAR',
    paymentType: index % 2 === 0 ? 'Cash' : 'Card',
    status: index % 3 === 0 ? 'Completed' : index % 3 === 1 ? 'Pending' : 'Cancelled'
  }));
}
