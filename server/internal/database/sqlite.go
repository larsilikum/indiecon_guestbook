package database

import (
	"database/sql"
	"fmt"
	"img_masters/indie_guestbook/server/internal/types"
	"time"

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
	sql_test_command := `CREATE TABLE IF NOT EXISTS posts (
		id 					INTEGER PRIMARY KEY,
		author 			TEXT NOT NULL,
		date				INTEGER NOT NULL,
		parent_id 	INTEGER NOT NULL,
		type				TEXT NOT NULL,
		content			TEXT NOT NULL,
		blocked			INTEGER,
		block_time	INTEGER
	);`

	return db.Exec(sql_test_command)
}

func InsertPost(p *types.Post) (sql.Result, error) {
	sql_command := `INSERT INTO posts (author, date, parent_id, type, content, blocked, block_time)
	VALUES(?,?,?,?,?,?,?);
	`
	date := time.Now().UnixMilli()
	blocked := 0
	return db.Exec(sql_command, p.Author, date, p.Parent, p.Type, p.Content, blocked, 0)
}

func GetAllPosts() ([]types.Post, error) {
	sql_command := `SELECT * FROM posts`

	rows, err := db.Query(sql_command)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []types.Post
	for rows.Next() {
		p := &types.Post{}
		err := rows.Scan(&p.Id, &p.Author, &p.Date, &p.Parent, &p.Type, &p.Content, &p.Blocked, &p.BlockTime)
		if err != nil {
			return nil, err
		}
		posts = append(posts, *p)
	}
	return posts, nil
}

func BlockLeafNode(id int) (sql.Result, error) {
	sql_command := `UPDATE posts
	SET blocked = 1 block_time = ?
	WHERE id = ?`
	return db.Exec(sql_command, time.Now().UnixMilli(), id)
}

func UnblockLeafNode(id int) (sql.Result, error) {
	sql_command := `UPDATE posts
	SET blocked = 0 block_time = ?
	WHERE id = ?`
	return db.Exec(sql_command, nil, id)
}
