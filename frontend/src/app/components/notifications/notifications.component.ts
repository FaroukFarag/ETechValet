import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Notification {
  id: string;
  type: 'request' | 'assignment' | 'completion' | 'system' | 'urgent';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionRequired?: boolean;
  relatedId?: string;
  avatar?: string;
  vehicleId?: string;
  location?: string;
  phone?: string;
}

interface NotificationStats {
  total: number;
  unread: number;
  urgent: number;
  today: number;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent {
  activeFilter: string = 'all';
  
  stats: NotificationStats = {
    total: 24,
    unread: 8,
    urgent: 3,
    today: 12
  };

  notifications: Notification[] = [
    {
      id: '1',
      type: 'request',
      title: 'New Pickup Request',
      message: 'Pickup requested for BMW (ABC-123) at level B2-A5',
      timestamp: '2 minutes ago',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedId: 'REQ-789',
      vehicleId: 'ABC-123',
      location: 'Level B2-A5',
      phone: '+1-555-0123'
    },
    {
      id: '2',
      type: 'completion',
      title: 'Car Wash Completed',
      message: 'Premium Wash Completed for mercedes C300 (XYZ-789)',
      timestamp: '5 minutes ago',
      isRead: false,
      priority: 'medium',
      relatedId: 'REQ-456',
      vehicleId: 'XYZ-789',
      location: 'Level B1',
      phone: '+1-555-0456'
    },
    {
      id: '3',
      type: 'request',
      title: 'New Valet Request',
      message: 'New pickup request from Level B1-C3. Audi A4 (DEF-456)',
      timestamp: '8 minutes ago',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedId: 'REQ-123',
      vehicleId: 'DEF-456',
      location: 'Level B1-C3',
      phone: '+1-555-0789'
    },
    {
      id: '4',
      type: 'completion',
      title: 'Service Completed',
      message: 'Car wash completed for Toyota Camry. Ready for pickup.',
      timestamp: '12 minutes ago',
      isRead: true,
      priority: 'medium',
      relatedId: 'REQ-321',
      vehicleId: 'GHI-789',
      location: 'Level B2',
      phone: '+1-555-0321'
    },
    {
      id: '5',
      type: 'request',
      title: 'Pickup Reminder',
      message: 'Customer reminder: Vehicle ready for pickup at Level B1',
      timestamp: '15 minutes ago',
      isRead: true,
      priority: 'medium',
      relatedId: 'REQ-654',
      vehicleId: 'JKL-012',
      location: 'Level B1',
      phone: '+1-555-0654'
    },
    {
      id: '6',
      type: 'request',
      title: 'Emergency Pickup',
      message: 'Urgent pickup needed at Level B3-D2. Customer waiting.',
      timestamp: '18 minutes ago',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedId: 'REQ-987',
      vehicleId: 'MNO-345',
      location: 'Level B3-D2',
      phone: '+1-555-0987'
    },
    {
      id: '7',
      type: 'completion',
      title: 'Wash Service Done',
      message: 'Express wash completed for Honda Civic (PQR-678)',
      timestamp: '22 minutes ago',
      isRead: true,
      priority: 'low',
      relatedId: 'REQ-147',
      vehicleId: 'PQR-678',
      location: 'Level B1',
      phone: '+1-555-0147'
    },
    {
      id: '8',
      type: 'request',
      title: 'New Request',
      message: 'Pickup requested for Ford F-150 (STU-901) at level B2-B3',
      timestamp: '25 minutes ago',
      isRead: false,
      priority: 'medium',
      actionRequired: true,
      relatedId: 'REQ-258',
      vehicleId: 'STU-901',
      location: 'Level B2-B3',
      phone: '+1-555-0258'
    },
    {
      id: '9',
      type: 'completion',
      title: 'Vehicle Ready',
      message: 'Full service completed for Lexus RX (VWX-234)',
      timestamp: '30 minutes ago',
      isRead: true,
      priority: 'medium',
      relatedId: 'REQ-369',
      vehicleId: 'VWX-234',
      location: 'Level B2',
      phone: '+1-555-0369'
    },
    {
      id: '10',
      type: 'request',
      title: 'Pickup Request',
      message: 'New pickup request from Level B1-A4. Tesla Model S (YZA-567)',
      timestamp: '35 minutes ago',
      isRead: false,
      priority: 'high',
      actionRequired: true,
      relatedId: 'REQ-741',
      vehicleId: 'YZA-567',
      location: 'Level B1-A4',
      phone: '+1-555-0741'
    }
  ];

  filters = [
    { key: 'all', label: 'All Notifications', count: this.notifications.length },
    { key: 'unread', label: 'Unread', count: this.notifications.filter(n => !n.isRead).length },
    { key: 'urgent', label: 'Urgent', count: this.notifications.filter(n => n.priority === 'urgent').length },
    { key: 'requests', label: 'Requests', count: this.notifications.filter(n => n.type === 'request').length },
    { key: 'assignments', label: 'Assignments', count: this.notifications.filter(n => n.type === 'assignment').length }
  ];

  get filteredNotifications(): Notification[] {
    switch (this.activeFilter) {
      case 'unread':
        return this.notifications.filter(n => !n.isRead);
      case 'urgent':
        return this.notifications.filter(n => n.priority === 'urgent');
      case 'requests':
        return this.notifications.filter(n => n.type === 'request');
      case 'assignments':
        return this.notifications.filter(n => n.type === 'assignment');
      default:
        return this.notifications;
    }
  }

  setActiveFilter(filter: string) {
    this.activeFilter = filter;
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.isRead = true;
      this.updateStats();
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.isRead = true);
    this.updateStats();
  }

  deleteNotification(notificationId: string) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.updateStats();
  }

  handleNotificationAction(notification: Notification) {
    if (notification.relatedId) {
      console.log('Navigate to related item:', notification.relatedId);
      // Navigate to related request/item
    }
  }

  private updateStats() {
    this.stats = {
      total: this.notifications.length,
      unread: this.notifications.filter(n => !n.isRead).length,
      urgent: this.notifications.filter(n => n.priority === 'urgent').length,
      today: this.notifications.filter(n => this.isToday(n.timestamp)).length
    };
    
    // Update filter counts
    this.filters = [
      { key: 'all', label: 'All Notifications', count: this.notifications.length },
      { key: 'unread', label: 'Unread', count: this.notifications.filter(n => !n.isRead).length },
      { key: 'urgent', label: 'Urgent', count: this.notifications.filter(n => n.priority === 'urgent').length },
      { key: 'requests', label: 'Requests', count: this.notifications.filter(n => n.type === 'request').length },
      { key: 'assignments', label: 'Assignments', count: this.notifications.filter(n => n.type === 'assignment').length }
    ];
  }

  private isToday(timestamp: string): boolean {
    // Simple check for demo - in real app would parse actual dates
    return timestamp.includes('min ago') || timestamp.includes('hour ago');
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'urgent': return '🚨';
      case 'request': return '🚗';
      case 'assignment': return '👤';
      case 'completion': return '✅';
      case 'system': return '⚙️';
      default: return '📢';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  getNotificationTypeClass(type: string): string {
    return `type-${type}`;
  }

  get activeFilterDisplayName(): string {
    if (this.activeFilter === 'all') {
      return 'All Notifications';
    }
    
    for (const filter of this.filters) {
      if (filter.key === this.activeFilter) {
        return filter.label;
      }
    }
    
    return '';
  }
}