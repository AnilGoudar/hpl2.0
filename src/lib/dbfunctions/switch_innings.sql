CREATE OR REPLACE FUNCTION switch_innings(
    p_fixture_id uuid, 
    p_new_striker_id uuid, 
    p_new_non_striker_id uuid, 
    p_new_bowler_id uuid
)
RETURNS void 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_old_batting_team_id uuid;
    v_old_bowling_team_id uuid;
    v_1st_innings_runs int;
    v_1st_innings_wickets int;
    v_1st_innings_balls int;
BEGIN
    -- 1. Capture 1st Innings Data
    SELECT 
        batting_team_id, 
        bowling_team_id, 
        current_inning_runs, 
        current_inning_wickets, 
        total_balls
    INTO 
        v_old_batting_team_id, 
        v_old_bowling_team_id, 
        v_1st_innings_runs, 
        v_1st_innings_wickets, 
        v_1st_innings_balls
    FROM live_matches 
    WHERE fixture_id = p_fixture_id;

    -- 2. Swap teams and reset for 2nd innings
    UPDATE live_matches
    SET current_inning = 2,
        -- TEAM SWAP LOGIC:
        batting_team_id = v_old_bowling_team_id, -- Was bowling, now batting
        bowling_team_id = v_old_batting_team_id, -- Was batting, now bowling
        
        -- Archive 1st Innings
        first_innings_total = v_1st_innings_runs,
        first_innings_wickets = v_1st_innings_wickets,
        first_innings_balls = v_1st_innings_balls,
        
        -- Reset Current Counters
        current_inning_runs = 0,
        current_inning_wickets = 0,
        total_balls = 0,
        
        -- New Players
        striker_id = p_new_striker_id,
        non_striker_id = p_new_non_striker_id,
        current_bowler_id = p_new_bowler_id,
        updated_at = NOW()
    WHERE fixture_id = p_fixture_id;
END;
$$;