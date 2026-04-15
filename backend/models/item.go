package models

type Item struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Code  string `gorm:"uniqueIndex;not null" json:"code"`
	Name  string `gorm:"not null" json:"name"`
	Price int64  `gorm:"not null" json:"price"` // In cents
}

func (Item) TableName() string {
	return "items"
}
