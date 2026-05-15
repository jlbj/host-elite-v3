import { useState } from 'react';
import { useEditorStore } from '../store/useEditorStore';
import { SectionConfigPanel } from './SectionConfigPanel';
import { SECTION_TYPES } from '../lib/constants';
import { Scissors, Undo2, Redo2, Merge } from 'lucide-react';

type SidebarTab = 'sections' | 'config';

export function EditorSidebar() {
  const sidebarOpen = useEditorStore((s) => s.sidebarOpen);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const addSection = useEditorStore((s) => s.addSection);
  const selectedSectionId = useEditorStore((s) => s.selectedSectionId);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const pageConfig = useEditorStore((s) => s.pageConfig);
  const setSelectedSection = useEditorStore((s) => s.setSelectedSection);
  const assignSectionToBlock = useEditorStore((s) => s.assignSectionToBlock);
  const splitBlock = useEditorStore((s) => s.splitBlock);
  const undo = useEditorStore((s) => s.undoBlocks);
  const redo = useEditorStore((s) => s.redoBlocks);
  const mergeBlocks = useEditorStore((s) => s.mergeBlocks);
  const selectedBlockIds = useEditorStore((s) => s.selectedBlockIds);
  const blockHistory = useEditorStore((s) => s.blockHistory);

  const [activeTab, setActiveTab] = useState<SidebarTab>('sections');

  const sortedSections = [...pageConfig.sections].sort((a, b) => a.order - b.order);
  const showBlockTools = selectedBlockId;

  const handleSectionTypeClick = (sectionType: string) => {
    const existingSection = sortedSections.find(s => s.type === sectionType);
    
    if (existingSection) {
      if (selectedBlockId) {
        if (selectedSectionId === existingSection.id) {
          assignSectionToBlock(selectedBlockId, '');
          setSelectedSection(null);
        } else {
          assignSectionToBlock(selectedBlockId, existingSection.id);
          setSelectedSection(existingSection.id);
        }
      } else {
        setSelectedSection(existingSection.id);
      }
    } else {
      addSection(sectionType as any);
    }
  };

  return (
    <>
      {!sidebarOpen && (
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          ☰ Sections
        </button>
      )}

      <div className={`editor-sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        {sidebarOpen && (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActiveTab('sections')}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      background: activeTab === 'sections' ? '#3b82f6' : '#f1f5f9',
                      color: activeTab === 'sections' ? '#fff' : '#64748b',
                      fontSize: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    Sections
                  </button>
                  <button
                    onClick={() => setActiveTab('config')}
                    disabled={!selectedSectionId}
                    style={{
                      padding: '6px 12px',
                      border: 'none',
                      borderRadius: '6px',
                      background: activeTab === 'config' ? '#3b82f6' : '#f1f5f9',
                      color: !selectedSectionId ? '#94a3b8' : activeTab === 'config' ? '#fff' : '#64748b',
                      fontSize: '13px',
                      cursor: selectedSectionId ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Config
                  </button>
                </div>
                <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                  ✕
                </button>
              </div>

              {activeTab === 'sections' && showBlockTools && (
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                  <button
                    onClick={() => splitBlock(selectedBlockId!, 'vertical')}
                    title="Split Vertical"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <Scissors size={14} className="paving-icon-rotated" />
                  </button>
                  <button
                    onClick={() => splitBlock(selectedBlockId!, 'horizontal')}
                    title="Split Horizontal"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: '#f8fafc',
                      cursor: 'pointer',
                    }}
                  >
                    <Scissors size={14} />
                  </button>
                  <button
                    onClick={undo}
                    disabled={!blockHistory.past.length}
                    title="Undo"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: blockHistory.past.length ? '#f8fafc' : '#f1f5f9',
                      cursor: blockHistory.past.length ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Undo2 size={14} />
                  </button>
                  <button
                    onClick={redo}
                    disabled={!blockHistory.future.length}
                    title="Redo"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: blockHistory.future.length ? '#f8fafc' : '#f1f5f9',
                      cursor: blockHistory.future.length ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Redo2 size={14} />
                  </button>
                  <button
                    onClick={() => selectedBlockIds.length === 2 && mergeBlocks(selectedBlockIds[0], selectedBlockIds[1])}
                    disabled={selectedBlockIds.length !== 2}
                    title="Merge selected blocks"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      border: '1px solid #e2e8f0',
                      borderRadius: '6px',
                      background: selectedBlockIds.length === 2 ? '#f8fafc' : '#f1f5f9',
                      cursor: selectedBlockIds.length === 2 ? 'pointer' : 'not-allowed',
                    }}
                  >
                    <Merge size={14} />
                  </button>
                </div>
              )}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {activeTab === 'sections' ? (
                <div style={{ padding: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {SECTION_TYPES.map((st) => {
                      const existingSection = sortedSections.find(s => s.type === st.type);
                      const isSelected = existingSection ? selectedSectionId === existingSection.id : false;
                      return (
                        <div
                          key={st.type}
                          onClick={() => handleSectionTypeClick(st.type)}
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '10px 6px',
                            border: isSelected ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                            borderRadius: '6px',
                            background: isSelected ? '#eff6ff' : '#f8fafc',
                            cursor: 'pointer',
                            fontSize: '11px',
                            color: '#475569',
                          }}
                        >
                          <span style={{ fontSize: '18px' }}>{st.icon}</span>
                          <span style={{ fontWeight: isSelected ? 600 : 400 }}>{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : <SectionConfigPanel />}
            </div>
          </>
        )}
      </div>
    </>
  );
}
