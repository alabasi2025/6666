// server/settings/types.ts

export type SettingType = 'string' | 'number' | 'boolean' | 'json' | 'array';
export type SettingScope = 'system' | 'business' | 'user';

export interface SettingDefinition {
  key: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  type: SettingType;
  scope: SettingScope;
  defaultValue: unknown;
  category: string;
  validation?: SettingValidation;
  options?: SettingOption[];
  isSecret?: boolean;
  isReadOnly?: boolean;
}

export interface SettingValidation {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: unknown[];
}

export interface SettingOption {
  value: unknown;
  label: string;
  labelAr: string;
}

export interface SettingValue {
  key: string;
  value: unknown;
  scope: SettingScope;
  scopeId?: number; // businessId or userId
  updatedAt: Date;
  updatedBy?: number;
}

export interface SettingsGroup {
  category: string;
  categoryAr: string;
  settings: SettingDefinition[];
}
