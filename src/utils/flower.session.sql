
SELECT column_name, data_type, column_default, is_nullable 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_name = 'users'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default, is_nullable 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_name = 'flowers'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default, is_nullable 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_name = 'categories'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default, is_nullable 
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE table_name = 'order_items'
ORDER BY ordinal_position;