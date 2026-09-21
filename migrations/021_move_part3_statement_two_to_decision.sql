-- Moves a Part 3 second statement into the column that renders it.
--
-- Two fields meant the same thing and rendered differently. The question form
-- offered a "Statement 2" for C1 Part 3 and saved it to statement_two, while
-- every house Part 3 puts the same "now decide..." text in decision. The runner
-- shows decision as an interlocutor note and statement_two behind a "Continue
-- to second part of question" button, so the two were never interchangeable:
-- the same task written by a teacher and by us came out looking different.
--
-- decision is the right column. It is what B2 and C1 house content uses, what
-- the exam runner labels with the blueprint's decisionLabel, and what C2 Part 3
-- uses for its closing discussion. The form now writes it and no longer offers
-- statement_two outside C2 Part 2.
--
-- One row is affected, and it is debris from check-question-routes rather than
-- a teacher's work ("Required probe." / "Then decide which matters most.",
-- owned by reqchk+...@example.com). The statement is written for any row that
-- reached this state, not for that one, because the form allowed this for as
-- long as it has existed and a real row could have it.
--
-- COALESCE rather than a plain assignment: a row that somehow has both keeps
-- its decision, and the move is a no-op rather than a silent overwrite.

BEGIN;

UPDATE content.questions
   SET decision      = COALESCE(NULLIF(decision, ''), statement_two),
       statement_two = NULL
 WHERE part = 3
   AND level <> 'c2'
   AND statement_two IS NOT NULL
   AND statement_two <> '';

COMMIT;
