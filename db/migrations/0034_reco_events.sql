-- Recommendation measurement (docs/REJA-JALB-QILISH.md §5, stage D1).
--
-- Two more journey event types: a product rail came into view (rec_impression, the
-- rail id and the slugs it showed in `meta`) and a card inside it was clicked
-- (rec_click, slug + position). They give the current algorithm a baseline before
-- v2 is compared against it.
--
-- Expand only: the allowed set grows, nothing old becomes invalid. `not valid`
-- skips re-checking existing rows, which the previous, narrower constraint already
-- guaranteed; new rows are checked as usual.

alter table visitor_events drop constraint if exists visitor_events_type_check;

alter table visitor_events add constraint visitor_events_type_check check (type in (
  'page_view', 'view_item', 'add_to_cart', 'remove_from_cart',
  'view_cart', 'begin_checkout', 'purchase', 'search',
  'add_to_wishlist', 'quiz_complete',
  'rec_impression', 'rec_click'
)) not valid;
