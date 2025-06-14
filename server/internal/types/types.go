package types

import (
	"time"
)

type Post struct {
	Id       int
	Author   string
	Date     time.Time
	Children []int
	Parent   int
	Type     string
	Content  string
	Blocked  int
}
