# Makefile for Vietnam Salary Calculator

.PHONY: install dev build preview deploy help

# Cài đặt phụ thuộc
install:
	npm install

# Chạy môi trường phát triển
dev:
	npm run dev

# Xây dựng bản production
build:
	npm run build

# Chạy thử bản production local
preview:
	npm run build && npm run preview

# Deploy lên Vercel
deploy:
	npx vercel --prod

# Hướng dẫn
help:
	@echo "Các lệnh hỗ trợ:"
	@echo "  make install - Cài đặt thư viện"
	@echo "  make dev     - Chạy local dev"
	@echo "  make build   - Build bản production"
	@echo "  make preview - Build và chạy thử bản production"
	@echo "  make deploy  - Deploy lên Vercel (yêu cầu vercel cli)"
