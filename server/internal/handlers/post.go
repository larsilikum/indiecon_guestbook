package handlers

import (
	"encoding/json"
	"fmt"
	"img_masters/indie_guestbook/server/internal/database"
	"img_masters/indie_guestbook/server/internal/types"
	"math/rand"
	"net/http"
)

func HandlePost(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}
	var posts []types.Post
	var err error
	posts, err = database.GetLeafNodes(false)
	if err != nil {
		fmt.Printf("Error Getting unblocked Leaf Nodes: %v \n", err)
	}
	if len(posts) == 0 {
		fmt.Println("All posts are blocked, getting all Leaf posts")
		posts, err = database.GetLeafNodes(true)
		if err != nil {
			panic(err)
		}
	}
	post := posts[rand.Intn(len(posts))]
	_, e := database.BlockLeafNode(post.Id)
	if e != nil {
		fmt.Printf("Error blocking post: %v", e)
	}
	response := types.JsonResponse[types.Post]{
		Status: http.StatusOK,
		Data:   post,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
