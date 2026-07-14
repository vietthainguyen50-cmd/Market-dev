# NTT Marketplace

NTT Marketplace là đồ án website mua bán và đăng tin sản phẩm cũ, được xây dựng theo kiến trúc MVC bằng Node.js, Express, EJS và MongoDB. Phiên bản hiện tại đã có đăng ký, đăng nhập, session lưu trong MongoDB, đăng xuất và quản lý danh mục; trang chủ lấy danh mục từ MongoDB nhưng vẫn giữ sản phẩm tĩnh để minh họa giao diện.

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
- slugify
- Nodemon (development)
- CommonJS

## Yêu cầu

- Node.js 20.8 trở lên
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

## Danh mục sản phẩm

Bước 5 đã bổ sung model `Category`, tự động tạo slug tiếng Việt bằng `slugify`, danh sách/chi tiết danh mục công khai và khu vực quản lý dành riêng cho admin. Danh mục có các trường `name`, `slug`, `description`, `image`, `status`, `createdAt` và `updatedAt`. Trạng thái chỉ nhận `active` hoặc `inactive`; danh mục inactive không xuất hiện trên trang chủ hoặc các route công khai.

Route công khai:

- `GET /categories`: danh sách danh mục active.
- `GET /categories/:slug`: chi tiết một danh mục active; slug không tồn tại hoặc inactive trả 404.

Route quản trị, tất cả đều yêu cầu `req.user.role === "admin"`:

- `GET /admin/categories`
- `GET /admin/categories/create`
- `POST /admin/categories`
- `GET /admin/categories/:id/edit`
- `PUT /admin/categories/:id`
- `PATCH /admin/categories/:id/status`

Ứng dụng không nhận slug từ form. Service tự tạo slug từ tên, kiểm tra trùng name/slug trước khi ghi và vẫn xử lý duplicate key từ MongoDB để tránh lỗi kỹ thuật `E11000` xuất hiện trên giao diện. Category chỉ được ẩn bằng status, không có route DELETE.

Tạo dữ liệu danh mục ban đầu bằng lệnh:

```bash
npm run seed:categories
```

Seed chỉ thêm những danh mục còn thiếu bằng `$setOnInsert`; không xóa hoặc ghi đè danh mục đã được admin chỉnh sửa. Có thể chạy lại lệnh mà không tạo dữ liệu trùng.

Để tạo tài khoản admin test an toàn:

1. Đăng ký một tài khoản test riêng trên website.
2. Trong MongoDB Atlas, mở database `ntt_marketplace` và collection `users`.
3. Tìm đúng email test rồi chỉ đổi trường `role` của document đó từ `user` thành `admin`.
4. Đăng xuất và đăng nhập lại trước khi mở `/admin/categories`.

Không lưu email/mật khẩu admin trong source code và không cập nhật hàng loạt user. Bước 5 chưa có model Listing/sản phẩm và chưa có upload ảnh; trường `image` chỉ nhận URL hoặc đường dẫn static đã tồn tại. CSRF protection vẫn chưa được triển khai.

## Cấu trúc cơ bản

```text
.
├── src/
│   ├── config/
│   │   ├── database.js
│   │   └── session.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── category.controller.js
│   │   └── home.controller.js
│   ├── middlewares/
│   │   ├── admin.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   └── notFound.middleware.js
│   ├── models/
│   │   ├── Category.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminCategory.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   └── home.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   └── category.service.js
│   ├── utils/
│   │   └── createSlug.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   └── category.validator.js
│   ├── views/
│   │   ├── admin/categories/
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   └── register.ejs
│   │   ├── categories/
│   │   ├── errors/
│   │   ├── layouts/
│   │   ├── partials/
│   │   └── home.ejs
│   ├── public/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   └── app.js
├── scripts/
│   └── seedCategories.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Trạng thái dự án

Bước 5 đã hoàn thành model, seed, trang công khai và quản lý danh mục theo quyền admin, đồng thời giữ nguyên đăng ký, đăng nhập, session và đăng xuất của các bước trước. Dự án chưa có model Listing/sản phẩm, upload ảnh, JWT, trang cá nhân, admin dashboard hoàn chỉnh, yêu thích hoặc chat.
