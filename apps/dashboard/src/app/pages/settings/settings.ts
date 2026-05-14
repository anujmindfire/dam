import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Account Settings</h1>
        <p class="text-[var(--color-text-muted)]">Manage your profile and platform preferences.</p>
      </div>

      <div class="max-w-2xl space-y-6">
        <div class="glass p-6">
          <h2 class="text-xl mb-6">Profile Information</h2>
          <div class="space-y-4">
            <div>
              <label
                class="block text-xs font-medium text-[var(--color-text-dim)] mb-2 uppercase tracking-wider"
                >Full Name</label
              >
              <input
                type="text"
                value="Marketing Lead"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <div>
              <label
                class="block text-xs font-medium text-[var(--color-text-dim)] mb-2 uppercase tracking-wider"
                >Email Address</label
              >
              <input
                type="email"
                value="lead@marketing.dam.com"
                class="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-violet-500/50 transition-all"
              />
            </div>
            <button class="btn-primary mt-4">Save Changes</button>
          </div>
        </div>

        <div class="glass p-6">
          <h2 class="text-xl mb-6">Visual Theme</h2>
          <div class="flex items-center gap-4">
            <button
              class="flex-1 p-4 rounded-xl border-2 border-violet-500 bg-violet-500/10 text-sm font-medium"
            >
              Dark Mode
            </button>
            <button
              class="flex-1 p-4 rounded-xl border-2 border-white/5 bg-white/5 text-sm font-medium opacity-50"
            >
              Light Mode
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class SettingsComponent {}
