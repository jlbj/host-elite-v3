import { Injectable, signal } from '@angular/core';
import { marked } from 'marked';

export interface ParsedMdxComponent {
  type: string;
  props: Record<string, any>;
}

export type MdxSection = ParsedMdxComponent;

@Injectable({
  providedIn: 'root'
})
export class MdxParserService {
  private componentMap: Record<string, any> = {
    'Hero': null,
    'Gallery': null,
    'Features': null,
    'Testimonials': null,
    'Contact': null,
    'CTA': null,
    'Text': null,
  };

  setComponents(components: Record<string, any>): void {
    this.componentMap = { ...this.componentMap, ...components };
  }

  parse(mdxContent: string): ParsedMdxComponent[] {
    const components: ParsedMdxComponent[] = [];
    const lines = mdxContent.split('\n');
    let currentComponent: ParsedMdxComponent | null = null;
    let currentProps: Record<string, any> = {};
    let propKey = '';
    let propValue = '';
    let inProps = false;
    let braceDepth = 0;
    let arrayContent = '';

    for (const line of lines) {
      const trimmed = line.trim();

      // Skip empty lines and comments
      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#')) {
        continue;
      }

      // Check for component start
      if (trimmed.startsWith('<') && !trimmed.startsWith('</')) {
        const tagMatch = trimmed.match(/^<(\w+)/);
        if (tagMatch) {
          // Save previous component
          if (currentComponent) {
            components.push({ ...currentComponent, props: { ...currentProps } });
          }
          
          currentComponent = { type: tagMatch[1], props: {} };
          currentProps = {};
          inProps = false;
          arrayContent = '';

          // Check for self-closing tag
          if (trimmed.includes('/>')) {
            if (currentComponent) {
              components.push({ ...currentComponent, props: { ...currentProps } });
            }
            currentComponent = null;
            currentProps = {};
          }
          continue;
        }
      }

      // Check for component end
      if (trimmed.startsWith('</')) {
        if (currentComponent) {
          components.push({ ...currentComponent, props: { ...currentProps } });
        }
        currentComponent = null;
        currentProps = {};
        inProps = false;
        continue;
      }

      // Parse props if we have a current component
      if (currentComponent) {
        // Check for array start
        if (trimmed.includes('={[')) {
          inProps = true;
          const idx = trimmed.indexOf('=');
          propKey = trimmed.substring(0, idx).trim();
          arrayContent = trimmed.substring(trimmed.indexOf('['));
          
          // Check if array closes on same line
          if (trimmed.includes(']}') || trimmed.endsWith(']')) {
            try {
              const jsonStr = arrayContent.replace(/\s*[\],]+\s*$/, ']');
              currentProps[propKey] = JSON.parse(jsonStr);
            } catch (e) {
              console.warn('Failed to parse array prop:', propKey, e);
            }
            inProps = false;
            propKey = '';
            arrayContent = '';
          }
          continue;
        }

        // Continue collecting array content
        if (inProps && propKey && arrayContent) {
          arrayContent += ' ' + trimmed;
          
          // Check for array end
          if (trimmed.includes(']')) {
            try {
              const jsonStr = arrayContent.replace(/\s*[\],]+\s*$/, ']');
              currentProps[propKey] = JSON.parse(jsonStr);
            } catch (e) {
              console.warn('Failed to parse array prop:', propKey, e);
            }
            inProps = false;
            propKey = '';
            arrayContent = '';
          }
          continue;
        }

        // Parse simple prop
        if (trimmed.includes('=') && !inProps) {
          const idx = trimmed.indexOf('=');
          propKey = trimmed.substring(0, idx).trim();
          propValue = trimmed.substring(idx + 1).trim();

          // String value
          if ((propValue.startsWith('"') || propValue.startsWith("'")) && propValue.endsWith(propValue[0])) {
            currentProps[propKey] = propValue.slice(1, -1);
          } else if (propValue === 'true') {
            currentProps[propKey] = true;
          } else if (propValue === 'false') {
            currentProps[propKey] = false;
          } else {
            currentProps[propKey] = propValue;
          }
        }
      }
    }

    // Don't forget the last component
    if (currentComponent) {
      components.push({ ...currentComponent, props: { ...currentProps } });
    }

    console.log('[MDX Parser] Parsed components:', components);
    return components;
  }

  getComponent(type: string): any {
    return this.componentMap[type] || null;
  }
}