import { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { THEMES } from '../lib/constants';
import { LayoutManager } from './LayoutManager';

type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';

const VIEW_OPTIONS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'mobile', label: 'Mobile', icon: '📱' },
  { id: 'mobile-horizontal', label: 'Mobile H', icon: '📱' },
  { id: 'tablet', label: 'Tablet', icon: '📱' },
  { id: 'desktop', label: 'Desktop', icon: '💻' },
];

export function EditorToolbar() {
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const setLayout = useEditorStore((s) => s.setLayout);
  const editLayout = useEditorStore((s) => s.editLayout);
  const cancelEditing = useEditorStore((s) => s.cancelEditing);
  const saveCustomLayout = useEditorStore((s) => s.saveCustomLayout);
  const deleteCustomLayout = useEditorStore((s) => s.deleteCustomLayout);
  const setTheme = useEditorStore((s) => s.setTheme);
  const setViewMode = useEditorStore((s) => s.setViewMode);
  const viewMode = useEditorStore((s) => s.viewMode);
  const saveConfig = useEditorStore((s) => s.saveConfig);
  const isSaving = useEditorStore((s) => s.isSaving);
  const propertyData = useEditorStore((s) => s.propertyData);
  const availableLayouts = useEditorStore((s) => s.availableLayouts);
  const loadLayouts = useEditorStore((s) => s.loadLayouts);
  const isLayoutEditing = useEditorStore((s) => s.isLayoutEditing);
  const selectedCustomLayoutId = useEditorStore((s) => s.selectedCustomLayoutId);
  const editingLayoutId = useEditorStore((s) => s.editingLayoutId);
  
  const [layoutManagerOpen, setLayoutManagerOpen] = useState(false);
  const [layoutManagerMode] = useState<'save' | 'load'>('save');
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const dropdownValue = isLayoutEditing ? editingLayoutId : (selectedCustomLayoutId || pageConfig.layout);

  // Load layouts on mount
  useEffect(() => {
    loadLayouts();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLayoutDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLayout = availableLayouts.find(l => l.id === dropdownValue) || 
    { name: pageConfig.layout === 'custom' ? 'Custom' : pageConfig.layout };

  const handleLayoutSelect = (layoutId: string) => {
    setLayout(layoutId);
    setLayoutDropdownOpen(false);
  };

  const handleLayoutEdit = (layoutId: string) => {
    editLayout(layoutId);
    setLayoutDropdownOpen(false);
  };

  const handleLayoutDelete = async (layoutId: string) => {
    await deleteCustomLayout(layoutId);
    setLayoutDropdownOpen(false);
  };

  const handleSaveClick = async () => {
    if (pageConfig.layout === 'custom') {
      const isEditingCustom = editingLayoutId && availableLayouts.find(l => l.id === editingLayoutId)?.type === 'custom';
      if (isEditingCustom) {
        // Update in place
        await saveCustomLayout('');
      } else {
        // Show name input for save-as-new
        const existingLayout = editingLayoutId ? availableLayouts.find(l => l.id === editingLayoutId) : null;
        setSaveName(existingLayout ? `${existingLayout.name} (copy)` : '');
        setShowSaveInput(true);
      }
    } else {
      try {
        await saveConfig();
      } catch (e) {
        console.error('Save failed:', e);
      }
    }
  };

  const handleSaveConfirm = async () => {
    if (!saveName.trim()) return;
    const success = await saveCustomLayout(saveName.trim());
    if (success) {
      setShowSaveInput(false);
      setSaveName('');
    }
  };

  const handleCancelEdit = () => {
    setShowSaveInput(false);
    setSaveName('');
    cancelEditing();
  };

  return (
    <div className="editor-toolbar">
      <div style={{ fontWeight: 600, fontSize: '14px' }}>
        {propertyData?.name || 'Property Editor'}
      </div>

      <div style={{ flex: 1 }} />

      <div style={{ display: 'flex', gap: '4px', marginRight: '16px' }}>
        {VIEW_OPTIONS.map((view) => (
          <button
            key={view.id}
            onClick={() => setViewMode(view.id)}
            title={view.label}
            style={{
              padding: '6px 10px',
              border: '1px solid',
              borderColor: viewMode === view.id ? '#3b82f6' : '#e2e8f0',
              borderRadius: '4px',
              background: viewMode === view.id ? '#eff6ff' : '#fff',
              color: viewMode === view.id ? '#3b82f6' : '#64748b',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {view.icon}
          </button>
        ))}
      </div>

      {/* Layout dropdown */}
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setLayoutDropdownOpen(!layoutDropdownOpen)}
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            minWidth: '140px',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentLayout.name}
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>▼</span>
        </button>

        {layoutDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: '4px',
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '220px',
            zIndex: 1000,
            maxHeight: '400px',
            overflowY: 'auto',
          }}>
            {availableLayouts.map((layout) => {
              const isActive = dropdownValue === layout.id;
              return (
                <div
                  key={layout.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: isActive ? '#eff6ff' : 'transparent',
                    borderBottom: '1px solid #f1f5f9',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => handleLayoutSelect(layout.id)}
                    style={{
                      flex: 1,
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '13px',
                      color: isActive ? '#3b82f6' : '#1e293b',
                      fontWeight: isActive ? 600 : 400,
                      padding: 0,
                    }}
                  >
                    {layout.name}
                  </button>
                  <button
                    onClick={() => handleLayoutEdit(layout.id)}
                    title="Edit layout"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      color: '#64748b',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    ✏️
                  </button>
                  {layout.type === 'custom' && (
                    <button
                      onClick={() => handleLayoutDelete(layout.id)}
                      title="Delete layout"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        color: '#ef4444',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isLayoutEditing && (
        <>
          {showSaveInput ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder="Layout name..."
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveConfirm(); if (e.key === 'Escape') handleCancelEdit(); }}
                autoFocus
                style={{
                  padding: '6px 10px',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  fontSize: '13px',
                  width: '140px',
                }}
              />
              <button
                onClick={handleSaveConfirm}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#3b82f6',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
              <button
                onClick={handleSaveClick}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #3b82f6',
                  borderRadius: '6px',
                  background: '#eff6ff',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Save Layout
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Cancel
              </button>
            </>
          )}
        </>
      )}

      <select
        value={pageConfig.theme}
        onChange={(e) => setTheme(e.target.value)}
        style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
      >
        {THEMES.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>

      <button
        className="btn btn-primary"
        onClick={handleSaveClick}
        disabled={isSaving}
      >
        {isSaving ? 'Saving...' : 'Save'}
      </button>

      <LayoutManager
        isOpen={layoutManagerOpen}
        onClose={() => setLayoutManagerOpen(false)}
        mode={layoutManagerMode}
      />
    </div>
  );
}
