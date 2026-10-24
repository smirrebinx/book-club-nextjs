import { validateSearchInput } from '../useFuzzySearch';

describe('validateSearchInput', () => {
  it('should trim whitespace', () => {
    expect(validateSearchInput('  hello  ')).toBe('hello');
    expect(validateSearchInput('\thello\n')).toBe('hello');
  });

  it('should enforce max length of 100 characters', () => {
    const longString = 'a'.repeat(150);
    const result = validateSearchInput(longString);
    expect(result.length).toBe(100);
    expect(result).toBe('a'.repeat(100));
  });

  it('should handle empty strings', () => {
    expect(validateSearchInput('')).toBe('');
    expect(validateSearchInput('   ')).toBe('');
  });

  it('should preserve strings within limits', () => {
    expect(validateSearchInput('Harry Potter')).toBe('Harry Potter');
    expect(validateSearchInput('The Great Gatsby')).toBe('The Great Gatsby');
  });

  it('should handle special characters securely', () => {
    const specialChars = '<script>alert("xss")</script>';
    // Should not strip special chars, just trim and limit length
    expect(validateSearchInput(specialChars)).toBe(specialChars);
  });

  it('should handle Swedish characters', () => {
    expect(validateSearchInput('Åsa Larsson')).toBe('Åsa Larsson');
    expect(validateSearchInput('Stieg Larsson - Män som hatar kvinnor')).toBe('Stieg Larsson - Män som hatar kvinnor');
  });
});

/**
 * Fuzzy Search Test Cases
 *
 * Manual test scenarios to verify fuzzy search functionality:
 *
 * 1. Typo tolerance:
 *    - Search: "Hary Poter" → Should find "Harry Potter"
 *    - Search: "Tolkin" → Should find "Tolkien"
 *    - Search: "Stieg Larrson" → Should find "Stieg Larsson"
 *
 * 2. Partial matches:
 *    - Search: "Män som" → Should find "Män som hatar kvinnor"
 *    - Search: "Lord Ring" → Should find "Lord of the Rings"
 *
 * 3. Case insensitivity:
 *    - Search: "HARRY" → Should find "Harry Potter"
 *    - Search: "gatsby" → Should find "The Great Gatsby"
 *
 * 4. Description search:
 *    - Search terms in book descriptions should also be found
 *
 * 5. Edge cases:
 *    - Empty search → Should show all books
 *    - Very short search (1 char) → Should show all books
 *    - Special characters → Should be handled safely
 *    - Max length (100 chars) → Should be truncated
 *
 * 6. Security:
 *    - XSS attempts → Should be safe (no script execution)
 *    - SQL injection patterns → Should not affect database (client-side only)
 */
