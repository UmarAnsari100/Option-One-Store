import { BaseRepository } from './BaseRepository';

/**
 * SettingsRepository - Handles Theme Customizer, Announcement Bar, Logo, Pricing Rules, & Store Config.
 */
export class SettingsRepository extends BaseRepository {
  constructor() {
    super('option_one_theme_settings_v2');
    this.initDefaults();
  }

  initDefaults() {
    const existing = this.getLocalData();
    if (!existing || Object.keys(existing).length === 0) {
      const defaultSettings = {
        announcementText: 'Complimentary Express Shipping on Orders Over Rs. 40,000 | Maison de Luxe',
        announcementEnabled: true,
        storeName: 'Option One Store',
        logoSubtitle: 'Maison de Luxe',
        accentColor: '#C9A227', // Gold Accent
        pricingRules: {
          defaultMarginPercent: 30, // 30% profit margin
          handlingFee: 5,           // $5 handling fee
          taxPercent: 8,            // 8% tax
          roundTo99: true
        },
        socialLinks: {
          instagram: 'https://www.instagram.com/option_one_store/',
          facebook: 'https://www.facebook.com/p/Option-One-Store-100084635444046/',
          tiktok: 'https://www.tiktok.com/@khan_ag?_r=1&_t=ZS-99hCFMQSiRR',
          twitter: 'https://x.com/AG95a4',
          youtube: 'https://www.youtube.com/@agkhan12168',
          whatsapp: '+923000000000'
        }
      };

      this.setLocalData(defaultSettings);
    }
  }

  getSettings() {
    return this.getLocalData();
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings, updatedAt: new Date().toISOString() };
    this.setLocalData(updated);
    return updated;
  }
}

export const settingsRepository = new SettingsRepository();
