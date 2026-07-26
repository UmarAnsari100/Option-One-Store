/**
 * aiService - Extension points for AI modules
 * (AI Description Generator, AI SEO, AI Tag Generator, AI Recommendations)
 */
export const aiService = {
  async generateLuxuryDescription(productName, category) {
    // Modular mock generator ready for OpenAI / Gemini / DeepSeek integration
    return `Indulge in uncompromised sophistication with the ${productName}. Designed for discerning connoisseurs, this ${category} masterpiece blends classic heritage with modern precision engineering. Hand-finished accents and premium material composition deliver a commanding presence for any executive ensemble.`;
  },

  async generateSeoKeywords(productName, category) {
    const baseWords = productName.split(' ');
    return [
      `buy ${productName.toLowerCase()} Pakistan`,
      `luxury ${category.toLowerCase()}`,
      `best ${baseWords[0] || ''} online store`,
      'option one store luxury collection'
    ].join(', ');
  }
};
