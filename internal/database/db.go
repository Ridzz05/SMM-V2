package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"

	"pt-solusi-mitra-mandiri/internal/config"
)

var DB *gorm.DB

func InitDB(cfg *config.Config) *gorm.DB {
	var err error
	DB, err = gorm.Open(sqlite.Open(cfg.DatabasePath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Gagal terhubung ke database SQLite: %v", err)
	}

	AutoMigrate(DB)
	SeedDefaults(DB, cfg)

	log.Printf("Database SQLite siap digunakan di: %s", cfg.DatabasePath)
	return DB
}
