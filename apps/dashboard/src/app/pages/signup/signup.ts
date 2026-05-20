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
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputComponent, CardComponent, ButtonComponent],
  templateUrl: './signup.html',
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.signupForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get password() { return this.signupForm.get('password'); }

  getNameError() {
    if (this.name?.touched && this.name?.errors) {
      if (this.name.errors['required']) return 'Name is required';
      if (this.name.errors['minlength']) return 'Name must be at least 2 characters';
    }
    return '';
  }

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

  handleSignup() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.authService.signup(this.signupForm.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.toast.show('Account created successfully. Please login.', 'success');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading = false;
        this.toast.show(err.error?.message || 'Registration failed.', 'error');
      },
    });
  }
}
