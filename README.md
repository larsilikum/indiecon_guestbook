# Indiecon Guestbook (working title)

A interactive collaborative guestbook

## Tech Stack

- Go for Webserver
- SQLite _planned as db_

## Development

If you havent already you need to install [Go](https://go.dev/) for your system.

Mac:
```zsh
brew install go
```

### Development Server

Everything in the public directory is served under `localhost:8080/`
Updates in this server will appear after reloading the route.

To start the server run:
```zsh
go run server/cmd/api/main.go
```

