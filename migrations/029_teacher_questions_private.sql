-- Teacher questions are private. Public means house content, and only that.
--
-- "Public question" was a checkbox on the question form, ticked by default, and
-- a public question was readable by everyone: logged-out visitors on the
-- random-question pages, every teacher's exam builder, every practice's draw,
-- and practices shared with students. Nothing reviewed it and nothing marked
-- it apart from the curated house questions it was mixed in with.
--
-- In practice it published nothing anyone chose to publish. When this was
-- written, one real teacher question was public; the other 168 were left
-- behind by a test suite whose clean-up called a route that no longer exists,
-- and they outnumbered the house questions seven to one in B2 Parts 2 and 3.
-- A visitor asking for a random B2 long turn was mostly shown "Route test:
-- compare these two photographs."
--
-- So the checkbox goes, and the rule becomes one the database holds: a
-- question is public exactly when it has no owner. Teachers share through
-- exams, practices and share links, which grant access to the questions inside
-- them, and schools pool through organization_id — none of which ever needed a
-- question to be public.
--
-- The visibility column stays rather than being dropped. Every read path goes
-- through questionReadPredicate, which tests it, and it keeps working unchanged
-- with the new meaning. If reviewed community questions are ever wanted, they
-- arrive as a status alongside it, not by relaxing this constraint.

BEGIN;

UPDATE content.questions
   SET visibility = 'private'
 WHERE owner_id IS NOT NULL
   AND visibility = 'public';

-- The old rule said house content must be public. The new one says that and
-- its converse: public if and only if house.
ALTER TABLE content.questions
  DROP CONSTRAINT questions_house_is_public;

ALTER TABLE content.questions
  ADD CONSTRAINT questions_public_is_house
  CHECK ((visibility = 'public') = (owner_id IS NULL));

COMMIT;
