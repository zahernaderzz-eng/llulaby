/**
 * Detect if text contains Arabic characters
 */
export function detectLanguage(text: string): 'ar' | 'en' {
    if (!text || !text.trim()) {
        return 'en';
    }

    // Arabic Unicode range: \u0600-\u06FF (Arabic), \u0750-\u077F (Arabic Supplement)
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;

    return arabicRegex.test(text) ? 'ar' : 'en';
}
