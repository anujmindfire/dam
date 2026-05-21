import { Pipe, PipeTransform } from '@angular/core';

/**
 * Maps a MIME type string to a display-friendly short label.
 *
 * Usage in template:  {{ asset.mimetype | mimeLabel }}
 * Output examples:    "Image", "Video", "Audio", "PDF", "File"
 */
@Pipe({
  name: 'mimeLabel',
  standalone: true,
})
export class MimeLabelPipe implements PipeTransform {
  private static readonly MAP: Record<string, string> = {
    'image/': 'Image',
    'video/': 'Video',
    'audio/': 'Audio',
    'application/pdf': 'PDF',
    'text/': 'Text',
    'application/zip': 'Archive',
    'application/x-zip-compressed': 'Archive',
  };

  transform(mimetype: string | null | undefined): string {
    if (!mimetype) return 'File';
    for (const [prefix, label] of Object.entries(MimeLabelPipe.MAP)) {
      if (mimetype.startsWith(prefix) || mimetype === prefix) return label;
    }
    return 'File';
  }
}
