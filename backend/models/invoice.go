package models

import "time"

type Invoice struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	InvoiceNumber string    `gorm:"uniqueIndex;not null" json:"invoice_number"`
	SenderName    string    `gorm:"not null" json:"sender_name"`
	SenderAddress string    `gorm:"type:text" json:"sender_address"`
	ReceiverName  string    `gorm:"not null" json:"receiver_name"`
	ReceiverAddress string  `gorm:"type:text" json:"receiver_address"`
	TotalAmount   int64     `gorm:"not null" json:"total_amount"` // In cents
	CreatedBy     string    `gorm:"not null" json:"created_by"`
	CreatedAt     time.Time `gorm:"autoCreateTime" json:"created_at"`
	Details       []InvoiceDetail `gorm:"foreignKey:InvoiceID" json:"details"`
}

func (Invoice) TableName() string {
	return "invoices"
}
