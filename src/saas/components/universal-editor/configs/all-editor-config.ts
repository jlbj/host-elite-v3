import { LISTING_SECTIONS } from '../models/editor-section';
import { WELCOME_BOOKLET_SECTIONS } from '../models/editor-section';

/**
 * Combines the basic listing sections with every booklet section so that the
 * listing editor can edit *all* property information.
 */
export const ALL_EDITOR_SECTIONS = [
  ...LISTING_SECTIONS,
  // Append booklet sections that are not already present (avoid duplicate ids)
  ...WELCOME_BOOKLET_SECTIONS.filter(
    wb => !LISTING_SECTIONS.some(ls => ls.id === wb.id)
  ),
];
