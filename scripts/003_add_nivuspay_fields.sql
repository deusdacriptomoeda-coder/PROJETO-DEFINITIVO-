-- Add Nivuspay transaction ID to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS nivuspay_transaction_id TEXT;

-- Add index for faster webhook lookups
CREATE INDEX IF NOT EXISTS idx_orders_nivuspay_transaction_id ON orders(nivuspay_transaction_id);

-- Add updated_at column for tracking changes
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
