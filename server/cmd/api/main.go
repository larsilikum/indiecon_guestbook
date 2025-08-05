package main

import (
	"img_masters/indie_guestbook/server/internal/database"
	"img_masters/indie_guestbook/server/internal/types"
	"img_masters/indie_guestbook/server/internal/handlers"
	"fmt"
	"github.com/rs/cors"
	"log"
	"net/http"
)

func main() {
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:*", "https://staging.co-o-pub.space", "https://co-o-pub.space"},
		AllowedMethods: []string{"GET", "POST"},
		AllowedHeaders: []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	})

	defer database.CloseDB()
	// prepare DB
	database.InitDB()
	// initialize Tables
	_, err := database.CreatePostTable()
	if err != nil {
		log.Fatalf("Error Creating Post Table, %v", err)
	}
	posts, err := database.GetAllPosts()
	if err != nil {
		fmt.Errorf("Error getting Posts %v", err)
	} else if len(posts) == 0 {
		p := &types.Post{
			Author: "coopub",
			Parent: 0,
			Type: "text",
			Content: "This is the first entry. You are the happy person to start the story. Have fun",
		}
		database.InsertPost(p)
	} 

	mux := http.NewServeMux()

	mux.HandleFunc("/api/test", testHandler)
	mux.HandleFunc("/api/posts", handlers.HandlePosts)
	mux.HandleFunc("/api/post", handlers.HandlePost)
	mux.Handle("/", http.FileServer(http.Dir("../public")))

	handler := c.Handler(mux)
	log.Fatal(http.ListenAndServe("[::]:8101", handler))
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
