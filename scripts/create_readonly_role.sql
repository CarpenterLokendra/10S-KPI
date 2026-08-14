-- Create read-only analytics role for the dashboard service
-- Run this against the production RDS database with admin credentials

-- Create the role (only if it doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'analytics_readonly') THEN
        CREATE ROLE analytics_readonly WITH LOGIN PASSWORD 'generate-strong-password-here';
        GRANT USAGE ON SCHEMA "10s_schema" TO analytics_readonly;
        GRANT SELECT ON
            10s_schema.users,
            10s_schema.games,
            10s_schema.game_players,
            10s_schema.lobbies,
            10s_schema.premium_subscriptions,
            10s_schema.ad_serving
        TO analytics_readonly;

        -- Make grants default for future tables in schema
        ALTER DEFAULT PRIVILEGES IN SCHEMA "10s_schema" GRANT SELECT ON TABLES TO analytics_readonly;

        RAISE NOTICE 'Role analytics_readonly created successfully';
    ELSE
        RAISE NOTICE 'Role analytics_readonly already exists, updating permissions...';
        GRANT USAGE ON SCHEMA "10s_schema" TO analytics_readonly;
        GRANT SELECT ON
            10s_schema.users,
            10s_schema.games,
            10s_schema.game_players,
            10s_schema.lobbies,
            10s_schema.premium_subscriptions,
            10s_schema.ad_serving
        TO analytics_readonly;
    END IF;
END $$;

-- Verify the role and permissions
SELECT rolname FROM pg_roles WHERE rolname = 'analytics_readonly';

-- Show granted permissions
SELECT table_schema, table_name, privilege
FROM information_schema.role_table_grants
WHERE grantee = 'analytics_readonly'
ORDER BY table_name;
