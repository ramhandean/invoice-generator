package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/joho/godotenv"

	"invoice-generator/config"
	"invoice-generator/handlers"
	"invoice-generator/middleware"
	"invoice-generator/models"
	"invoice-generator/seeder"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Warning: .env file not found, using environment variables")
	}

	if err := config.InitDB(); err != nil {
		log.Fatalf("Database initialization failed: %v", err)
	}

	db := config.GetDB()

	if err := db.AutoMigrate(
		&models.Item{},
		&models.Invoice{},
		&models.InvoiceDetail{},
	); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	fmt.Println("Database migration completed successfully")

	if err := seeder.Seed(db); err != nil {
		log.Printf("Seeder failed: %v", err)
	}

	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	app.Post("/api/login", handlers.PostLogin)
	app.Get("/api/items", handlers.GetItems)

	api := app.Group("/api")
	api.Use(middleware.JWTMiddleware())
	api.Post("/invoices", handlers.PostInvoices)
	api.Get("/invoices", handlers.GetInvoices)
	api.Get("/stats", handlers.GetStats)

	port := os.Getenv("SERVER_PORT")
	if port == "" {
		port = "8080"
	}

	fmt.Printf("Starting server on port %s\n", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
