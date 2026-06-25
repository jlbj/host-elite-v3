import { Injectable, signal } from '@angular/core';
import { signal as ngSignal } from '@angular/core';

/**
 * Service that expands `{{ var_<section>_<key> }}` placeholders inside any string.
 * It receives the full `content` record (all sections) and replaces each
 * placeholder with the corresponding value, falling back to an empty string
 * when the value is undefined.
 */
@Injectable({ providedIn: 'root' })
export class TemplateVariableService {
  /**
   * Returns a new string where all `{{ var_section_key }}` tokens are replaced.
   * The token format mirrors the editor's naming convention.
   */
  replaceVariables(input: string, content: Record<string, any>): string {
    if (!input) return input;
    // Regex captures the section id and the field key between the placeholder markers
    const variablePattern = /{{\s*var_([a-zA-Z0-9_-]+)_([a-zA-Z0-9_-]+)\s*}}/g;
    return input.replace(variablePattern, (_, sectionId: string, fieldKey: string) => {
      const section = content[sectionId];
      if (section && typeof section === 'object' && fieldKey in section) {
        const value = section[fieldKey];
        // Convert non‑string values to string safely
        return value != null ? String(value) : '';
      }
      // If not found, return empty string to avoid raw placeholders leaking
      return '';
    });
  }
}
