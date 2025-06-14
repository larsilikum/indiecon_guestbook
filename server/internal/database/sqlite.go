package database

import (
	"database/sql"
	"fmt"
	"img_masters/indie_guestbook/server/internal/types"

	_ "github.com/glebarez/go-sqlite"
)

var db *sql.DB

func InitDB() {
	var err error
	db, err = sql.Open("sqlite", "./sqlite-data.db")
	if err != nil {
		fmt.Printf("Failed to open db connection: %v", err)
		return
	}
	fmt.Println("successfully opend db connection")
	// Get the version of SQLite
	var sqliteVersion string
	err = db.QueryRow("select sqlite_version()").Scan(&sqliteVersion)
	if err != nil {
		fmt.Println(err)
		return
	}

	fmt.Println(sqliteVersion)
}

func CloseDB() {
	fmt.Println("closing db connection")
	db.Close()
}

func CreatePostTable() (sql.Result, error) {
	// sql_command := `CREATE TABLE IF NOT EXISTS posts (
	// 	id 				INTEGER PRIMARY KEY,
	// 	author 		TEXT NOT NULL,
	// 	date			INTEGER NOT NULL,
	// 	children	TEXT,
	// 	parent		INTEGER NOT NULL,
	// 	type			TEXT NOT NULL,
	// 	content		TEXT NOT NULL,
	// 	blocked		INTEGER
	// );`

	sql_test_command := `CREATE TABLE IF NOT EXISTS posts (
		id 				INTEGER PRIMARY KEY,
		author 		TEXT NOT NULL,
		type			TEXT NOT NULL,
		content		TEXT NOT NULL,
		blocked		INTEGER
	);`

	return db.Exec(sql_test_command)
}

func InsertPost(p *types.Post) (sql.Result, error) {
	sql_command := `INSERT INTO posts (author, type, content, blocked)
	VALUES(?,?,?,?);
	`
	return db.Exec(sql_command, p.Author, p.Type, p.Content, p.Blocked)
}
