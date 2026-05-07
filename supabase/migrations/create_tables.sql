-- 1. Create Custom ENUM Types for Statuses
CREATE TYPE order_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Delivered');
CREATE TYPE payment_method AS ENUM ('Cash', 'Bank Transfer', 'Debit Card');
CREATE TYPE payment_status AS ENUM ('Pending', 'Verified');

-- 2. Create Customers Table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT auth.uid(), -- Or gen_random_uuid() if not linked to auth users
    full_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    address TEXT,
    notes TEXT,
    loyalty_tier VARCHAR(20) DEFAULT 'Bronze',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on customers
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- 3. Create Measurements Table
CREATE TABLE measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    fabric_type VARCHAR(50),
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    length DECIMAL(5,2),
    neck DECIMAL(5,2),
    sleeve DECIMAL(5,2),
    inseam DECIMAL(5,2),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on measurements
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;

-- 4. Create Orders Table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    items JSONB DEFAULT '[]'::jsonb,
    total_amount DECIMAL(12,2) DEFAULT 0.00,
    status order_status DEFAULT 'Pending',
    deadline DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- 5. Create Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'Pending',
    transaction_ref VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS on payments
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- 6. Basic RLS Policies (Allow Authenticated Access)
-- Note: Adjust these based on specific security requirements
CREATE POLICY "Allow authenticated select on customers" ON customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on customers" ON customers FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select on measurements" ON measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on measurements" ON measurements FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select on orders" ON orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on orders" ON orders FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated select on payments" ON payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated insert on payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);
