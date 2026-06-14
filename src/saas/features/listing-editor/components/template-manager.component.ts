import { Component, inject, signal, output, ChangeDetectionStrategy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SessionStore } from '../../../../state/session.store';
import type { SavedTemplate } from '../models/paving.types';

@Component({
  selector: 'app-template-manager',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-slate-950 text-white font-sans antialiased">
      <!-- Header -->
      <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/60 backdrop-blur-md shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-2xl animate-pulse">📁</span>
          <div>
            <h2 class="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">Template Library</h2>
            <p class="text-xs text-slate-500 font-medium">{{ store.templates().length }} templates available</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          @if (isAdmin()) {
            <button (click)="showImport.set(true)" class="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 hover:scale-[1.02] active:scale-[0.98] text-white rounded-xl shadow-lg shadow-emerald-950/20 transition-all duration-200">+ Import Template</button>
          }
          <button (click)="refresh()" class="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition duration-150">⟳ Refresh</button>
          <button (click)="close.emit()" class="px-3 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition duration-150">✕ Close</button>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex-1 overflow-y-auto p-6 bg-slate-950">
        @if (store.templates().length === 0) {
          <div class="flex flex-col items-center justify-center h-[60vh] text-slate-500">
            <div class="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-3xl mb-4 border border-white/5 shadow-inner">📂</div>
            <p class="text-sm font-semibold text-slate-400">No templates loaded</p>
            <p class="text-xs text-slate-600 mt-1">
              @if (isAdmin()) {
                Click "Import Template" to add HTML/CSS/Images.
              } @else {
                Admin templates will appear here.
              }
            </p>
          </div>
        } @else {
          <!-- Template grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            @for (t of store.templates(); track t.id) {
              <div
                class="template-card group relative flex flex-col bg-slate-900/40 border border-white/10 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <!-- Vignette (Live Preview) -->
                <div class="template-thumb relative w-full aspect-[16/10] overflow-hidden bg-slate-950">
                  <!-- Live Preview in Iframe (Scaled down to look like a card thumbnail) -->
                  <div class="absolute inset-0 w-[450%] h-[450%] origin-top-left pointer-events-none transition-opacity duration-300" style="transform: scale(0.2222);">
                    <iframe [srcdoc]="t.html + '<style>' + (t.css || '') + '</style>'" class="w-full h-full border-0" sandbox="allow-scripts"></iframe>
                  </div>
                  <!-- Overlay gradient/gloss/blocker -->
                  <div class="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent cursor-pointer z-10"></div>
                </div>

                <!-- Info -->
                <div class="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between gap-2">
                      <h3 class="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate">{{ t.name }}</h3>
                      @if (t.is_predefined) {
                        <span class="px-1.5 py-0.5 text-[9px] font-bold bg-[#D4AF37]/25 text-[#D4AF37] border border-[#D4AF37]/35 rounded uppercase tracking-wider shrink-0">Default</span>
                      }
                    </div>
                    <p class="text-[10px] text-slate-500 font-mono mt-1">Updated: {{ t.updated_at ? t.updated_at.slice(0, 10) : '—' }}</p>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex border-t border-white/5 bg-slate-900/80">
                  <button (click)="selectTemplate(t)" class="flex-1 py-2.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:bg-white/5 transition-colors border-r border-white/5">Apply</button>
                  @if (isAdmin()) {
                    <button (click)="editTemplate(t)" class="flex-1 py-2.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 hover:bg-white/5 transition-colors border-r border-white/5">Edit</button>
                  }
                  <button (click)="previewTemplate(t)" class="flex-1 py-2.5 text-xs font-semibold text-sky-400 hover:text-sky-300 hover:bg-white/5 transition-colors">Preview</button>
                  @if (isAdmin()) {
                    @if (!t.is_predefined) {
                      <button (click)="confirmDelete(t)" class="flex-1 py-2.5 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors border-l border-white/5">Delete</button>
                    } @else {
                      <button class="flex-1 py-2.5 text-xs font-semibold text-slate-600 cursor-not-allowed border-l border-white/5" title="Predefined system templates cannot be deleted" disabled>Delete</button>
                    }
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    <!-- Import Dialog -->
    @if (showImport() && isAdmin()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" (click)="showImport.set(false)">
        <div class="bg-slate-900 rounded-2xl p-6 w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl border border-white/10 relative" (click)="$event.stopPropagation()">
          <h3 class="text-white font-bold text-lg mb-1 tracking-tight">Import Landing Page</h3>
          <p class="text-slate-400 text-xs mb-5">Create a template by typing raw HTML/CSS, uploading an HTML file, importing a full folder, or extracting a live website URL (Base64 optimized).</p>

          <!-- Tabs -->
          <div class="flex gap-1 mb-6 bg-slate-950 rounded-xl p-1 border border-white/5">
            <button (click)="importTab.set('paste')" class="flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-200" [class.bg-slate-800]="importTab() === 'paste'" [class.text-white]="importTab() === 'paste'" [class.text-slate-400]="importTab() !== 'paste'">Paste HTML</button>
            <button (click)="importTab.set('upload')" class="flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-200" [class.bg-slate-800]="importTab() === 'upload'" [class.text-white]="importTab() === 'upload'" [class.text-slate-400]="importTab() !== 'upload'">Upload File</button>
            <button (click)="importTab.set('directory')" class="flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-200" [class.bg-slate-800]="importTab() === 'directory'" [class.text-white]="importTab() === 'directory'" [class.text-slate-400]="importTab() !== 'directory'">Import Folder</button>
            <button (click)="importTab.set('url')" class="flex-1 py-2 text-xs rounded-lg font-bold transition-all duration-200" [class.bg-slate-800]="importTab() === 'url'" [class.text-white]="importTab() === 'url'" [class.text-slate-400]="importTab() !== 'url'">Import URL</button>
          </div>

          @if (importTab() === 'paste') {
            <div class="mb-4">
              <label class="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Template Name</label>
              <input [value]="importName()" (input)="importName.set($any($event.target).value)" class="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" placeholder="e.g. Modern Villa Theme" />
            </div>
            <div class="mb-4">
              <label class="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Image Thumbnail URL (optional)</label>
              <input [value]="importThumb()" (input)="importThumb.set($any($event.target).value)" class="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" placeholder="https://example.com/thumb.jpg" />
            </div>
            <div class="mb-4">
              <label class="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">HTML Content</label>
              <textarea [value]="importHtml()" (input)="importHtml.set($any($event.target).value)" rows="8" class="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-y" placeholder="<div>Pure HTML content...</div>"></textarea>
            </div>
            <div class="mb-6">
              <label class="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">CSS Stylesheet (optional)</label>
              <textarea [value]="importCss()" (input)="importCss.set($any($event.target).value)" rows="4" class="w-full px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-white text-xs font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-y" placeholder="/* CSS rules here... */"></textarea>
            </div>
            <button (click)="doImport()" class="w-full py-3 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-all" [class.opacity-50]="!importName().trim() || !importHtml().trim()" [disabled]="!importName().trim() || !importHtml().trim()">Create Template</button>
          }

          @if (importTab() === 'upload') {
            <div class="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-12 text-center transition cursor-pointer" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)" (click)="fileInput.click()">
              <div class="text-4xl mb-3">📄</div>
              <p class="text-slate-300 text-sm font-semibold mb-1">Drag & drop your HTML file here</p>
              <p class="text-xs text-slate-500 mb-4">or click to browse files</p>
              <button class="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition">Browse Files</button>
              <input #fileInput type="file" accept=".html,.htm" (change)="onFileSelect($event)" class="hidden" />
            </div>
          }

          @if (importTab() === 'directory') {
            <div class="border-2 border-dashed border-white/10 hover:border-emerald-500/50 rounded-2xl p-12 text-center transition cursor-pointer" (dragover)="$event.preventDefault()" (drop)="onDirectoryDrop($event)" (click)="dirInput.click()">
              <div class="text-4xl mb-3">📁</div>
              <p class="text-slate-300 text-sm font-semibold mb-1">Select landing page folder</p>
              <p class="text-xs text-slate-500 mb-4">Reads all HTML, CSS, and replaces relative images with Base64 automatically</p>
              <button class="px-4 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition">Choose Folder</button>
              <input #dirInput type="file" [attr.webkitdirectory]="''" [attr.directory]="''" multiple (change)="onDirectorySelect($event)" class="hidden" />
            </div>
          }

          @if (importTab() === 'url') {
            <div class="mb-4">
              <label class="text-xs font-bold text-slate-400 block mb-1.5 uppercase tracking-wider">Website URL</label>
              <div class="flex gap-2">
                <input #urlInput type="url" class="flex-1 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl text-white text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition" placeholder="https://example.com/landing-page" (keydown.enter)="importFromUrl(urlInput.value)" />
                <button (click)="importFromUrl(urlInput.value)" [disabled]="isLoadingUrl()" class="px-5 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl transition duration-150 flex items-center gap-1.5 animate-none">
                  @if (isLoadingUrl()) {
                    <span class="inline-block animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full shrink-0"></span>
                    <span>Extracting...</span>
                  } @else {
                    <span>Extract Page</span>
                  }
                </button>
              </div>
              <p class="text-[10px] text-slate-500 mt-2 leading-relaxed">
                Connects to the website via a CORS proxy, fetches styles, script layouts, and downloads/inlines all images automatically.
              </p>
            </div>
          }

          <div class="flex justify-end mt-6 border-t border-white/5 pt-4">
            <button (click)="showImport.set(false)" class="px-4 py-2 text-xs text-slate-400 hover:text-white font-medium transition">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- Preview Dialog -->
    @if (previewTemplateData(); as pt) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" (click)="previewTemplateData.set(null)">
        <div class="bg-slate-900 rounded-2xl w-[92vw] h-[88vh] shadow-2xl border border-white/10 flex flex-col overflow-hidden" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-lg">👁️</span>
              <span class="text-white font-bold text-base">{{ pt.name }}</span>
            </div>
            <button (click)="previewTemplateData.set(null)" class="text-slate-400 hover:text-white text-2xl leading-none transition">&times;</button>
          </div>
          <div class="flex-1 bg-white">
            <iframe [srcdoc]="pt.html + '<style>' + (pt.css || '') + '</style>'" class="w-full h-full border-0" sandbox="allow-scripts"></iframe>
          </div>
        </div>
      </div>
    }

    <!-- Delete Confirmation -->
    @if (deleteTarget(); as dt) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm" (click)="deleteTarget.set(null)">
        <div class="bg-slate-900 rounded-2xl p-6 w-96 shadow-2xl border border-white/10" (click)="$event.stopPropagation()">
          <h3 class="text-white font-bold text-base mb-2">Delete Template?</h3>
          <p class="text-slate-400 text-sm leading-relaxed">Are you sure you want to delete <strong class="text-white">{{ dt.name }}</strong>? This template will be permanently removed.</p>
          <div class="flex justify-end gap-2 mt-6">
            <button (click)="deleteTarget.set(null)" class="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition">Cancel</button>
            <button (click)="doDelete(dt.id)" class="px-4 py-2 text-xs font-bold bg-red-600 hover:bg-red-500 text-white rounded-xl shadow-lg shadow-red-950/20 transition-all duration-150">Delete</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .template-card {
      background: rgba(255, 255, 255, 0.02);
      backdrop-filter: blur(10px);
    }
    .template-card:hover {
      background: rgba(255, 255, 255, 0.04);
      transform: translateY(-2px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateManagerComponent {
  store = inject(PavingStoreService);
  private sessionStore = inject(SessionStore);

  edit = output<SavedTemplate>();
  select = output<SavedTemplate>();
  close = output<void>();

  previewId = signal<string | null>(null);
  previewTemplateData = signal<SavedTemplate | null>(null);

  showImport = signal(false);
  importTab = signal<'paste' | 'upload' | 'directory' | 'url'>('paste');
  importName = signal('');
  importThumb = signal('');
  importHtml = signal('');
  importCss = signal('');
  isLoadingUrl = signal(false);

  deleteTarget = signal<SavedTemplate | null>(null);

  // Compute admin role check
  isAdmin = computed(() => this.sessionStore.userProfile()?.role === 'admin');

  async refresh(): Promise<void> {
    await this.store.loadTemplates();
  }

  selectTemplate(t: SavedTemplate): void {
    this.select.emit(t);
  }

  async onFileSelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    await this.readFile(file);
  }

  async onFileDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    await this.readFile(file);
  }

  private parseHtmlContent(rawHtml: string): { html: string; css: string } {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(rawHtml, 'text/html');

      let css = '';

      // Extract all <style> contents and strip giant base64 data to prevent editor lockup
      const styles = doc.querySelectorAll('style');
      styles.forEach(s => {
        if (s.textContent) {
          let cssText = s.textContent;
          // Strip SingleFile custom properties
          cssText = cssText.replace(/--sf-img-\d+:\s*url\(['"]?data:[^'")]+['"]?\);?/gi, '');
          // Strip other large data URIs
          cssText = cssText.replace(/url\(['"]?data:[^'")]+['"]?\)/gi, (match) => {
            if (match.length > 8000) {
              return `url('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800')`;
            }
            return match;
          });
          css += '\n' + cssText;
        }
        s.remove();
      });

      // Clean large base64 img tags
      const imgs = doc.querySelectorAll('img');
      imgs.forEach(img => {
        const src = img.getAttribute('src') || '';
        if (src.startsWith('data:') && src.length > 8000) {
          img.setAttribute('src', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800');
        }
      });

      // Extract body content or fallback to document element content
      const bodyContent = doc.body ? doc.body.innerHTML : doc.documentElement.innerHTML;

      return {
        html: bodyContent,
        css: css.trim()
      };
    } catch (e) {
      console.warn('Failed to parse HTML content using DOMParser, returning raw text:', e);
      return { html: rawHtml, css: '' };
    }
  }

  private async readFile(file: File): Promise<void> {
    const text = await file.text();
    const name = file.name.replace(/\.html?$/i, '') || 'Imported Template';
    
    const parsed = this.parseHtmlContent(text);
    
    this.importName.set(name.replace(/[_-]/g, ' '));
    this.importHtml.set(parsed.html);
    this.importCss.set(parsed.css);
    this.importTab.set('paste');
  }

  // Helper to read file as text
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  // Helper to read file as base64 URL
  private readFileAsDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  // Handle directory/folder selection
  async onDirectorySelect(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input?.files || []);
    if (files.length === 0) return;

    let folderName = 'Imported Template';
    const firstFile = files[0];
    if (firstFile.webkitRelativePath) {
      const parts = firstFile.webkitRelativePath.split('/');
      if (parts.length > 0 && parts[0]) {
        folderName = parts[0];
      }
    }

    await this.processFiles(files, folderName);
  }

  // Handle directory/folder drop
  async onDirectoryDrop(event: DragEvent): Promise<void> {
    event.preventDefault();
    const items = event.dataTransfer?.items;
    if (!items || items.length === 0) return;

    const item = items[0];
    if (item.kind !== 'file') return;

    const entry = (item as any).webkitGetAsEntry?.() || (item as any).getAsEntry?.();
    if (!entry) return;

    try {
      const files: File[] = [];
      let defaultFolderName = entry.name || 'Imported Template';

      const readEntry = async (ent: any, path = '') => {
        if (ent.isFile) {
          const file = await new Promise<File>((resolve, reject) => ent.file(resolve, reject));
          const relativePath = path ? `${path}/${file.name}` : file.name;
          Object.defineProperty(file, 'webkitRelativePath', {
            value: relativePath,
            writable: true
          });
          files.push(file);
        } else if (ent.isDirectory) {
          const reader = ent.createReader();
          const readAllEntries = async (): Promise<any[]> => {
            const allEntries: any[] = [];
            const readBatch = async (): Promise<void> => {
              const batch = await new Promise<any[]>((resolve, reject) => reader.readEntries(resolve, reject));
              if (batch.length > 0) {
                allEntries.push(...batch);
                await readBatch();
              }
            };
            await readBatch();
            return allEntries;
          };
          const childEntries = await readAllEntries();
          for (const child of childEntries) {
            await readEntry(child, path ? `${path}/${ent.name}` : ent.name);
          }
        }
      };

      await readEntry(entry);
      if (files.length > 0) {
        await this.processFiles(files, defaultFolderName);
      } else {
        alert('No files found in the dropped folder.');
      }
    } catch (err) {
      console.error('Directory drop failed:', err);
      alert('Directory drop failed: ' + (err instanceof Error ? err.message : err));
    }
  }

  // Common logic to process directory files (whether selected or dropped)
  private async processFiles(files: File[], folderName: string): Promise<void> {
    try {
      const textFiles: { file: File, relPath: string }[] = [];
      const imageFiles: { file: File, relPath: string }[] = [];

      files.forEach(f => {
        let relPath = '';
        if (f.webkitRelativePath) {
          const parts = f.webkitRelativePath.split('/');
          // If relative path starts with the folder name, strip it to avoid redundant prefixes
          if (parts.length > 1 && parts[0] === folderName) {
            relPath = parts.slice(1).join('/');
          } else {
            relPath = f.webkitRelativePath;
          }
        }
        
        if (!relPath) {
          relPath = f.name;
        }

        const ext = f.name.split('.').pop()?.toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext || '')) {
          imageFiles.push({ file: f, relPath });
        } else if (['html', 'htm', 'css', 'js'].includes(ext || '')) {
          textFiles.push({ file: f, relPath });
        }
      });

      // Find index/main HTML file
      const htmlFileObj = textFiles.find(t => t.relPath.toLowerCase() === 'index.html' || t.relPath.toLowerCase() === 'index.htm') ||
                           textFiles.find(t => t.relPath.endsWith('.html')) ||
                           textFiles.find(t => t.relPath.endsWith('.htm'));

      if (!htmlFileObj) {
        alert('No HTML file found at root level or in the folder.');
        return;
      }

      let htmlContent = await this.readFileAsText(htmlFileObj.file);

      // Read all CSS stylesheets
      const cssFileObjs = textFiles.filter(t => t.relPath.endsWith('.css'));
      const cssMap = new Map<string, string>();
      for (const cssObj of cssFileObjs) {
        const cssContent = await this.readFileAsText(cssObj.file);
        cssMap.set(cssObj.relPath, cssContent);
        const fileName = cssObj.relPath.split('/').pop();
        if (fileName && fileName !== cssObj.relPath) {
          cssMap.set(fileName, cssContent);
        }
      }

      // Read all JS files
      const jsFileObjs = textFiles.filter(t => t.relPath.endsWith('.js'));
      const jsMap = new Map<string, string>();
      for (const jsObj of jsFileObjs) {
        const jsContent = await this.readFileAsText(jsObj.file);
        jsMap.set(jsObj.relPath, jsContent);
        const fileName = jsObj.relPath.split('/').pop();
        if (fileName && fileName !== jsObj.relPath) {
          jsMap.set(fileName, jsContent);
        }
      }

      // Inline style sheets referenced by <link rel="stylesheet" href="...">
      const stylesheetRegex = /<link\b[^>]*href=["']([^"']*)["'][^>]*rel=["']stylesheet["'][^>]*>|<link\b[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["'][^>]*>/gi;
      htmlContent = htmlContent.replace(stylesheetRegex, (match, href1, href2) => {
        const hrefPath = href1 || href2;
        if (!hrefPath) return match;
        const cleanPath = hrefPath.replace(/^\.\//, '');
        let cssCode = cssMap.get(cleanPath);
        if (!cssCode) {
          const fileName = cleanPath.split('/').pop();
          if (fileName) cssCode = cssMap.get(fileName);
        }
        if (cssCode) {
          return `<style>\n/* Inline of ${hrefPath} */\n${cssCode}\n</style>`;
        }
        return match;
      });

      // Inline scripts referenced by <script src="..."></script>
      const scriptRegex = /<script\b[^>]*src=["']([^"']*)["'][^>]*>\s*<\/script>/gi;
      htmlContent = htmlContent.replace(scriptRegex, (match, srcPath) => {
        const cleanPath = srcPath.replace(/^\.\//, '');
        let jsCode = jsMap.get(cleanPath);
        if (!jsCode) {
          const fileName = cleanPath.split('/').pop();
          if (fileName) jsCode = jsMap.get(fileName);
        }
        if (jsCode) {
          return `<script>\n/* Inline of ${srcPath} */\n${jsCode}\n</script>`;
        }
        return match;
      });

      // Process remaining/combined CSS
      let combinedCss = '';
      for (const cssObj of cssFileObjs) {
        const cssContent = cssMap.get(cssObj.relPath) || '';
        if (!htmlContent.includes(`/* Inline of ${cssObj.relPath} */`)) {
          combinedCss += `/* ${cssObj.relPath} */\n${cssContent}\n`;
        }
      }

      // Process remaining JS files (append at the end of body or end of HTML)
      let extraJs = '';
      for (const jsObj of jsFileObjs) {
        const jsCode = jsMap.get(jsObj.relPath) || '';
        if (!htmlContent.includes(`/* Inline of ${jsObj.relPath} */`)) {
          extraJs += `\n<script>\n/* Extra JS from ${jsObj.relPath} */\n${jsCode}\n</script>`;
        }
      }
      if (extraJs) {
        if (htmlContent.includes('</body>')) {
          htmlContent = htmlContent.replace('</body>', `${extraJs}\n</body>`);
        } else {
          htmlContent += extraJs;
        }
      }

      // Read images concurrently into Base64 map
      const imageMap = new Map<string, string>();
      await Promise.all(
        imageFiles.map(async imgObj => {
          try {
            const base64 = await this.readFileAsDataURL(imgObj.file);
            imageMap.set(imgObj.relPath, base64);
            const fileName = imgObj.relPath.split('/').pop();
            if (fileName && fileName !== imgObj.relPath) {
              imageMap.set(fileName, base64);
            }
          } catch (e) {
            console.error('Failed to read image file:', imgObj.relPath, e);
          }
        })
      );

      // Perform path-to-base64 replacement in HTML and CSS
      // Sort keys by length descending to prevent shorter paths (e.g. filename) from breaking longer paths (e.g. dir/filename)
      const sortedEntries = Array.from(imageMap.entries()).sort((a, b) => b[0].length - a[0].length);
      for (const [relPath, base64] of sortedEntries) {
        htmlContent = htmlContent.split(relPath).join(base64);
        combinedCss = combinedCss.split(relPath).join(base64);

        const dotSlashPath = './' + relPath;
        htmlContent = htmlContent.split(dotSlashPath).join(base64);
        combinedCss = combinedCss.split(dotSlashPath).join(base64);

        const backslashPath = relPath.split('/').join('\\');
        htmlContent = htmlContent.split(backslashPath).join(base64);
        combinedCss = combinedCss.split(backslashPath).join(base64);
      }

      // Populate input states and switch back to Paste tab for confirmation
      this.importName.set(folderName.replace(/[_-]/g, ' '));
      this.importHtml.set(htmlContent);
      this.importCss.set(combinedCss);
      this.importTab.set('paste');
      
      // Delay alert with setTimeout so change detection runs first and shows data in textareas
      setTimeout(() => {
        alert(`Folder "${folderName}" processed successfully! Click "Create Template" on the Paste HTML tab to save it.`);
      }, 150);

    } catch (err) {
      console.error('Folder upload failed:', err);
      alert('Folder upload failed: ' + (err instanceof Error ? err.message : err));
    }
  }

  async doImport(): Promise<void> {
    const name = this.importName().trim();
    let html = this.importHtml().trim();
    let css = this.importCss().trim();
    if (!name || !html) return;

    // Extract inline CSS and clean HTML structure if it contains full page content
    if (html.toLowerCase().includes('<style') || html.toLowerCase().includes('<body')) {
      const parsed = this.parseHtmlContent(html);
      html = parsed.html;
      if (parsed.css) {
        css = css ? css + '\n' + parsed.css : parsed.css;
      }
    }

    await this.store.saveTemplate(name, html, css, undefined, this.importThumb().trim() || undefined);
    this.showImport.set(false);
    this.importName.set('');
    this.importThumb.set('');
    this.importHtml.set('');
    this.importCss.set('');
  }

  editTemplate(t: SavedTemplate): void {
    this.edit.emit(t);
  }

  previewTemplate(t: SavedTemplate): void {
    this.previewTemplateData.set(t);
  }

  confirmDelete(t: SavedTemplate): void {
    this.deleteTarget.set(t);
  }

  async doDelete(id: string): Promise<void> {
    await this.store.deleteTemplate(id);
    this.deleteTarget.set(null);
  }

  // URL extraction helper to resolve absolute URLs relative to base page path
  private resolveUrl(base: string, relative: string): string {
    try {
      return new URL(relative, base).href;
    } catch {
      return relative;
    }
  }

  // Robust CORS bypass proxy fetcher with fallbacks (corsproxy.io -> api.allorigins.win)
  private async fetchViaProxy(absUrl: string, type: 'text' | 'blob' = 'text'): Promise<any> {
    // Detect local development URLs (localhost, 127.0.0.1, etc.)
    let isLocal = false;
    try {
      const u = new URL(absUrl);
      if (
        u.hostname === 'localhost' ||
        u.hostname === '127.0.0.1' ||
        u.hostname === '0.0.0.0' ||
        u.hostname.startsWith('192.168.') ||
        u.hostname.startsWith('10.')
      ) {
        isLocal = true;
      }
    } catch {}

    if (isLocal) {
      try {
        const res = await fetch(absUrl);
        if (res.ok) {
          return type === 'blob' ? await res.blob() : await res.text();
        }
        throw new Error(`Local server returned status ${res.status}`);
      } catch (e) {
        console.warn(`Direct local fetch failed for: ${absUrl}. Trying public proxies...`, e);
      }
    }

    // 1. Try corsproxy.io (direct proxy stream)
    try {
      const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(absUrl)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        return type === 'blob' ? await res.blob() : await res.text();
      }
    } catch (e) {
      console.warn(`corsproxy.io failed for: ${absUrl}. Trying fallback...`, e);
    }

    // 2. Try api.allorigins.win as fallback
    try {
      if (type === 'blob') {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(absUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) return await res.blob();
      } else {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(absUrl)}`;
        const res = await fetch(proxyUrl);
        if (res.ok) {
          const json = await res.json();
          return json.contents;
        }
      }
    } catch (e) {
      console.error(`allorigins fallback failed for: ${absUrl}`, e);
    }
    
    throw new Error(
      isLocal 
        ? `Failed to fetch local URL: ${absUrl}. Ensure your local server is running and CORS headers are configured.`
        : `All CORS proxies failed to fetch: ${absUrl}`
    );
  }

  // Import URL feature
  async importFromUrl(urlStr: string): Promise<void> {
    const targetUrl = (urlStr || '').trim();
    if (!targetUrl) return;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error('Protocol must be http or https');
      }
    } catch (e) {
      alert('Please enter a valid website URL starting with http:// or https://');
      return;
    }

    this.isLoadingUrl.set(true);
    try {
      // 1. Fetch website HTML through proxy helper
      const htmlContent = await this.fetchViaProxy(targetUrl, 'text');
      if (!htmlContent) {
        throw new Error('Proxy returned empty content. Verify the URL is correct.');
      }

      // Determine document base URL path
      const baseUrl = parsedUrl.origin + parsedUrl.pathname;

      // Parse text into HTML DOM structure
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Set default name from document title or domain
      const extractedTitle = doc.title?.trim() || parsedUrl.hostname.replace('www.', '') + ' Page';
      let combinedCss = '';

      // Helper to fetch binary assets through proxy and output Base64 Data URLs
      const fetchRawAsBase64 = async (absUrl: string): Promise<string | null> => {
        try {
          const blob = await this.fetchViaProxy(absUrl, 'blob');
          if (!blob) return null;
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn(`Failed to proxy binary asset: ${absUrl}`, e);
          return null;
        }
      };

      // 2. Fetch external CSS files and merge them
      const stylesheetLinks = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
      for (const link of stylesheetLinks) {
        const href = link.getAttribute('href');
        if (!href) continue;
        const absHref = this.resolveUrl(baseUrl, href);
        try {
          const cssText = await this.fetchViaProxy(absHref, 'text');
          if (cssText) {
            combinedCss += `\n/* Inlined Stylesheet: ${href} */\n${cssText}\n`;
            link.remove();
          }
        } catch (cssErr) {
          console.warn(`Failed to fetch stylesheet: ${absHref}`, cssErr);
        }
      }

      // 3. Inline images inside <img src="..."> tags
      const imgElements = Array.from(doc.querySelectorAll('img'));
      for (const img of imgElements) {
        const src = img.getAttribute('src');
        if (!src || src.startsWith('data:')) continue;
        const absSrc = this.resolveUrl(baseUrl, src);
        const base64 = await fetchRawAsBase64(absSrc);
        if (base64) {
          img.setAttribute('src', base64);
        }
      }

      // Helper to scan for background images in CSS and convert them to Base64
      const processCssUrls = async (cssText: string): Promise<string> => {
        const urlRegex = /url\(['"]?([^'")]+)['"]?\)/gi;
        let match;
        const urlReplacements: { matchStr: string, base64: string }[] = [];
        
        while ((match = urlRegex.exec(cssText)) !== null) {
          const cssUrl = match[1];
          if (cssUrl.startsWith('data:') || cssUrl.startsWith('http') || cssUrl.startsWith('//')) continue;
          const absCssUrl = this.resolveUrl(baseUrl, cssUrl);
          const base64 = await fetchRawAsBase64(absCssUrl);
          if (base64) {
            urlReplacements.push({ matchStr: match[0], base64: `url("${base64}")` });
          }
        }
        
        let updatedCss = cssText;
        for (const r of urlReplacements) {
          updatedCss = updatedCss.split(r.matchStr).join(r.base64);
        }
        return updatedCss;
      };

      // 4. Extract and remove inline style elements, merging them into unified CSS
      const inlineStyleEls = Array.from(doc.querySelectorAll('style'));
      for (const styleEl of inlineStyleEls) {
        if (styleEl.textContent) {
          const parsedStyles = await processCssUrls(styleEl.textContent);
          combinedCss += `\n/* Inline styling block */\n${parsedStyles}\n`;
        }
        styleEl.remove();
      }

      // Process combined CSS to update background image URLs
      combinedCss = await processCssUrls(combinedCss);

      // Clean up metadata / extra elements
      const scripts = Array.from(doc.querySelectorAll('script[src]'));
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (!src) continue;
        // Strip trackers / third-party absolute scripts to avoid security blocks or errors in GrapesJS canvas
        if (src.startsWith('http') || src.startsWith('//')) {
          script.remove();
          continue;
        }
        const absSrc = this.resolveUrl(baseUrl, src);
        try {
          const jsText = await this.fetchViaProxy(absSrc, 'text');
          if (jsText) {
            const inlineScript = doc.createElement('script');
            inlineScript.textContent = `/* Inlined Script: ${src} */\n${jsText}\n`;
            script.parentNode?.replaceChild(inlineScript, script);
          }
        } catch {
          script.remove();
        }
      }

      // Remove leftover link stylesheets
      Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).forEach(l => l.remove());

      // Get clean body html
      const bodyHtml = doc.body ? doc.body.innerHTML : doc.documentElement.innerHTML;

      // Populate input states
      this.importName.set(extractedTitle);
      this.importHtml.set(bodyHtml);
      this.importCss.set(combinedCss);
      this.importTab.set('paste');

      setTimeout(() => {
        alert(`URL processed successfully! Extracted HTML content & styles. Click "Create Template" to finalize.`);
      }, 150);

    } catch (err) {
      console.error('URL import failed:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      alert(
        `URL import failed: ${errMsg}\n\n` +
        `Note: Many websites block public CORS proxies (e.g. Cloudflare / DDoS protection). ` +
        `If this URL continues to fail, you can save the website's HTML locally in your browser ` +
        `and import it using the "Upload File" or "Import Folder" tabs, which run entirely offline and won't get blocked.`
      );
    } finally {
      this.isLoadingUrl.set(false);
    }
  }
}

