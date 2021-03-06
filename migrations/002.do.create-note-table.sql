CREATE TABLE note (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  modified TIMESTAMP DEFAULT now(),
  folder_id 
    INTEGER REFERENCES folder(id) ON DELETE CASCADE NOT NULL
);