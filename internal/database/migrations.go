package database

import (
	"log"

	"gorm.io/gorm"

	"pt-solusi-mitra-mandiri/internal/models"
)

func AutoMigrate(db *gorm.DB) {
	err := db.AutoMigrate(
		&models.User{},
		&models.CompanyFounder{},
		&models.B2BDemoRequest{},
		&models.GymPartner{},
	)
	if err != nil {
		log.Fatalf("Gagal melakukan auto-migration: %v", err)
	}
}
