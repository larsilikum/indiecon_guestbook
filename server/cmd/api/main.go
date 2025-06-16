package main

import (
	"img_masters/indie_guestbook/server/internal/database"
	"img_masters/indie_guestbook/server/internal/handlers"
	"log"
	"net/http"
)

func main() {
	defer database.CloseDB()
	// prepare DB
	database.InitDB()
	// initialize Tables
	_, err := database.CreatePostTable()
	if err != nil {
		log.Fatalf("Error Creating Post Table, %v", err)
	}

	http.HandleFunc("/api/test", testHandler)
	http.HandleFunc("/api/posts", handlers.HandlePosts)
	http.HandleFunc("/api/post", handlers.HandlePost)
	http.Handle("/", http.FileServer(http.Dir("../public")))
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func testHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "GET":
		handleTest(w, r)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
}

func handleTest(w http.ResponseWriter, r *http.Request) {
	w.Write([]byte("Hello " + r.URL.Path))
}
