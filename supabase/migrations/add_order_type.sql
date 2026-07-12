-- Add order type ENUM and column to orders table
CREATE TYPE order_type AS ENUM ('Custom Orders', 'Alteration Orders', 'Bulk Orders');

ALTER TABLE orders
ADD COLUMN order_type order_type DEFAULT 'Custom Orders';

COMMENT ON COLUMN orders.order_type IS 'Type of order: Custom Orders, Alteration Orders, or Bulk Orders';
