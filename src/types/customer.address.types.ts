/** Customer delivery addresses — one shopper can keep several. */

export interface Address {
  id: number;
  full_name: string;
  phone_number: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

/** The form payload. `id` is assigned by the server. */
export type AddressInput = Omit<Address, "id" | "is_default"> & {
  is_default?: boolean;
};

export interface AddressListResult {
  results: Address[];
  count: number;
}
