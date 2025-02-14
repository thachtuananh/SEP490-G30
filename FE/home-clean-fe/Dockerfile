# Sử dụng Node.js phiên bản 18.20.6 làm base image
FROM node:18.20.6-alpine

# Đặt thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json vào container
COPY package*.json ./

# Cài đặt dependencies
RUN npm install

# Copy toàn bộ mã nguồn vào container
COPY . .

# Build ứng dụng (nếu cần)
RUN npm run build

# Expose port (thường là 3000 cho React)
EXPOSE 3000

# Chạy ứng dụng
CMD ["npm", "start"]
