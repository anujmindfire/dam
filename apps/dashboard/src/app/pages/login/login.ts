import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CardComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { InputComponent } from '../../components/ui/input/input';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CardComponent, ButtonComponent, InputComponent],
  templateUrl: './login.html',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  getEmailError() {
    if (this.email?.touched && this.email?.errors) {
      if (this.email.errors['required']) return 'Email is required';
      if (this.email.errors['email']) return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordError() {
    if (this.password?.touched && this.password?.errors) {
      if (this.password.errors['required']) return 'Password is required';
      if (this.password.errors['minlength']) return 'Password must be at least 6 characters';
    }
    return '';
  }

  handleLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.show('Access granted. Welcome back.', 'success');
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.show(err.error?.message || 'Invalid security credentials.', 'error');
      },
    });
  }
}
