-- Add latitude and longitude to reports table
ALTER TABLE nullify_reports
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL;
