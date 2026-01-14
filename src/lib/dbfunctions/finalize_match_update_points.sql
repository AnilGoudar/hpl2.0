CREATE OR REPLACE FUNCTION finalize_match_and_update_points(
    p_fixture_id UUID,
    p_winner_id UUID, -- NULL if tie
    p_is_tie BOOLEAN DEFAULT false
)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match live_matches%ROWTYPE;
    v_season_id UUID;
    v_t1_balls_for_nrr INT;
    v_t2_balls_for_nrr INT;
BEGIN
    -- 1. Get match data and season_id from fixture
    SELECT * INTO v_match FROM live_matches WHERE fixture_id = p_fixture_id;
    SELECT season_id INTO v_season_id FROM fixtures WHERE id = p_fixture_id;

    -- 2. NRR Logic: If all out, use max_balls_per_innings for calculation
    -- Team 2 (Chasing team)
    IF v_match.current_inning_wickets >= 10 THEN
        v_t2_balls_for_nrr := v_match.max_balls_per_innings;
    ELSE
        v_t2_balls_for_nrr := v_match.total_balls;
    END IF;

    -- Team 1 (Defending team)
    IF v_match.first_innings_wickets >= 10 THEN
        v_t1_balls_for_nrr := v_match.max_balls_per_innings;
    ELSE
        v_t1_balls_for_nrr := v_match.first_innings_balls;
    END IF;

    -- 3. Update Team 1 Stats (First Batting Team)
    UPDATE points_table
    SET 
        matches = matches + 1,
        wins = wins + (CASE WHEN p_winner_id = v_match.bowling_team_id THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN p_winner_id = v_match.batting_team_id THEN 1 ELSE 0 END),
        ties = ties + (CASE WHEN p_is_tie THEN 1 ELSE 0 END),
        points = points + (CASE WHEN p_is_tie THEN 1 WHEN p_winner_id = v_match.bowling_team_id THEN 2 ELSE 0 END),
        runs_scored = runs_scored + v_match.first_innings_total,
        balls_faced = balls_faced + v_t1_balls_for_nrr,
        runs_conceded = runs_conceded + v_match.current_inning_runs,
        balls_bowled = balls_bowled + v_t2_balls_for_nrr
    WHERE team_id = v_match.bowling_team_id AND season_id = v_season_id;

    -- 4. Update Team 2 Stats (Second Batting Team)
    UPDATE points_table
    SET 
        matches = matches + 1,
        wins = wins + (CASE WHEN p_winner_id = v_match.batting_team_id THEN 1 ELSE 0 END),
        losses = losses + (CASE WHEN p_winner_id = v_match.bowling_team_id THEN 1 ELSE 0 END),
        ties = ties + (CASE WHEN p_is_tie THEN 1 ELSE 0 END),
        points = points + (CASE WHEN p_is_tie THEN 1 WHEN p_winner_id = v_match.batting_team_id THEN 2 ELSE 0 END),
        runs_scored = runs_scored + v_match.current_inning_runs,
        balls_faced = balls_faced + v_t2_balls_for_nrr,
        runs_conceded = runs_conceded + v_match.first_innings_total,
        balls_bowled = balls_bowled + v_t1_balls_for_nrr
    WHERE team_id = v_match.batting_team_id AND season_id = v_season_id;

    -- 5. Recalculate NRR for both teams
    -- Formula: (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
    UPDATE points_table
    SET net_run_rate = 
        (runs_scored::numeric / (balls_faced::numeric / 6)) - 
        (runs_conceded::numeric / (balls_bowled::numeric / 6))
    WHERE team_id IN (v_match.batting_team_id, v_match.bowling_team_id) 
    AND season_id = v_season_id;

    -- 6. Clean up: Mark fixture as completed and remove from live
    UPDATE fixtures SET status = 'completed' WHERE id = p_fixture_id;
    DELETE FROM live_matches WHERE fixture_id = p_fixture_id;
END;
$$;