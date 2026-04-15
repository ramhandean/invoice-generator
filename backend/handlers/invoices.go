package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"invoice-generator/config"
	"invoice-generator/models"
	"net/http"
	"os"

	"time"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type InvoiceDetailPayload struct {
	ItemID   uint `json:"item_id"`
	Quantity int  `json:"quantity"`
}

type CreateInvoiceRequest struct {
	InvoiceNumber   string                 `json:"invoice_number"`
	SenderName      string                 `json:"sender_name"`
	SenderAddress   string                 `json:"sender_address"`
	ReceiverName    string                 `json:"receiver_name"`
	ReceiverAddress string                 `json:"receiver_address"`
	Details         []InvoiceDetailPayload `json:"details"`
}

type CreateInvoiceResponse struct {
	ID            uint                   `json:"id"`
	InvoiceNumber string                 `json:"invoice_number"`
	TotalAmount   int64                  `json:"total_amount"`
	Details       []models.InvoiceDetail `json:"details"`
}

func PostInvoices(c fiber.Ctx) error {
	var req CreateInvoiceRequest

	if err := c.Bind().Body(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invalid request body",
		})
	}

	if req.InvoiceNumber == "" || req.SenderName == "" || req.ReceiverName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "invoice_number, sender_name, and receiver_name are required",
		})
	}

	if len(req.Details) == 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "at least one invoice detail is required",
		})
	}

	userID := c.Locals("user_id").(uint)
	createdBy := ""
	role := c.Locals("role").(string)

	if userID > 0 {
		createdBy = fmt.Sprintf("%s_%d", role, userID)
	}

	db := config.GetDB()
	var invoice *models.Invoice
	var invoiceDetails []models.InvoiceDetail
	var totalAmount int64 = 0

	err := db.Transaction(func(tx *gorm.DB) error {
		for _, detailPayload := range req.Details {
			// ZERO-TRUST: Query the items table to get real price
			var item models.Item
			if result := tx.Where("id = ?", detailPayload.ItemID).First(&item); result.Error != nil {
				return fmt.Errorf("item with id %d not found", detailPayload.ItemID)
			}

			if detailPayload.Quantity <= 0 {
				return fmt.Errorf("quantity must be greater than 0")
			}

			subtotal := int64(detailPayload.Quantity) * item.Price
			totalAmount += subtotal

			invoiceDetails = append(invoiceDetails, models.InvoiceDetail{
				ItemID:   detailPayload.ItemID,
				Quantity: detailPayload.Quantity,
				Price:    item.Price,
				Subtotal: subtotal,
			})
		}

		invoice = &models.Invoice{
			InvoiceNumber:   req.InvoiceNumber,
			SenderName:      req.SenderName,
			SenderAddress:   req.SenderAddress,
			ReceiverName:    req.ReceiverName,
			ReceiverAddress: req.ReceiverAddress,
			TotalAmount:     totalAmount,
			CreatedBy:       createdBy,
		}

		if result := tx.Create(invoice); result.Error != nil {
			return fmt.Errorf("failed to create invoice: %v", result.Error)
		}

		for i := range invoiceDetails {
			invoiceDetails[i].InvoiceID = invoice.ID
		}

		if result := tx.Create(&invoiceDetails); result.Error != nil {
			return fmt.Errorf("failed to create invoice details: %v", result.Error)
		}

		return nil
	})

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	// BONUS: Send async webhook notification
	go sendWebhookNotification(invoice)

	return c.Status(fiber.StatusCreated).JSON(CreateInvoiceResponse{
		ID:            invoice.ID,
		InvoiceNumber: invoice.InvoiceNumber,
		TotalAmount:   invoice.TotalAmount,
		Details:       invoiceDetails,
	})
}

func sendWebhookNotification(invoice *models.Invoice) {
	webhookURL := os.Getenv("WEBHOOK_URL")
	if webhookURL == "" {
		webhookURL = "http://localhost:9000/webhook"
	}

	payload := fiber.Map{
		"event":          "invoice_created",
		"invoice_id":     invoice.ID,
		"invoice_number": invoice.InvoiceNumber,
		"total_amount":   invoice.TotalAmount,
		"created_by":     invoice.CreatedBy,
		"created_at":     invoice.CreatedAt,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		fmt.Printf("Failed to marshal webhook payload: %v\n", err)
		return
	}

	resp, err := http.Post(webhookURL, "application/json", bytes.NewReader(jsonPayload))
	if err != nil {
		fmt.Printf("Failed to send webhook: %v\n", err)
		return
	}
	defer resp.Body.Close()

	fmt.Printf("Webhook sent successfully. Status: %d\n", resp.StatusCode)
}

func GetInvoices(c fiber.Ctx) error {
	var invoices []models.Invoice
	db := config.GetDB()

	// Preload Details to get full invoice info
	if err := db.Preload("Details").Order("created_at desc").Find(&invoices).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to fetch invoices",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data": invoices,
	})
}

func GetStats(c fiber.Ctx) error {
	db := config.GetDB()
	var totalInvoices int64
	var todayRevenue int64
	var itemsInStock int64

	db.Model(&models.Invoice{}).Count(&totalInvoices)
	db.Model(&models.Item{}).Count(&itemsInStock)

	// Revenue for today
	now := time.Now()
	today := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	db.Model(&models.Invoice{}).Where("created_at >= ?", today).Select("SUM(total_amount)").Row().Scan(&todayRevenue)

	// Recent invoices
	var recentInvoices []models.Invoice
	db.Limit(5).Order("created_at desc").Find(&recentInvoices)

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"total_invoices":    totalInvoices,
		"today_revenue":     todayRevenue,
		"pending_approvals": 0, // Mocked as 0
		"items_in_stock":    itemsInStock,
		"recent_invoices":   recentInvoices,
	})
}
