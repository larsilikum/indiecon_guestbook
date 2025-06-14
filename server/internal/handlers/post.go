package handlers

import (
	"fmt"
	"img_masters/indie_guestbook/server/internal/database"
	"img_masters/indie_guestbook/server/internal/types"
	"net/http"
)

func HandlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePostPostRequest()
	case "GET":
		handlePostGetRequest()
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}

func handlePostGetRequest() {

}

func handlePostPostRequest() {
	p := new(types.Post)
	p.Author = "test author"
	p.Type = "text"
	p.Content = "Lorem ipsum dolor amet sit"
	p.Blocked = 0

	_, err := database.InsertPost(p)
	if err != nil {
		fmt.Printf("Error inserting Post: %v", err)
	}
	fmt.Printf("added Post from %v", p.Author)
}
