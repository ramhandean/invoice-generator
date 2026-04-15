package models

type InvoiceDetail struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	InvoiceID uint   `gorm:"not null;index" json:"invoice_id"`
	ItemID    uint   `gorm:"not null" json:"item_id"`
	Quantity  int    `gorm:"not null" json:"quantity"`
	Price     int64  `gorm:"not null" json:"price"` // In cents - original price from items table
	Subtotal  int64  `gorm:"not null" json:"subtotal"` // In cents - quantity * price
	Invoice   *Invoice `gorm:"foreignKey:InvoiceID" json:"invoice,omitempty"`
	Item      *Item    `gorm:"foreignKey:ItemID" json:"item,omitempty"`
}

func (InvoiceDetail) TableName() string {
	return "invoice_details"
}
