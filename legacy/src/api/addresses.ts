import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database';

type Address = Database['public']['Tables']['addresses']['Row'];
type AddressInsert = Database['public']['Tables']['addresses']['Insert'];
type AddressUpdate = Database['public']['Tables']['addresses']['Update'];

export interface CreateAddressData {
  address_type: 'billing' | 'shipping' | 'both';
  recipient_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state_province: string;
  postal_code: string;
  country?: string;
  phone_number?: string;
  delivery_instructions?: string;
  nickname?: string;
  is_default?: boolean;
}

export const AddressesAPI = {
  // Get all addresses for current user
  async getAddresses(addressType?: 'billing' | 'shipping' | 'both'): Promise<Address[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    let query = supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.user.id);

    if (addressType) {
      query = query.or(`address_type.eq.${addressType},address_type.eq.both`);
    }

    query = query
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching addresses:', error);
      throw new Error(`Failed to fetch addresses: ${error.message}`);
    }

    return data || [];
  },

  // Get single address
  async getAddress(id: string): Promise<Address | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching address:', error);
      throw new Error(`Failed to fetch address: ${error.message}`);
    }

    return data;
  },

  // Create new address
  async createAddress(addressData: CreateAddressData): Promise<Address> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // If this is set as default, unset other defaults of the same type first
    if (addressData.is_default) {
      await this.unsetDefaultAddresses(addressData.address_type);
    }

    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: user.user.id,
        country: 'Philippines', // Default country
        ...addressData,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating address:', error);
      throw new Error(`Failed to create address: ${error.message}`);
    }

    return data;
  },

  // Update address
  async updateAddress(id: string, updates: Partial<CreateAddressData>): Promise<Address> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // If this is set as default, unset other defaults of the same type first
    if (updates.is_default && updates.address_type) {
      await this.unsetDefaultAddresses(updates.address_type);
    }

    const { data, error } = await supabase
      .from('addresses')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating address:', error);
      throw new Error(`Failed to update address: ${error.message}`);
    }

    return data;
  },

  // Delete address
  async deleteAddress(id: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', user.user.id);

    if (error) {
      console.error('Error deleting address:', error);
      throw new Error(`Failed to delete address: ${error.message}`);
    }
  },

  // Set address as default
  async setDefaultAddress(id: string, addressType: 'billing' | 'shipping' | 'both'): Promise<Address> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    // First, unset all defaults of this type
    await this.unsetDefaultAddresses(addressType);

    // Then set the new default
    const { data, error } = await supabase
      .from('addresses')
      .update({
        is_default: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error setting default address:', error);
      throw new Error(`Failed to set default address: ${error.message}`);
    }

    return data;
  },

  // Get default address
  async getDefaultAddress(addressType: 'billing' | 'shipping'): Promise<Address | null> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.user.id)
      .eq('is_default', true)
      .or(`address_type.eq.${addressType},address_type.eq.both`)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching default address:', error);
      throw new Error(`Failed to fetch default address: ${error.message}`);
    }

    return data;
  },

  // Helper function to unset default addresses of a specific type
  async unsetDefaultAddresses(addressType: 'billing' | 'shipping' | 'both'): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    let query = supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', user.user.id)
      .eq('is_default', true);

    if (addressType !== 'both') {
      query = query.or(`address_type.eq.${addressType},address_type.eq.both`);
    }

    const { error } = await query;

    if (error) {
      console.error('Error unsetting default addresses:', error);
      throw new Error(`Failed to unset default addresses: ${error.message}`);
    }
  },

  // Validate address data
  validateAddressData(data: CreateAddressData): string[] {
    const errors: string[] = [];

    if (!data.recipient_name?.trim()) {
      errors.push('Recipient name is required');
    }

    if (!data.address_line_1?.trim()) {
      errors.push('Address line 1 is required');
    }

    if (!data.city?.trim()) {
      errors.push('City is required');
    }

    if (!data.state_province?.trim()) {
      errors.push('State/Province is required');
    }

    if (!data.postal_code?.trim()) {
      errors.push('Postal code is required');
    }

    if (!data.address_type) {
      errors.push('Address type is required');
    }

    // Validate phone number format (Philippine format)
    if (data.phone_number && !/^(\+63|0)?[0-9]{10}$/.test(data.phone_number.replace(/\s|-/g, ''))) {
      errors.push('Please enter a valid Philippine phone number');
    }

    // Validate postal code format (Philippine format)
    if (data.postal_code && !/^[0-9]{4}$/.test(data.postal_code)) {
      errors.push('Please enter a valid 4-digit postal code');
    }

    return errors;
  },

  // Format address for display
  formatAddressDisplay(address: Address): {
    title: string;
    subtitle: string;
    fullAddress: string;
  } {
    const title = address.nickname || `${address.recipient_name}'s Address`;
    
    const addressParts = [
      address.address_line_1,
      address.address_line_2,
      address.city,
      address.state_province,
      address.postal_code,
    ].filter(Boolean);

    const subtitle = `${address.city}, ${address.state_province} ${address.postal_code}`;
    const fullAddress = addressParts.join(', ');

    return {
      title,
      subtitle,
      fullAddress,
    };
  },

  // Get Philippine provinces (for dropdown)
  getPhilippineProvinces(): string[] {
    return [
      'Abra', 'Agusan del Norte', 'Agusan del Sur', 'Aklan', 'Albay', 'Antique',
      'Apayao', 'Aurora', 'Basilan', 'Bataan', 'Batanes', 'Batangas', 'Benguet',
      'Biliran', 'Bohol', 'Bukidnon', 'Bulacan', 'Cagayan', 'Camarines Norte',
      'Camarines Sur', 'Camiguin', 'Capiz', 'Catanduanes', 'Cavite', 'Cebu',
      'Compostela Valley', 'Cotabato', 'Davao del Norte', 'Davao del Sur',
      'Davao Occidental', 'Davao Oriental', 'Dinagat Islands', 'Eastern Samar',
      'Guimaras', 'Ifugao', 'Ilocos Norte', 'Ilocos Sur', 'Iloilo', 'Isabela',
      'Kalinga', 'La Union', 'Laguna', 'Lanao del Norte', 'Lanao del Sur',
      'Leyte', 'Maguindanao', 'Marinduque', 'Masbate', 'Metro Manila',
      'Misamis Occidental', 'Misamis Oriental', 'Mountain Province',
      'Negros Occidental', 'Negros Oriental', 'Northern Samar', 'Nueva Ecija',
      'Nueva Vizcaya', 'Occidental Mindoro', 'Oriental Mindoro', 'Palawan',
      'Pampanga', 'Pangasinan', 'Quezon', 'Quirino', 'Rizal', 'Romblon',
      'Samar', 'Sarangani', 'Siquijor', 'Sorsogon', 'South Cotabato',
      'Southern Leyte', 'Sultan Kudarat', 'Sulu', 'Surigao del Norte',
      'Surigao del Sur', 'Tarlac', 'Tawi-Tawi', 'Zambales', 'Zamboanga del Norte',
      'Zamboanga del Sur', 'Zamboanga Sibugay'
    ].sort();
  },

  // Validate Philippine postal code
  validatePostalCode(postalCode: string): boolean {
    return /^[0-9]{4}$/.test(postalCode);
  },

  // Format Philippine phone number
  formatPhoneNumber(phoneNumber: string): string {
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.startsWith('63')) {
      return `+${cleaned}`;
    } else if (cleaned.startsWith('0')) {
      return `+63${cleaned.substring(1)}`;
    } else if (cleaned.length === 10) {
      return `+63${cleaned}`;
    }
    
    return phoneNumber;
  },
};
