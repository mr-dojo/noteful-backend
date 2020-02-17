## Noteful Express Server

This is a project for education purposes created by Thinkful.

This is an express server API meant for developing `noteful-client` projects.

Once started, this will run a local API server on `http://localhost:8000`.

If you navigate to the base URL there will be a HTML documentation page displayed.

There are two top level endpoints:

- /folders
- /notes

Both support GET, POST, PUT, PATCH and DELETE requests. For PUT, PATCH and DELETE requests you must supply the respective id in the endpoint's path.

For example:

- GET /notes
- GET /folders
- POST /notes
- POST /folders
- PATCH /notes/{note-id}/
- PATCH /folders/{folder-id}/
- DELETE /notes/{note-id}/
- DELETE /folders/{folder-id}/

To start the server, run `npm start`.

# scripts

seeding databases

1 `psql -U dunder_mifflin -d noteful -f ./seeds/seed.folder.sql`
2 `psql -U dunder_mifflin -d noteful -f ./seeds/seed.note.sql`
3 `psql -U dunder_mifflin -d noteful-test -f ./seeds/seed.folder.sql`
4 `psql -U dunder_mifflin -d noteful-test -f ./seeds/seed.note.sql`
