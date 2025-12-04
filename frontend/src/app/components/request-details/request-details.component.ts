import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

interface Comment {
  author: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-request-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './request-details.component.html',
  styleUrls: ['./request-details.component.scss']
})
export class RequestDetailsComponent implements OnInit {
  requestId = '46';
  
  clientInfo = {
    customerName: 'Ahmed Hany',
    customerType: 'Visitor',
    mobileNumber: '+1-555-0123',
    paymentType: 'Cash',
    amount: '27 SAR'
  };

  vehicleInfo = {
    plateNumber: 'BGD4570',
    brand: 'Toyota Camri 2021',
    color: 'Silver',
    service: 'Valet & Wash'
  };

  siteTiming = {
    siteId: '0111',
    siteName: 'King Faisal',
    gateId: '011',
    createdTime: '16:24:47',
    createdDate: '27-02-2024'
  };

  inspectionPhotos: string[] = Array(5).fill(''); // 5 placeholder images

  comments: Comment[] = [
    {
      author: 'Driver',
      message: 'Lorem ipsum dolor sit amet, consectetuer',
      time: '12:15 PM'
    },
    {
      author: 'Driver',
      message: 'Lorem ipsum dolor sit amet, consectetuer',
      time: '12:15 PM'
    },
    {
      author: 'Driver',
      message: 'Lorem ipsum dolor sit amet, consectetuer',
      time: '12:15 PM'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Get request ID from route params if needed
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.requestId = params['id'];
        // TODO: Fetch request details based on ID
      }
    });
  }

  goBack() {
    this.router.navigate(['/requests']);
  }
}
