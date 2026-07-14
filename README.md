# NTT Marketplace

NTT Marketplace là đồ án website mua bán và đăng tin sản phẩm cũ, được xây dựng theo kiến trúc MVC bằng Node.js, Express, EJS và MongoDB. Phiên bản hiện tại đã có đăng ký, đăng nhập, session lưu trong MongoDB và đăng xuất; trang chủ vẫn dùng dữ liệu tĩnh để minh họa giao diện.

## Công nghệ đang sử dụng

- Node.js và Express.js
- MongoDB và Mongoose
- EJS
- Bootstrap 5
- Helmet
- Morgan
- Method Override
- dotenv
- bcrypt
- express-validator
- express-session
- connect-mongo
- Nodemon (development)
- CommonJS

## Yêu cầu

- Node.js 18 trở lên
- npm đi kèm Node.js
- MongoDB local đang chạy hoặc một MongoDB Atlas cluster có thể truy cập

Kiểm tra phiên bản đã cài:

```bash
node --version
npm --version
```

## Cài đặt

1. Cài dependencies:

   ```bash
   npm install
   ```

2. Tạo file `.env` từ file mẫu:

   PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   macOS/Linux:

   ```bash
   cp .env.example .env
   ```

3. Cấu hình cổng, kết nối MongoDB và session trong `.env`:

   ```env
   NODE_ENV=development
   PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ntt_marketplace
SESSION_SECRET=replace_with_a_long_random_secret
SESSION_COOKIE_NAME=ntt_marketplace_sid
SESSION_MAX_AGE_MS=604800000
```

   Tạo `SESSION_SECRET` mạnh bằng lệnh sau rồi chỉ lưu kết quả vào `.env` local:

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   Không commit file `.env` vì file này có thể chứa thông tin kết nối và session secret. `.env.example` chỉ chứa các giá trị mẫu an toàn.

## Kết nối MongoDB

### MongoDB local

Khởi động MongoDB local trước khi chạy website. Nếu MongoDB được cài dưới dạng Windows service, có thể khởi động service từ ứng dụng Services hoặc terminal có quyền phù hợp:

```powershell
net start MongoDB
```

Nếu chạy `mongod` thủ công, chỉ định thư mục lưu dữ liệu đã tồn tại:

```powershell
mongod --dbpath C:\data\db
```

Sau đó dùng URI sau trong `.env`:

```env
MONGODB_URI=mongodb://127.0.0.1:27017/ntt_marketplace
```

### MongoDB Atlas

Thay `MONGODB_URI` trong file `.env` local bằng connection string do Atlas cung cấp:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER/ntt_marketplace
```

Thay các giá trị mẫu bằng thông tin thật, cấu hình Database User và cho phép địa chỉ IP của máy truy cập cluster. Không đưa connection string thật vào `.env.example` hoặc Git.

Nếu Node.js báo lỗi `querySrv ECONNREFUSED` trong khi URI Atlas hợp lệ, có thể cấu hình DNS resolver dành cho truy vấn MongoDB trong `.env`:

```env
MONGODB_DNS_SERVERS=8.8.8.8,1.1.1.1
```

## Chạy dự án

Chế độ development (tự khởi động lại khi mã nguồn thay đổi):

```bash
npm run dev
```

Chế độ production:

```bash
npm start
```

Sau khi khởi động, truy cập `http://localhost:3000`.

MongoDB Atlas hoặc MongoDB local phải kết nối thành công trước khi server bắt đầu lắng nghe HTTP.

## Đăng ký tài khoản

Bước 3 đã bổ sung chức năng đăng ký phía server với các route:

- `GET /register`: hiển thị form đăng ký.
- `POST /register`: validate dữ liệu, kiểm tra email trùng, hash mật khẩu và lưu user.

Mật khẩu được hash bằng `bcrypt` với 12 vòng salt trước khi lưu. Dữ liệu form được kiểm tra phía server bằng `express-validator`; `confirmPassword` không được lưu và `role`/`status` không được nhận từ request.

