-- Enable leaked password protection by updating the auth configuration
UPDATE auth.config SET value = 'true' WHERE key = 'leaked_password_protection';