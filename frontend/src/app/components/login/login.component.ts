import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  showPassword = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;

    const loginData = {
      userName: this.loginForm.value.userName,
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('Login response', response);
        this.isSubmitting = false;
        
        // Check if the login was successful based on isSuccess flag
        if (response.isSuccess === true) {
          console.log('Login successful', response);
          // Navigate to home page only if login is successful
          this.router.navigate(['/home']);
        } else {
          // Login failed according to API response
          this.errorMessage = response.message || 'Login failed. Please check your credentials.';
        }
      },
      error: (error) => {
        console.error('Login failed', error);
        console.error('Error status:', error.status);
        console.error('Error URL:', error.url);
        this.isSubmitting = false;
        
        if (error.status === 404) {
          this.errorMessage = 'Endpoint not found (404). Please verify: 1) Backend server is running on http://localhost:3000, 2) The endpoint /api/users/login exists';
        } else if (error.status === 0) {
          this.errorMessage = 'Unable to connect to the server. Please check if the backend is running on http://localhost:3000';
        } else {
          // Check if error response has isSuccess: false
          if (error.error?.isSuccess === false) {
            this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          } else {
            this.errorMessage = error.error?.message || `Login failed (${error.status}). Please check your credentials.`;
          }
        }
      }
    });
  }

  get userNameControl() {
    return this.loginForm.get('userName');
  }

  get passwordControl() {
    return this.loginForm.get('password');
  }
}

