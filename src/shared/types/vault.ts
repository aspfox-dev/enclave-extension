export interface CustomVaultField {
  id: string;
  label: string;
  value: string;
}

export interface Vault {
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  customFields: CustomVaultField[];
}

export const MAX_CUSTOM_VAULT_FIELDS = 5;
