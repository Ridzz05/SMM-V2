package models

import (
	"time"
)

type B2BDemoRequest struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	CompanyName string    `gorm:"size:255;not null" json:"company_name"`
	PicName     string    `gorm:"size:255;not null" json:"pic_name"`
	PhoneNumber string    `gorm:"size:50;not null" json:"phone_number"`
	Email       string    `gorm:"size:255;not null" json:"email"`
	Notes       string    `gorm:"type:text" json:"notes"`
	Status      string    `gorm:"size:50;default:'pending'" json:"status"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}
