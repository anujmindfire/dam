import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-8">
      <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Background Jobs</h1>
        <p class="text-[var(--color-text-muted)]">Monitor and manage system processing tasks.</p>
      </div>

      <div class="glass overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-white/5">
              <th
                class="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
              >
                Job ID
              </th>
              <th
                class="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
              >
                Type
              </th>
              <th
                class="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
              >
                Status
              </th>
              <th
                class="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
              >
                Started At
              </th>
              <th
                class="p-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-dim)]"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/5">
            <tr>
              <td class="p-4 text-sm">#JOB-8821</td>
              <td class="p-4 text-sm font-medium">Video Encoding</td>
              <td class="p-4">
                <span
                  class="px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded text-[10px] font-bold uppercase"
                  >Processing</span
                >
              </td>
              <td class="p-4 text-sm text-[var(--color-text-muted)]">2 mins ago</td>
              <td class="p-4">
                <button class="text-xs text-[var(--color-primary)] hover:underline">Cancel</button>
              </td>
            </tr>
            <tr>
              <td class="p-4 text-sm">#JOB-8820</td>
              <td class="p-4 text-sm font-medium">Asset Analysis</td>
              <td class="p-4">
                <span
                  class="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-bold uppercase"
                  >Completed</span
                >
              </td>
              <td class="p-4 text-sm text-[var(--color-text-muted)]">15 mins ago</td>
              <td class="p-4">
                <button class="text-xs text-[var(--color-text-dim)]">Details</button>
              </td>
            </tr>
          </tbody>
        </table>
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
export class JobsComponent {}
