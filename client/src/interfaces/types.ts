// Common interfaces for the restaurant management system

export interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: Category | string;
  imageUrl?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  order: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  subtotal: number;
  menuItem?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  notes?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  createdAt: string;
  user?: import("../context/AuthContext").User;
  orderStatus: string;
  totalAmount: number;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  paymentMethod: string;
  paymentStatus: string;
  tableNumber?: number;
  orderType: string;
  orderNotes?: string;
}

export interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface ItemForm {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isSpicy: boolean;
  preparationTime: number;
}

export interface CategoryForm {
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  order: number;
}

export interface CheckoutFormData {
  orderType: string;
  tableNumber: string;
  street: string;
  city: string;
  postalCode: string;
  phone: string;
  notes: string;
  orderNotes: string;
  paymentMethod: string;
}
