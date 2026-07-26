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
          instagram: 'https://instagram.com/optiononestore',
          facebook: 'https://facebook.com/optiononestore',
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
