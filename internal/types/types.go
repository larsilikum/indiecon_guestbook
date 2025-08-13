package types

import (
// "time"
)

type Post struct {
	Id        uint16 `json:"id"`
	Author    string `json:"author"`
	Date      int64  `json:"date"`
	Parent    uint16 `json:"parent_id"`
	Type      string `json:"type"`
	Content   string `json:"content"`
	Blocked   bool   `json:"blocked"`
	BlockTime int64  `json:"block_time"`
}

type JsonResponse[t any] struct {
	Status int `json:"status"`
	Data   any `json:"data"`
}
