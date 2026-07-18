-- Allow authenticated users to update existing rows in the main tables
CREATE POLICY "Allow authenticated update on customers" ON customers
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update on measurements" ON measurements
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update on orders" ON orders
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated update on payments" ON payments
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
