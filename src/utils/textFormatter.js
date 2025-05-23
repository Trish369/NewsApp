/**
 * Truncate text to a specified length and add ellipsis if needed
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length of the truncated text
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 150) {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Format article content for display
 * @param {string} content - Article content
 * @returns {Array<string>} Array of paragraphs
 */
export function formatArticleContent(content) {
  if (!content) return [];
  
  // Split content into paragraphs
  return content.split('\n').filter(paragraph => paragraph.trim() !== '');
}

/**
 * Convert plain text with URLs to text with clickable links
 * @param {string} text - Text to process
 * @returns {Array} Array of text and link elements
 */
export function linkifyText(text) {
  if (!text) return [];
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split text by URLs
  const parts = text.split(urlRegex);
  
  // Match all URLs
  const urls = text.match(urlRegex) || [];
  
  // Combine parts and URLs
  const result = [];
  
  parts.forEach((part, index) => {
    if (part) {
      result.push(part);
    }
    
    if (urls[index]) {
      result.push({
        type: 'link',
        url: urls[index],
        text: urls[index]
      });
    }
  });
  
  return result;
}

/**
 * Format a number for display (e.g., 1000 -> 1K)
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  
  if (num < 1000) {
    return num.toString();
  }
  
  if (num < 1000000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  
  return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
}