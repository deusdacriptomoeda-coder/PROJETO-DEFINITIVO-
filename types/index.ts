export interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  is_featured: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Customer {
  id?: string
  name: string
  email: string
  cpf: string
  phone: string
  cep?: string
  street?: string
  number?: string
  complement?: string
  district?: string
  city?: string
  state?: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id?: string
  customer_id: string
  total_amount: number
  status: "pending" | "approved" | "rejected" | "refunded"
  payment_method: "credit_card" | "pix" | "billet"
  nivuspay_transaction_id?: string
  nivuspay_custom_id?: string
  created_at?: string
  updated_at?: string
}

export interface OrderItem {
  id?: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
}
