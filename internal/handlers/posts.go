package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"math/rand"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
	"img_masters/indie_guestbook/internal/database"
	"img_masters/indie_guestbook/internal/types"
)

func HandlePosts(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case "POST":
		handlePostsPostRequest(w, r)
	case "GET":
		handlePostsGetRequest(w)
	default:
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
	}

}

func handlePostsGetRequest(w http.ResponseWriter) {
	posts, err := database.GetAllPosts()
	if err != nil {
		fmt.Printf("Error reading Posts: %v \n", err)
		return
	}
	response := types.JsonResponse[[]types.Post]{
		Status: http.StatusOK,
		Data:   posts,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handlePostsPostRequest(w http.ResponseWriter, r *http.Request) {
	// Check content type to determine how to parse the request
	contentType := r.Header.Get("Content-Type")
	
	var post *types.Post
	var err error
	
	if strings.HasPrefix(contentType, "multipart/form-data") {
		// Handle multipart form data (for file uploads)
		post, err = parseMultipartPost(r)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error parsing multipart form: %v", err), http.StatusBadRequest)
			return
		}
	} else {
		// Handle JSON data (existing text posts)
		decoder := json.NewDecoder(r.Body)
		err = decoder.Decode(&post)
		if err != nil {
			http.Error(w, fmt.Sprintf("Error decoding json: %v", err), http.StatusBadRequest)
			return
		}
	}
	
	fmt.Printf("Successfully parsed post from %v with type %s\n", post.Author, post.Type)
	
	// TODO: Sanitize and validate fields!!!!!
	_, err = database.InsertPost(post)
	if err != nil {
		fmt.Printf("Error inserting Post: %v\n", err)
		http.Error(w, "Error saving post", http.StatusInternalServerError)
		return
	}
	
	fmt.Printf("Added Post from %v\n", post.Author)
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func parseMultipartPost(r *http.Request) (*types.Post, error) {
	// Parse multipart form with max memory of 10MB
	err := r.ParseMultipartForm(10 << 20) // 10 MB
	if err != nil {
		return nil, err
	}
	
	post := &types.Post{
		Author: r.FormValue("author"),
		Type:   r.FormValue("type"),
	}
	
	// Parse parent_id if provided
	if parentStr := r.FormValue("parent_id"); parentStr != "" {
		if parentID, err := strconv.ParseUint(parentStr, 10, 16); err == nil {
			parent := uint16(parentID)
			post.Parent = parent
		}
	}
	
	switch post.Type {
	case "text":
		post.Content = r.FormValue("content")
		
	case "image":
		fileURL, err := handleImageUpload(r, "image")
		if err != nil {
			return nil, fmt.Errorf("failed to upload image: %v", err)
		}
		post.Content = fileURL
		
	case "sound":
		fileURL, err := handleSoundUpload(r, "sound")
		if err != nil {
			return nil, fmt.Errorf("failed to upload sound: %v", err)
		}
		post.Content = fileURL
		
	default:
		return nil, fmt.Errorf("unsupported post type: %s", post.Type)
	}
	
	return post, nil
}

func handleImageUpload(r *http.Request, fieldName string) (string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		return "", err
	}
	defer file.Close()
	
	// Validate file type
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	
	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		return "", fmt.Errorf("unsupported image type: %s", contentType)
	}
	
	// Validate file size (max 5MB for images)
	maxSize := int64(5 << 20) // 5 MB
	if header.Size > maxSize {
		return "", fmt.Errorf("file too large: %d bytes (max %d)", header.Size, maxSize)
	}
	
	return saveUploadedFile(file, header, "images")
}

func handleSoundUpload(r *http.Request, fieldName string) (string, error) {
	file, header, err := r.FormFile(fieldName)
	if err != nil {
		return "", err
	}
	defer file.Close()
	
	// Validate file type
	allowedTypes := map[string]bool{
		"audio/mpeg":    true, // MP3
		"audio/wav":     true, // WAV
		"audio/ogg":     true, // OGG
		"audio/mp4":     true, // M4A
		"audio/webm":    true, // WebM
	}
	
	contentType := header.Header.Get("Content-Type")
	if !allowedTypes[contentType] {
		return "", fmt.Errorf("unsupported audio type: %s", contentType)
	}
	
	// Validate file size (max 10MB for audio)
	maxSize := int64(10 << 20) // 10 MB
	if header.Size > maxSize {
		return "", fmt.Errorf("file too large: %d bytes (max %d)", header.Size, maxSize)
	}
	
	return saveUploadedFile(file, header, "sounds")
}

func saveUploadedFile(file multipart.File, header *multipart.FileHeader, subdir string) (string, error) {
	// Generate unique filename
	ext := filepath.Ext(header.Filename)
	filename := fmt.Sprintf("%d_%s%s", time.Now().UnixNano(), generateRandomString(8), ext)
	
	// Create directory if it doesn't exist
	uploadDir := filepath.Join("public", subdir)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %v", err)
	}
	
	// Create the destination file
	filepath := filepath.Join(uploadDir, filename)
	dst, err := os.Create(filepath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %v", err)
	}
	defer dst.Close()
	
	// Copy file contents
	_, err = io.Copy(dst, file)
	if err != nil {
		return "", fmt.Errorf("failed to save file: %v", err)
	}
	
	// Return the URL path (relative to public directory)
	return fmt.Sprintf("/%s/%s", subdir, filename), nil
}

func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[rand.Intn(len(charset))]
	}
	return string(b)
}