Để kiểm tra thủ công:

1. Chạy `npm run dev` và chờ thông báo MongoDB kết nối thành công.
2. Mở `http://localhost:3000/register`.
3. Gửi form hợp lệ và xác nhận trang chuyển về `/login?registered=1`.
4. Thử email sai định dạng, mật khẩu ngắn, xác nhận không khớp và email đã tồn tại để kiểm tra thông báo lỗi.

## Đăng nhập, session và đăng xuất

Bước 4 đã bổ sung đăng nhập và đăng xuất bằng session phía server:

- `GET /login`: hiển thị form đăng nhập.
- `POST /login`: validate dữ liệu, tìm user và dùng `bcrypt.compare` để kiểm tra mật khẩu.
- `POST /logout`: hủy session, xóa cookie và chuyển về trang đăng nhập.
- `GET /logout` không tồn tại; thao tác thay đổi trạng thái chỉ dùng phương thức POST.

Ứng dụng dùng `express-session` và `connect-mongo`. Session được lưu trong collection `sessions` của chính MongoDB được cấu hình qua `MONGODB_URI`; cookie chỉ chứa session ID, có `httpOnly`, `sameSite=lax`, thời hạn mặc định 7 ngày và chỉ bật `secure` trong production. Session chỉ lưu `userId`, không lưu mật khẩu, password hash hoặc toàn bộ user document.

Sau khi xác thực thành công, session được regenerate trước khi ghi `userId` để hạn chế session fixation. Middleware tải user active theo `userId`, đặt user vào `req.user` và `res.locals.currentUser`, nhờ đó EJS có thể hiển thị tên người dùng và form đăng xuất trên navbar. Tài khoản `blocked` hoặc `pending` không thể đăng nhập.

Để kiểm tra thủ công:

1. Đăng ký một tài khoản test tại `/register` và xác nhận được chuyển tới `/login?registered=1`.
2. Đăng nhập bằng tài khoản test, xác nhận response chuyển về `/` và navbar hiển thị tên người dùng.
3. Refresh trang chủ, sau đó mở `/login` và `/register`; trạng thái đăng nhập phải được giữ và hai trang guest phải chuyển về `/`.
4. Gửi form `POST /logout`, xác nhận chuyển tới `/login?loggedOut=1` và navbar trở lại trạng thái guest.
5. Kiểm tra MongoDB có collection `sessions` và document session không chứa password/password hash.

Các biến session bắt buộc hoặc được hỗ trợ:

- `SESSION_SECRET`: secret mạnh dùng để ký session cookie; ứng dụng báo lỗi rõ ràng nếu thiếu.
- `SESSION_COOKIE_NAME`: tên cookie, mặc định đề xuất là `ntt_marketplace_sid`.
- `SESSION_MAX_AGE_MS`: thời gian sống cookie theo mili giây, giá trị mẫu `604800000` tương đương 7 ngày.

CSRF protection chưa được triển khai trong Bước 4 và sẽ được bổ sung ở giai đoạn bảo mật sau. Phiên bản này cũng chưa có trang cá nhân, phân quyền/admin dashboard hoặc JWT.

## Cấu trúc cơ bản

```text
.
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── session.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   └── home.controller.js
│   ├── middlewares/
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   ├── models/
│   │   └── User.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   └── home.routes.js
│   ├── services/
│   │   └── auth.service.js
│   ├── validators/
│   │   └── auth.validator.js
│   ├── views/
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   └── register.ejs
│   │   ├── errors/
│   │   ├── layouts/
│   │   ├── partials/
│   │   └── home.ejs
│   ├── public/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   └── app.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Trạng thái dự án

Bước 4 đã hoàn thành đăng nhập, session lưu trong MongoDB và đăng xuất bằng POST, đồng thời giữ nguyên đăng ký tài khoản, validation phía server, xử lý email trùng và hash mật khẩu của Bước 3. Dự án chưa có JWT, trang cá nhân, phân quyền/admin dashboard, đăng sản phẩm, upload ảnh, yêu thích hoặc chat.
