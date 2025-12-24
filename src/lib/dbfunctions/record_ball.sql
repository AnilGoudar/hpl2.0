CREATE OR REPLACE FUNCTION record_ball(
    p_fixture_id uuid,
    p_runs_scored int,        -- Runs off the bat
    p_extra_type text,        -- 'wide', 'no_ball', 'bye', 'leg_bye', or NULL
    p_extra_runs int,         -- Extra runs (usually 1 for wide/no-ball)
    p_is_wicket boolean,
    p_wicket_type text,
    p_wicket_player_out_id uuid,
    p_new_batsman_id uuid     -- NULL unless wicket
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_match live_matches%ROWTYPE;

    v_is_legal boolean;
    v_total_run_event int;

    v_completed_balls int;
    v_new_total_balls int;

    v_over_number int;
    v_ball_number int;
BEGIN
    -- 1️⃣ Lock live match row
    SELECT *
    INTO v_match
    FROM live_matches
    WHERE fixture_id = p_fixture_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Live match not found for fixture %', p_fixture_id;
    END IF;

    -- 2️⃣ Ball legality
    v_is_legal := (
        p_extra_type IS NULL
        OR p_extra_type IN ('bye', 'leg_bye')
    );

    -- 3️⃣ Runs for this event
    v_total_run_event := p_runs_scored + COALESCE(p_extra_runs, 0);

    -- 4️⃣ Ball & over calculation (based on COMPLETED legal balls)
    v_completed_balls := COALESCE(v_match.total_balls, 0);

    v_over_number := FLOOR(v_completed_balls / 6) + 1; -- 1-based
    v_ball_number := (v_completed_balls % 6) + 1;      -- 1–6

    IF v_is_legal THEN
        v_new_total_balls := v_completed_balls + 1;
    ELSE
        v_new_total_balls := v_completed_balls;
    END IF;

    -- 5️⃣ Insert ball log
    INSERT INTO ball_log (
        fixture_id,
        innings,
        over_number,
        ball_number,
        batsman_id,
        bowler_id,
        runs_scored,
        extra_type,
        extra_runs,
        is_wicket,
        wicket_type,
        wicket_batsman_id,
        commentary
    ) VALUES (
        p_fixture_id,
        COALESCE(v_match.current_inning, 1),
        v_over_number,
        v_ball_number,
        v_match.striker_id,
        v_match.current_bowler_id,
        p_runs_scored,
        p_extra_type,
        p_extra_runs,
        p_is_wicket,
        p_wicket_type,
        p_wicket_player_out_id,
        CONCAT(
            v_over_number, '.', v_ball_number, ' ',
            CASE
                WHEN p_is_wicket THEN 'WICKET'
                WHEN p_extra_type IS NOT NULL THEN
                    CONCAT(v_total_run_event, ' run(s) ', p_extra_type)
                ELSE
                    CONCAT(v_total_run_event, ' run(s)')
            END
        )
    );

    -- 6️⃣ Update live match score
    UPDATE live_matches
    SET
        current_inning_runs = current_inning_runs + v_total_run_event,
        current_inning_wickets = CASE
            WHEN p_is_wicket THEN current_inning_wickets + 1
            ELSE current_inning_wickets
        END,
        total_balls = v_new_total_balls,
        updated_at = NOW()
    WHERE fixture_id = p_fixture_id;

    -- 7️⃣ STRIKER ROTATION (odd runs)
    IF v_total_run_event % 2 = 1 THEN
        UPDATE live_matches
        SET striker_id = non_striker_id,
            non_striker_id = striker_id
        WHERE fixture_id = p_fixture_id;
    END IF;

    -- 8️⃣ WICKET handling
    IF p_is_wicket THEN
        IF p_new_batsman_id IS NULL THEN
            RAISE EXCEPTION 'New batsman must be provided for wicket';
        END IF;

        UPDATE live_matches
        SET striker_id = p_new_batsman_id
        WHERE fixture_id = p_fixture_id;
    END IF;

    -- 9️⃣ End of over logic (ONLY legal balls)
    IF v_is_legal AND (v_new_total_balls % 6 = 0) THEN
        UPDATE live_matches
        SET
            striker_id = non_striker_id,
            non_striker_id = striker_id,
            current_bowler_id = NULL -- force new bowler selection
        WHERE fixture_id = p_fixture_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'over', v_over_number,
        'ball', v_ball_number,
        'runs', v_total_run_event,
        'legal', v_is_legal
    );
END;
$$;
