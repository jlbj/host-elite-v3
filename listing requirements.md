Listing Editor User Requirements
This document outlines the requirements and expected behavior for the Universal Listing Editor. This editor will be built as a native Angular component embedded directly inside the new Universal Editor architecture. Please review and correct any discrepancies to ensure 100% alignment before implementation begins.

1. Predefined Layouts
There are 4 predefined layouts available in the editor:

List (1-column stack, equal rows)
2-Columns (2x2 grid style)
Hero First (Large top block, smaller subsequent blocks)
Magazine (Custom grid layout)
1.1 Layout Structure
All layouts, including predefined ones, are fundamentally composed of a grid of Blocks.
Each predefined layout will have a specific default block arrangement and sizes.
Predefined layouts will come with sections automatically allocated/assigned to their respective blocks (default allocation TBD).
Important: A single section can be assigned to multiple different blocks simultaneously. Furthermore, display settings are tied to the Block itself, not the Section. This allows the same section to be displayed with different visual configurations in different blocks.
2. Display Mode vs. Edition Mode
2.1 Default Display Mode
When a user selects any layout from the dropdown, it is immediately rendered on the canvas in "Display Mode".
In this mode, the actual assigned sections (Property Details, Photos, etc.) are rendered inside their respective blocks.
Block boundaries, scissors, and resize handles are hidden to provide a clean preview.
The "Edit Layout" pen icon in the top toolbar is removed, as editing is now exclusively inline.
2.2 Entering Edition Mode
Simply clicking a block selects and highlights it, making the inline tools (like scissors) visible.
The editor formally transitions into Edition Mode (where the top toolbar updates to show Save/Cancel) ONLY when a layout modification occurs. A modification is defined as:
Splitting a block (horizontally or vertically)
Resizing a block (dragging a separator)
Assigning a different section to a block from the sidebar
2.3 Integration within Universal Editor
The layout editing canvas (PavingCanvas/LayoutEditorComponent) will be integrated directly into the new Angular UniversalEditorComponent.
When a user enters Edition Mode or clicks to "Edit Layout", the right-side PreviewPanelComponent will be completely replaced by the interactive grid editing canvas.
This maintains a "single app" architecture, cleanly separating the layout editor while seamlessly blending it with the existing 4-step wizard.
2.4 Full Display Mode (Preview)
The editor will feature a "Full Display Mode" toggle.
When activated, the layout will expand to fill the entire available browser space, hiding editor UI elements (toolbars, sidebars) so the user can visualize the page exactly as it will finally render to end-users.
A visible control (e.g., an overlay button or a keyboard shortcut like Escape) must be available to easily exit this mode and return to the standard working size view.
3. Edition Mode Mechanics
When Edition Mode is active, the following tools and behaviors become available:

3.1 Block Editing Tools
Split Tool (Scissors): Available on the currently selected block, allowing the user to split the block horizontally (H) or vertically (V).
Vertical Split: The selected block is divided into two equally sized adjacent (left/right) blocks. The left block retains the initial section and its display settings, while the right block is assigned the empty section.
Horizontal Split: The selected block is divided into two equally sized adjacent (top/bottom) blocks. The top block retains the initial section and its display settings, while the bottom block is assigned the empty section.
Merge Tool: Available when the user selects exactly two adjacent blocks that form a perfect rectangle.
Undo / Redo: Available to revert or reapply structural block changes (splits, merges, resizes) during the current editing session.
3.2 Block & Canvas Resizing
Separator Handles: The visual edges (separators) between blocks will have visibly rendered drag handles.
Snapping Mechanism: When the user clicks and drags these borders to dynamically resize adjacent blocks, the separator will automatically snap to align with other existing block separators in the layout, making grid alignment effortless.
Canvas Expansion: The overall width of the layout is limited to the display port (frame width). However, the total height of the canvas frame can be expanded or reduced by selecting the bottom-most block and dragging its bottom separator up or down.
3.3 Saving and Canceling
When Edition Mode is active, the top toolbar updates to display Save and Cancel buttons specifically for the layout modifications.
Save: Allows the user to save their modified layout as a new "Custom Layout" (or overwrite an existing custom one).
Cancel: Aborts the inline editing session, discarding all structural block changes and reverting the layout to its previous state.
4. Section Data & Property Mapping
4.1 Data Source
The predefined list of available sections (Hero, Photos, Description, etc.) dynamically populate their content using data directly from the Property Details information.
4.2 Field Mapping
Currently, the data mapping between the Property Details database fields and the respective section content variables is defined by a default, hardcoded fallback.
Future Requirement: A formal data mapping tool will be built within the Admin section. This tool will allow administrators to explicitly define and customize exactly how property data fields are mapped onto the display variables of each section type.