export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price_cents: number;
  promotional_price_cents?: number | null;
  stock_quantity?: number | null;
  image_url: string | null;
  category_id: string;
  active?: boolean;
  product_type?: 'standard' | 'pizza' | 'variable';
  pizza_category_id?: string | null;
  fractional_pricing_strategy?: string | null;
  sizes?: { id: string; name: string; price: number; max_flavors: number }[];
}

export interface Category {
  id: string;
  name: string;
  parent_id?: string | null;
}

export type OrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'out_for_delivery'
  | 'delivered'
  | 'finished'
  | 'canceled'
  | 'cancelled';

export interface CourierInfo {
  id: string;
  name: string;
  phone: string;
  vehicle_type: string;
  license_plate?: string | null;
}

export interface AddonOption {
  name: string;
  price_cents: number;
}

export interface ProductOptions {
  size?: string;
  addons?: AddonOption[];
  flavors?: string[]; // Added for pizza support
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  notes?: string;
  options?: ProductOptions;
}

export interface Order {
  id: string;
  customer_id?: string;
  type: string;
  table_id?: string;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  delivery_fee?: number;
  discount?: number;
  notes?: string;
  created_at: string;
  updated_at?: string;
  order_items: OrderItem[];
  items?: OrderItem[];
  customer_name?: string;
  customer_cpf?: string;
  courier_id?: string | null;
  courier?: CourierInfo | null;
  order_source?: string;
  payment_confirmed_by_courier?: boolean;
  payment_confirmed_at?: string | null;
  delivery_address?: string | null;
  delivery_number?: string | null;
  delivery_complement?: string | null;
  delivery_neighborhood?: string | null;
  delivery_city?: string | null;
  delivery_state?: string | null;
  delivery_zipcode?: string | null;
  table?: Table;
}

export interface Table {
  id: string;
  number: string;
  status: 'available' | 'occupied' | 'closing';
  restaurant_id: string;
  qr_code_url?: string | null;
  created_at?: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unit_price: number;
  total_price: number;
  options?: ProductOptions | null;
  notes?: string;
}
