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

Everything in the `/public` directory is served under `localhost:8080/`
Updates in the public directory will appear after reloading the route. If you change something in the `/server` directory you need to recompile the code.

To start the server run:
```zsh
go run server/cmd/api/main.go
```
This compiles the code to a temporary executable and runs it

## API Routes

`/api/test`: returns Hello + route

`/api/post`: 
- GET: returns random leaf node from tree which isn't occupied by another client
  - no params
  - json: 
  ```
  {
    id: int,
    author: string,
    date: unixTimeCode,
    parent_id: int,
    type: string,
    content: string,
    blocked: boolean,
    block_time: unixTimeCode,
  }
  ```

`/api/posts`:
- GET: returns complete tree of posts
  - no params
  - return json same as single post but in an array
- POST: adds single post to db
  - body:
  ```
  {
    author: string,
    parent_id: int,
    type: string,
    content: string,
  }
  ```

### Planned Routes

This is what I thought we need, might be missing something. If you have suggestions please write them in `:)`

`/api/posts/{id}`
- GET: returns post with this id
  - route param id
  - return json TBD

`/api/tags`
- GET: returns all tags
  - no params
  - return json TBD
- POST: adds many tags to the db
  - body: list of TBD

Don't know if we need a route to get or update a single tag?

