package handlers

import (
	"invoice-generator/config"
	"invoice-generator/models"

	"github.com/gofiber/fiber/v3"
)

func GetItems(c fiber.Ctx) error {
	code := c.Query("code")

	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "code query parameter is required",
		})
	}

	var items []models.Item

	db := config.GetDB()
	result := db.Where("code ILIKE ?", "%"+code+"%").Limit(50).Find(&items)

	if result.Error != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "failed to search items",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":  items,
		"count": len(items),
	})
}
