-- Add financial tracking fields to orders table
ALTER TABLE orders
ADD COLUMN total_cost DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN amount_paid DECIMAL(12,2) DEFAULT 0.00,
ADD COLUMN balance_due DECIMAL(12,2) GENERATED ALWAYS AS (total_cost - amount_paid) STORED;

-- Add comment to explain the fields
COMMENT ON COLUMN orders.total_cost IS 'Total cost of the order';
COMMENT ON COLUMN orders.amount_paid IS 'Amount paid by the customer';
COMMENT ON COLUMN orders.balance_due IS 'Outstanding balance (auto-calculated)';
