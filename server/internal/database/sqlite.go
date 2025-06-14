package database

import (
	"database/sql"
	"fmt"
	_ "github.com/glebarez/go-sqlite"
)

var db sql.DB

func InitDB() {
	db, err := sql.Open("sqlite", "./sqlite-data.db")
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
