import { Pipe, PipeTransform } from '@angular/core';

/**
 * Converts raw byte count into a human-readable string.
 *
 * Usage in template:  {{ asset.size | fileSize }}
 * Output examples:    "850 KB", "1.2 MB", "4.3 GB"
 */
@Pipe({
  name: 'fileSize',
  standalone: true,
})
export class FileSizePipe implements PipeTransform {
  transform(bytes: number | null | undefined): string {
    if (bytes == null || bytes < 0) return '—';
    if (bytes === 0) return '0 B';
    if (bytes < 1_024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1_024).toFixed(1)} KB`;
    if (bytes < 1_073_741_824) return `${(bytes / 1_048_576).toFixed(1)} MB`;
    return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  }
}
