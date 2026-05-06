/**
 * @fileoverview Parser for Markdown files with TRIVIAIOX-MANAGED sections
 * @module merger/parsers/markdown-section-parser
 */

// Regex patterns for TRIVIAIOX markers
const TRIVIAIOX_START_MARKER = /^<!--\s*TRIVIAIOX-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->$/;
const TRIVIAIOX_END_MARKER = /^<!--\s*TRIVIAIOX-MANAGED-END:\s*([a-zA-Z0-9_-]+)\s*-->$/;
const HEADER_PATTERN = /^(#{1,6})\s+(.+)$/;

/**
 * Parsed section from markdown
 * @typedef {Object} ParsedSection
 * @property {string} id - Section identifier (slug or marker id)
 * @property {string} [title] - Section title (from header)
 * @property {number} [level] - Header level (1-6)
 * @property {number} startLine - Start line number (0-indexed)
 * @property {number} [endLine] - End line number (0-indexed)
 * @property {boolean} managed - True if TRIVIAIOX-MANAGED section
 * @property {string[]} lines - Lines in this section (excluding markers)
 */

/**
 * Result of parsing a markdown file
 * @typedef {Object} ParsedMarkdownFile
 * @property {ParsedSection[]} sections - All sections found
 * @property {boolean} hasTriviaioxMarkers - True if file has TRIVIAIOX-MANAGED markers
 * @property {string[]} preamble - Lines before first section
 * @property {string[]} rawLines - Original lines
 */

/**
 * Convert a string to a URL-friendly slug
 * @param {string} text - Text to slugify
 * @returns {string} Slugified text
 */
function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse a markdown file, identifying sections and TRIVIAIOX-MANAGED areas
 * @param {string} content - Markdown content
 * @returns {ParsedMarkdownFile} Parsed result
 */
function parseMarkdownSections(content) {
  if (!content || content.trim() === '') {
    return {
      sections: [],
      hasTriviaioxMarkers: false,
      preamble: [],
      rawLines: [],
    };
  }

  const lines = content.split('\n');
  const result = {
    sections: [],
    hasTriviaioxMarkers: false,
    preamble: [],
    rawLines: lines,
  };

  let currentSection = null;
  let triviaioxSection = null;
  let inPreamble = true;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for TRIVIAIOX start marker
    const startMatch = trimmed.match(TRIVIAIOX_START_MARKER);
    if (startMatch) {
      // Close any current non-managed section
      if (currentSection && !currentSection.managed) {
        currentSection.endLine = i - 1;
        result.sections.push(currentSection);
        currentSection = null;
      }

      // Start new TRIVIAIOX-managed section
      triviaioxSection = {
        id: startMatch[1],
        startLine: i,
        managed: true,
        lines: [],
      };
      result.hasTriviaioxMarkers = true;
      inPreamble = false;
      continue;
    }

    // Check for TRIVIAIOX end marker
    const endMatch = trimmed.match(TRIVIAIOX_END_MARKER);
    if (endMatch && triviaioxSection) {
      if (endMatch[1] === triviaioxSection.id) {
        triviaioxSection.endLine = i;
        result.sections.push(triviaioxSection);
        triviaioxSection = null;
      }
      continue;
    }

    // If we're in an TRIVIAIOX section, collect lines
    if (triviaioxSection) {
      triviaioxSection.lines.push(line);
      continue;
    }

    // Check for regular header
    const headerMatch = line.match(HEADER_PATTERN);
    if (headerMatch) {
      // Close any current section
      if (currentSection) {
        currentSection.endLine = i - 1;
        result.sections.push(currentSection);
      }

      // Start new section
      currentSection = {
        id: slugify(headerMatch[2]),
        title: headerMatch[2],
        level: headerMatch[1].length,
        startLine: i,
        managed: false,
        lines: [line],
      };
      inPreamble = false;
      continue;
    }

    // Regular content line
    if (inPreamble) {
      result.preamble.push(line);
    } else if (currentSection) {
      currentSection.lines.push(line);
    } else if (!triviaioxSection) {
      // Content after an TRIVIAIOX section but before next section
      // This shouldn't happen in well-formed files, but handle it
      result.preamble.push(line);
    }
  }

  // Close final section if open
  if (currentSection) {
    currentSection.endLine = lines.length - 1;
    result.sections.push(currentSection);
  }

  // Handle unclosed TRIVIAIOX section (malformed)
  if (triviaioxSection) {
    triviaioxSection.endLine = lines.length - 1;
    triviaioxSection.lines.push('<!-- WARNING: Unclosed TRIVIAIOX-MANAGED section -->');
    result.sections.push(triviaioxSection);
  }

  return result;
}

/**
 * Check if content has TRIVIAIOX-MANAGED markers
 * @param {string} content - Markdown content
 * @returns {boolean} True if markers found
 */
function hasTriviaioxMarkers(content) {
  if (!content) return false;
  // Check for both START and END markers
  const hasStart = /<!--\s*TRIVIAIOX-MANAGED-START:\s*[a-zA-Z0-9_-]+\s*-->/.test(content);
  const hasEnd = /<!--\s*TRIVIAIOX-MANAGED-END:\s*[a-zA-Z0-9_-]+\s*-->/.test(content);
  return hasStart && hasEnd;
}

/**
 * Get all TRIVIAIOX section IDs from content
 * @param {string} content - Markdown content
 * @returns {string[]} Array of section IDs
 */
function getTriviaioxSectionIds(content) {
  const ids = [];
  const matches = content.matchAll(/<!--\s*TRIVIAIOX-MANAGED-START:\s*([a-zA-Z0-9_-]+)\s*-->/g);
  for (const match of matches) {
    ids.push(match[1]);
  }
  return ids;
}

module.exports = {
  slugify,
  parseMarkdownSections,
  hasTriviaioxMarkers,
  getTriviaioxSectionIds,
};
