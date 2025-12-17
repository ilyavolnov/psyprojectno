-- Migration to add sort_order column to courses table
-- This will allow for custom ordering of courses and webinars

-- Add sort_order column to courses table
ALTER TABLE courses ADD COLUMN sort_order INTEGER DEFAULT 999;

-- Update sort_order to use existing id values as default for existing records
UPDATE courses SET sort_order = id WHERE sort_order = 999;