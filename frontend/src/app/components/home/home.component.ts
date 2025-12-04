import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PickupRequestsService } from '../../services/pickup-requests.service';
import { GatesService } from '../../services/gates.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  userName = 'Ahmed'; // This should be fetched from auth service
  dateFrom = '';
  dateTo = '';
  isLoadingTopCustomerType = false;
  isLoadingTotalParkedCars = false;
  isLoadingAverageParkingTime = false;
  isLoadingActiveGate = false;
  isLoadingTotalRevenue = false;
  dateErrorMessage = '';

  constructor(
    private pickupRequestsService: PickupRequestsService,
    private gatesService: GatesService
  ) {
    // Set default dates (today)
    const today = new Date();
    this.dateTo = today.toISOString().split('T')[0];
    
    // Set dateFrom to 7 days ago
    const weekAgo = new Date();
    weekAgo.setDate(today.getDate() - 7);
    this.dateFrom = weekAgo.toISOString().split('T')[0];
  }

  ngOnInit(): void {
    this.loadTopCustomerType();
    this.loadTotalParkedCars();
    this.loadAverageParkingTime();
    this.loadActiveGate();
    this.loadTotalRevenue();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  stats = [
    {
      icon: 'car',
      title: 'Total Cars Parked',
      value: '375',
      iconColor: '#2563EB',
      iconBg: '#EFF6FF'
    },
    {
      icon: 'clock',
      title: 'Average Parking Time',
      value: '2h 45min',
      iconColor: '#059669',
      iconBg: '#ECFDF5'
    },
    {
      icon: 'dollar',
      title: 'Total Revenue',
      value: 'SAR 9,850',
      iconColor: '#D97706',
      iconBg: '#FFFBEB'
    },
    {
      icon: 'gate',
      title: 'Most Active Gate',
      value: 'Main Gate A',
      iconColor: '#7C3AED',
      iconBg: '#F5F3FF'
    },
    {
      icon: 'user',
      title: 'Top Customer Type',
      value: 'Guest',
      iconColor: '#DC2626',
      iconBg: '#FEF2F2'
    }
  ];

  quickStats = [
    { label: 'Total Revenue', value: '10,000 SAR', color: '#7C3AED' },
    { label: 'Total Cash', value: '10,000 SAR', color: '#10B981' },
    { label: 'Online Payments', value: '10,000 SAR', color: '#2563EB' },
    { label: 'POS Transactions', value: '10 SAR', color: '#F97316' },
    { label: 'Recalls', value: '1,000', color: '#F87171' },
    { label: 'Pickups', value: '1,300', color: '#6366F1' }
  ];

  // Hours from 8 AM to 1 AM (next day)
  hours = ['8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM', '12 AM', '1 AM'];

  // Sample data for chart - Pickups and Recalls for each hour
  chartData = [
    { hour: '8 AM', pickups: 12, recalls: 8 },
    { hour: '9 AM', pickups: 15, recalls: 10 },
    { hour: '10 AM', pickups: 18, recalls: 14 },
    { hour: '11 AM', pickups: 22, recalls: 16 },
    { hour: '12 PM', pickups: 28, recalls: 20 },
    { hour: '1 PM', pickups: 35, recalls: 28 },
    { hour: '2 PM', pickups: 30, recalls: 25 },
    { hour: '3 PM', pickups: 25, recalls: 22 },
    { hour: '4 PM', pickups: 32, recalls: 26 },
    { hour: '5 PM', pickups: 38, recalls: 30 },
    { hour: '6 PM', pickups: 42, recalls: 35 },
    { hour: '7 PM', pickups: 40, recalls: 32 },
    { hour: '8 PM', pickups: 35, recalls: 28 },
    { hour: '9 PM', pickups: 28, recalls: 22 },
    { hour: '10 PM', pickups: 20, recalls: 18 },
    { hour: '11 PM', pickups: 15, recalls: 12 },
    { hour: '12 AM', pickups: 10, recalls: 8 },
    { hour: '1 AM', pickups: 5, recalls: 4 }
  ];

  getMaxValue(): number {
    return Math.max(
      ...this.chartData.map(d => Math.max(d.pickups, d.recalls))
    );
  }

  getBarHeight(value: number): number {
    const maxHeight = 220; // Max bar height in pixels
    return (value / this.getMaxValue()) * maxHeight;
  }

  openDatePicker(input: HTMLInputElement) {
    if ((input as any)?.showPicker) {
      (input as any).showPicker();
    } else {
      input.click();
    }
  }

  onDateChange(): void {
    // Clear any previous error messages
    this.dateErrorMessage = '';

    if (this.dateFrom && this.dateTo) {
      // Validate that dates are not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
      
      const selectedDateFrom = new Date(this.dateFrom);
      const selectedDateTo = new Date(this.dateTo);
      
      // Check if dateFrom is in the future
      if (selectedDateFrom > today) {
        this.dateErrorMessage = 'Please select an available date. Start date cannot be in the future.';
        return;
      }
      
      // Check if dateTo is in the future
      if (selectedDateTo > today) {
        this.dateErrorMessage = 'Please select an available date. End date cannot be in the future.';
        return;
      }
      
      // Check if dateFrom is after dateTo
      if (selectedDateFrom > selectedDateTo) {
        this.dateErrorMessage = 'Start date cannot be after end date.';
        return;
      }
      
      // If all validations pass, load the data
      this.loadTopCustomerType();
      this.loadTotalParkedCars();
      this.loadAverageParkingTime();
      this.loadActiveGate();
      this.loadTotalRevenue();
    }
  }

  // Customer type mapping - adjust values based on your backend
  customerTypeMap: { [key: number]: string } = {
    1: 'Regular',
    2: 'VIP',
    3: 'Premium',
    4: 'Corporate',
    5: 'Guest'
  };

  getCustomerTypeName(typeId: number): string {
    return this.customerTypeMap[typeId] || `Type ${typeId}`;
  }

  loadTopCustomerType(): void {
    if (!this.dateFrom || !this.dateTo) {
      return;
    }

    this.isLoadingTopCustomerType = true;
    this.pickupRequestsService.getTopCustomerType(this.dateFrom, this.dateTo).subscribe({
      next: (response) => {
        this.isLoadingTopCustomerType = false;
        // Update the Top Customer Type stat
        const topCustomerTypeStat = this.stats.find(stat => stat.icon === 'user');
        if (topCustomerTypeStat) {
          // Handle numeric customerType from API response
          const customerTypeId = response?.data?.customerType ?? response?.customerType;
          if (customerTypeId !== undefined && customerTypeId !== null) {
            topCustomerTypeStat.value = this.getCustomerTypeName(customerTypeId);
          } else {
            // Fallback to name if available
            const customerTypeName = response?.data?.name || response?.name || response?.customerTypeName || 'N/A';
            topCustomerTypeStat.value = customerTypeName;
          }
        }
      },
      error: (error) => {
        console.error('Failed to load top customer type', error);
        this.isLoadingTopCustomerType = false;
        // Set default value on error
        const topCustomerTypeStat = this.stats.find(stat => stat.icon === 'user');
        if (topCustomerTypeStat) {
          topCustomerTypeStat.value = 'N/A';
        }
      }
    });
  }

  loadTotalParkedCars(): void {
    if (!this.dateFrom || !this.dateTo) {
      return;
    }

    this.isLoadingTotalParkedCars = true;
    this.pickupRequestsService.getTotalParkedRequests(this.dateFrom, this.dateTo).subscribe({
      next: (response) => {
        this.isLoadingTotalParkedCars = false;
        // Update the Total Cars Parked stat
        const totalParkedStat = this.stats.find(stat => stat.icon === 'car');
        if (totalParkedStat) {
          // Handle different response structures
          const totalCount = response?.data?.total || response?.total || response?.count || response?.data || response || 0;
          totalParkedStat.value = totalCount.toString();
        }
      },
      error: (error) => {
        console.error('Failed to load total parked cars', error);
        this.isLoadingTotalParkedCars = false;
        // Set default value on error
        const totalParkedStat = this.stats.find(stat => stat.icon === 'car');
        if (totalParkedStat) {
          totalParkedStat.value = '0';
        }
      }
    });
  }

  loadAverageParkingTime(): void {
    if (!this.dateFrom || !this.dateTo) {
      return;
    }

    this.isLoadingAverageParkingTime = true;
    this.pickupRequestsService.getAverageParkingTime(this.dateFrom, this.dateTo).subscribe({
      next: (response) => {
        this.isLoadingAverageParkingTime = false;
        // Update the Average Parking Time stat
        const avgParkingTimeStat = this.stats.find(stat => stat.icon === 'clock');
        if (avgParkingTimeStat) {
          // Handle different response structures
          // The API might return the time in different formats (e.g., "2h 45min", "165", or an object)
          const avgTime = response?.data?.averageTime || response?.averageTime || response?.data || response || '0';
          avgParkingTimeStat.value = this.formatParkingTime(avgTime);
        }
      },
      error: (error) => {
        console.error('Failed to load average parking time', error);
        this.isLoadingAverageParkingTime = false;
        // Set default value on error
        const avgParkingTimeStat = this.stats.find(stat => stat.icon === 'clock');
        if (avgParkingTimeStat) {
          avgParkingTimeStat.value = '0min';
        }
      }
    });
  }

  formatParkingTime(time: any): string {
    // If the API returns a formatted string like "2h 45min", return it as is
    if (typeof time === 'string' && time.includes('h')) {
      return time;
    }

    // If the API returns minutes as a number, format it
    if (typeof time === 'number' || !isNaN(Number(time))) {
      const totalMinutes = Number(time);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // Helper function to format number with max 5 decimal places
      const formatNumber = (num: number): string => {
        return Number(num.toFixed(5)).toString();
      };
      
      if (hours > 0 && minutes > 0) {
        return `${formatNumber(hours)}h ${formatNumber(minutes)}min`;
      } else if (hours > 0) {
        return `${formatNumber(hours)}h`;
      } else {
        return `${formatNumber(minutes)}min`;
      }
    }

    // Fallback
    return String(time);
  }

  loadActiveGate(): void {
    if (!this.dateFrom || !this.dateTo) {
      return;
    }

    this.isLoadingActiveGate = true;
    this.gatesService.getActiveGate(this.dateFrom, this.dateTo).subscribe({
      next: (response) => {
        this.isLoadingActiveGate = false;
        // Update the Most Active Gate stat
        const activeGateStat = this.stats.find(stat => stat.icon === 'gate');
        if (activeGateStat) {
          // Handle different response structures
          const gateName = response?.data?.name || response?.data?.gateName || response?.name || response?.gateName || response || 'N/A';
          activeGateStat.value = gateName;
        }
      },
      error: (error) => {
        console.error('Failed to load active gate', error);
        this.isLoadingActiveGate = false;
        // Set default value on error
        const activeGateStat = this.stats.find(stat => stat.icon === 'gate');
        if (activeGateStat) {
          activeGateStat.value = 'N/A';
        }
      }
    });
  }

  loadTotalRevenue(): void {
    this.isLoadingTotalRevenue = true;
    
    // Pass dates if available, otherwise API returns all data
    const startTime = this.dateFrom || undefined;
    const endTime = this.dateTo || undefined;
    
    this.pickupRequestsService.getTotalRevenue(startTime, endTime).subscribe({
      next: (response) => {
        this.isLoadingTotalRevenue = false;
        // Update the Total Revenue stat
        const totalRevenueStat = this.stats.find(stat => stat.icon === 'dollar');
        if (totalRevenueStat) {
          // Handle different response structures
          const revenue = response?.data?.totalRevenue || response?.data?.total || response?.totalRevenue || response?.total || response?.data || response || 0;
          totalRevenueStat.value = this.formatRevenue(revenue);
        }
      },
      error: (error) => {
        console.error('Failed to load total revenue', error);
        this.isLoadingTotalRevenue = false;
        // Set default value on error
        const totalRevenueStat = this.stats.find(stat => stat.icon === 'dollar');
        if (totalRevenueStat) {
          totalRevenueStat.value = 'SAR 0';
        }
      }
    });
  }

  formatRevenue(value: any): string {
    if (value === undefined || value === null) return 'SAR 0';
    
    const numericValue = typeof value === 'number' ? value : parseFloat(value);
    if (isNaN(numericValue)) return 'SAR 0';
    
    // Format with thousands separator
    const formatted = numericValue.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });
    
    return `SAR ${formatted}`;
  }
}