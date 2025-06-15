package handlers

import (
	"encoding/json"
	"fmt"
	"img_masters/indie_guestbook/server/internal/database"
	"img_masters/indie_guestbook/server/internal/types"
	"net/http"
)

func HandlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePostsPostRequest()
	case "GET":
		handlePostsGetRequest(w)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}

func handlePostsGetRequest(w http.ResponseWriter) {
	posts, err := database.GetAllPosts()
	if err != nil {
		fmt.Printf("Error reading Posts: %v", err)
		return
	}
	response := types.JsonResponse[[]types.Post]{
		Status: http.StatusOK,
		Data:   posts,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handlePostsPostRequest() {
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
