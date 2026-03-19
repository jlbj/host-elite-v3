import { Component, input, output, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, TOOLBAR_MINIMAL } from 'ngx-editor';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-rich-text-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, NgxEditorModule, TranslatePipe],
    template: `
        <!-- BACKUP: Original textarea field - kept for reference
        <textarea [formControlName]="fieldName()" rows="3"
            [attr.aria-label]="label()"
            [title]="label()"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            [placeholder]="'BOOKLET.EnterDetails' | translate"></textarea>
        -->
        <!-- ngx-editor (WYSIWYG) -->
        <div class="NgxEditor__Wrapper dark-editor rounded-lg overflow-hidden border border-slate-600">
            <ngx-editor-menu [editor]="editor()" [toolbar]="toolbarConfig"></ngx-editor-menu>
            <ngx-editor [editor]="editor()"
                [ngModel]="value()"
                (ngModelChange)="valueChange.emit($event)"
                [placeholder]="'BOOKLET.EnterDetails' | translate"
                class="dark-editor-content text-sm">
            </ngx-editor>
        </div>
    `,
    styles: [`
        :host { display: block; }
        .dark-editor ::ng-deep .NgxEditor {
            background: rgba(255,255,255,0.1);
            border: none;
            border-radius: 0;
            min-height: 80px;
        }
        .dark-editor ::ng-deep .NgxEditor__MenuBar {
            background: rgba(30,41,59,0.8);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 4px 8px;
        }
        .dark-editor ::ng-deep .NgxEditor__Content {
            color: white;
            font-size: 0.875rem;
        }
        .dark-editor ::ng-deep .NgxEditor__Content .NgxEditor__Placeholder {
            color: rgba(148,163,184,0.6);
        }
        .dark-editor ::ng-deep .NgxEditor__Content .ProseMirror {
            min-height: 80px;
            padding: 8px 12px;
        }
        .dark-editor ::ng-deep .NgxEditor__Content .ProseMirror:focus {
            outline: none;
        }
        .dark-editor ::ng-deep .NgxEditor__Content .ProseMirror p.is-editor-empty:first-child::before {
            color: rgba(148,163,184,0.5);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
        }
        .dark-editor ::ng-deep button {
            color: #cbd5e1;
        }
        .dark-editor ::ng-deep button:hover {
            color: white;
            background: rgba(255,255,255,0.1);
        }
        .dark-editor ::ng-deep button.active {
            color: #818cf8;
            background: rgba(129,140,248,0.2);
        }
    `]
})
export class RichTextEditorComponent implements OnInit, OnDestroy {
    fieldName = input.required<string>();
    label = input<string>('');
    value = input<string>('');
    valueChange = output<string>();

    readonly toolbarConfig = TOOLBAR_MINIMAL;

    private _editor: Editor | null = null;
    editor = signal<Editor>(new Editor());

    ngOnInit(): void {
        this._editor = new Editor();
        this.editor.set(this._editor);
    }

    ngOnDestroy(): void {
        if (this._editor) {
            this._editor.destroy();
            this._editor = null;
        }
    }
}

