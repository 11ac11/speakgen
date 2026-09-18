-- Removes the single C2 question, which nothing can reach.
--
-- content.levels has c2 with enabled = false, so /c2/... does not resolve and
-- the question has never been visible. It is in no exam, and there are no C2
-- exams. It is also not a Part 2 task: "How often do you go to places like
-- this in your country?" is a follow-up question, and "places like this"
-- refers to photographs that were lost in the legacy import. There is nothing
-- here worth keeping.
--
-- Deliberately narrow. content.levels.c2 and its three content.level_parts
-- rows stay: that is the feature flag and the foreign key target for level and
-- part scoping, so switching C2 on later should be flipping a boolean rather
-- than writing another migration.
--
-- question_themes cascades on delete, so its one tag goes with it.

BEGIN;

DELETE FROM content.questions
 WHERE level = 'c2'
   AND owner_id IS NULL;

COMMIT;
