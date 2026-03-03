<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Trigger: update user.last_learning_date when a learning session completes
        DB::unprepared('
            CREATE OR REPLACE FUNCTION fn_update_user_last_learning()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.status = \'completed\' AND (OLD.status IS NULL OR OLD.status <> \'completed\') THEN
                    UPDATE users
                    SET last_learning_date = CURRENT_DATE,
                        total_sessions = total_sessions + 1,
                        updated_at = NOW()
                    WHERE id = NEW.user_id;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_update_user_last_learning
            AFTER INSERT OR UPDATE ON learning_sessions
            FOR EACH ROW
            EXECUTE FUNCTION fn_update_user_last_learning();
        ');

        // Trigger: reset daily coin limits when a new day starts (on wallet access)
        DB::unprepared('
            CREATE OR REPLACE FUNCTION fn_reset_coin_daily_limit()
            RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.daily_cap_reset_date IS NULL OR NEW.daily_cap_reset_date < CURRENT_DATE THEN
                    NEW.daily_earned := 0;
                    NEW.daily_cap_reset_date := CURRENT_DATE;
                END IF;
                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;

            CREATE TRIGGER trg_reset_coin_limits
            BEFORE UPDATE ON user_wallets
            FOR EACH ROW
            EXECUTE FUNCTION fn_reset_coin_daily_limit();
        ');
    }

    public function down(): void
    {
        DB::unprepared('DROP TRIGGER IF EXISTS trg_update_user_last_learning ON learning_sessions;');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_update_user_last_learning();');
        DB::unprepared('DROP TRIGGER IF EXISTS trg_reset_coin_limits ON user_wallets;');
        DB::unprepared('DROP FUNCTION IF EXISTS fn_reset_coin_daily_limit();');
    }
};
