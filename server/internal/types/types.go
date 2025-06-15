package types

import (
// "time"
)

type Post struct {
	Id     uint16 `json:"id"`
	Author string `json:"author"`
	// Date     time.Time		`json:"date"`
	// Parent   uint16			`json:"parent_id"`
	Type    string `json:"type"`
	Content string `json:"content"`
	Blocked uint8  `json:"blocked"`
}

type JsonResponse[t any] struct {
	Status int `json:"status"`
	Data   any `json:"data"`
}
