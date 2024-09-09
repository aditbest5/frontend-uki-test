# Tahap 1: Build
# Menggunakan Node.js sebagai base image untuk membangun aplikasi React
FROM node:18 AS build

# Menetapkan direktori kerja dalam container
WORKDIR /app

# Menyalin file package.json dan package-lock.json
COPY package*.json ./

# Menginstal dependensi
RUN npm install

# Menyalin semua file aplikasi ke dalam container
COPY . .

# Membangun aplikasi React
RUN npm run build

# Tahap 2: Serve aplikasi menggunakan Nginx
FROM nginx:alpine

# Menyalin hasil build dari tahap build ke dalam direktori yang sesuai di Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Menyalin konfigurasi Nginx jika diperlukan
# COPY nginx.conf /etc/nginx/nginx.conf

# Mengekspos port 80 untuk akses HTTP
EXPOSE 80

# Menjalankan Nginx
CMD ["nginx", "-g", "daemon off;"]
