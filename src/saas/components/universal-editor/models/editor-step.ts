export interface EditorStep {
    id: string;
    title: string;
    icon: string;
    description?: string;
    required: boolean;
    completed: boolean;
}

export const DEFAULT_WIZARD_STEPS: EditorStep[] = [
    {
        id: 'layout',
        title: 'EDITOR.StepLayout',
        icon: '📐',
        description: 'EDITOR.StepLayoutDesc',
        required: true,
        completed: false
    },
    {
        id: 'theme',
        title: 'EDITOR.StepTheme',
        icon: '🎨',
        description: 'EDITOR.StepThemeDesc',
        required: true,
        completed: false
    },
    {
        id: 'sections',
        title: 'EDITOR.StepSections',
        icon: '📑',
        description: 'EDITOR.StepSectionsDesc',
        required: false,
        completed: false
    },
    {
        id: 'content',
        title: 'EDITOR.StepContent',
        icon: '✏️',
        description: 'EDITOR.StepContentDesc',
        required: true,
        completed: false
    }
];

export interface WizardState {
    currentStep: number;
    steps: EditorStep[];
    canProceed: boolean;
    completionPercentage: number;
}
