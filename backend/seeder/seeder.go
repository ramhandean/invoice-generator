package seeder

import (
	"fmt"
	"invoice-generator/models"

	"gorm.io/gorm"
)

func Seed(db *gorm.DB) error {
	var count int64
	if err := db.Model(&models.Item{}).Count(&count).Error; err != nil {
		return fmt.Errorf("failed to check items table: %w", err)
	}

	if count > 0 {
		fmt.Println("Items table already has data, skipping seed")
		return nil
	}

	items := []models.Item{
		{Code: "A101", Name: "Apple iPhone 15 Pro", Price: 20000000},
		{Code: "B202", Name: "Baseus Gan5 Charger 65W", Price: 450000},
		{Code: "C303", Name: "Canon EOS R6 Mirrorless", Price: 35000000},
		{Code: "D404", Name: "Dell XPS 13 Ultrabook", Price: 18500000},
		{Code: "E505", Name: "Epson EcoTank L3210", Price: 2300000},
		{Code: "F606", Name: "Fossil Gen 6 Smartwatch", Price: 3800000},
		{Code: "G707", Name: "Gigabyte RTX 4060 Ti", Price: 7200000},
		{Code: "H888", Name: "HyperX Cloud II Gaming Headset", Price: 1100000},
		{Code: "I909", Name: "IKEA Markus Office Chair", Price: 2900000},
		{Code: "J010", Name: "JBL Flip 6 Waterproof Speaker", Price: 1600000},
		{Code: "K111", Name: "Kindle Paperwhite 5", Price: 2100000},
		{Code: "L212", Name: "Logitech MX Keys S", Price: 1550000},
		{Code: "M313", Name: "Monitor LG UltraFine 4K", Price: 6500000},
		{Code: "N414", Name: "Nintendo Switch OLED", Price: 4200000},
		{Code: "O515", Name: "Oculus Quest 3 VR", Price: 8500000},
		{Code: "P616", Name: "Panasonic Air Purifier", Price: 3200000},
		{Code: "Q717", Name: "QLED TV Samsung 55 Inch", Price: 12000000},
		{Code: "R818", Name: "Razer DeathAdder V3", Price: 1100000},
		{Code: "S919", Name: "Sony PlayStation 5 Slim", Price: 8800000},
		{Code: "T020", Name: "Tefal Air Fryer XL", Price: 1950000},
		{Code: "U121", Name: "Ugreen USB-C Hub 7-in-1", Price: 450000},
		{Code: "V222", Name: "Vans Old Skool Black White", Price: 900000},
		{Code: "W323", Name: "Western Digital Blue 2TB SSD", Price: 1800000},
		{Code: "X424", Name: "Xiaomi Pad 6 Pro", Price: 5100000},
		{Code: "Y525", Name: "Yamaha Soundbar SR-B20A", Price: 2700000},
		{Code: "Z626", Name: "ZOTAC Magnus Mini PC", Price: 15000000},
		{Code: "0999", Name: "Zero Latency VR Voucher", Price: 250000},
		{Code: "1234", Name: "One Plus 11 5G", Price: 10500000},
		{Code: "5555", Name: "Five Star Hotel Pillow", Price: 150000},
		{Code: "7777", Name: "Jackpot Mechanical Keycap", Price: 77000},
	}

	if err := db.Create(items).Error; err != nil {
		return fmt.Errorf("failed to seed items: %w", err)
	}

	fmt.Printf("Successfully seeded %d items\n", len(items))
	return nil
}
