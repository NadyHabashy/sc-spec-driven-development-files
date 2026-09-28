# AgentClinic

## Input from stakeholders

- Mary in engineering wants a reliable site with a popular stack based on TypeScript, giving agents and staff a dashboard for easy access.
- Susan in product has a set of features about agents and their ailments, therapies, and booking appointments.
- Steve in marketing wants an attractive site that works well with a modern browser.

## Getting started

```sh
npm install
npm run db:seed   # creates data/agentclinic.db and fills it with demo data
npm run dev       # http://localhost:3000
```

`npm run db:seed` resets the database to the demo data, removing any bookings made since. Run it between demos. The server only migrates on startup; it never seeds, so a fresh install shows empty pages until you seed.

Other scripts: `npm run validate` (type-check, lint, and tests), `npm run build` then `npm start`, and `npm run db:migrate`. Set `DATABASE_PATH` to use a different database file, and `PORT` to change the port. Times are the server's local time.
