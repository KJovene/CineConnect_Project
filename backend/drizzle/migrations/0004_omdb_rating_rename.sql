DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'films'
      AND column_name = ('i' || 'mdb_rating')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'films'
      AND column_name = 'omdb_rating'
  ) THEN
    EXECUTE 'ALTER TABLE "films" RENAME COLUMN '
      || quote_ident('i' || 'mdb_rating')
      || ' TO '
      || quote_ident('omdb_rating');
  END IF;
END $$;
