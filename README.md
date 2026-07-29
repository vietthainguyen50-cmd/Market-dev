# NTT Marketplace

NTT Marketplace là đồ án website mua bán và đăng tin sản phẩm cũ, được xây dựng theo kiến trúc MVC bằng Node.js, Express, EJS và MongoDB. Phiên bản hiện tại đã có đăng ký, đăng nhập, session lưu trong MongoDB, hồ sơ cá nhân, quản lý danh mục và CRUD bài đăng; trang chủ và trang danh mục đều lấy sản phẩm thật từ MongoDB.

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
- multer
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

CSRF protection chưa được triển khai trong Bước 4 và sẽ được bổ sung ở giai đoạn bảo mật sau. Bước 4 chưa triển khai trang cá nhân, admin dashboard hoặc JWT; trang hồ sơ cá nhân được bổ sung riêng ở Bước 9.

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

Không lưu email/mật khẩu admin trong source code và không cập nhật hàng loạt user. Trường `image` của Category chỉ nhận URL hoặc đường dẫn static đã tồn tại. CSRF protection vẫn chưa được triển khai.

## Bài đăng sản phẩm

Bước 6 đã hoàn thành Listing CRUD theo quyền sở hữu. Model `Listing` lưu `title`, `description`, `price` dạng Number, `category` tham chiếu `Category`, `seller` tham chiếu `User`, `location`, `condition`, `images`, `status` và timestamps. `condition` chỉ nhận `new` hoặc `used`; `status` chỉ nhận `active`, `sold` hoặc `hidden`.

Route công khai:

- `GET /listings`
- `GET /listings/:id`

Route yêu cầu đăng nhập:

- `GET /listings/create`
- `POST /listings`
- `GET /my-listings`

Route chỉ owner hoặc admin được sử dụng:

- `GET /listings/:id/edit`
- `PUT /listings/:id`
- `PATCH /listings/:id/status`
- `DELETE /listings/:id`

Seller luôn được lấy từ user trong session, không nhận từ form. Route `DELETE` là soft delete: document không bị xóa mà chỉ chuyển sang `hidden`. Listing `active` hiển thị công khai và ở khu vực sản phẩm mới; listing `sold` vẫn công khai với nhãn “Đã bán” nhưng không xuất hiện ở sản phẩm mới; listing `hidden` chỉ owner hoặc admin xem được. Trang chủ lấy tối đa 8 listing active mới nhất từ MongoDB, còn trang chi tiết category hiển thị listing active và sold thuộc đúng category.

Bước 6 chưa hỗ trợ tìm kiếm, lọc, phân trang, yêu thích hoặc chat. Không commit file `.env` hay đưa thông tin kết nối, session secret vào source code.

## Upload ảnh sản phẩm

Bước 7 đã bổ sung upload nhiều ảnh bằng Multer cho form tạo và sửa Listing. Hai form sử dụng `multipart/form-data`, field upload có tên `images` và ảnh là tùy chọn. Mỗi Listing được có từ 0 đến 5 ảnh; mỗi ảnh tối đa 5 MB. Định dạng được hỗ trợ là JPG, JPEG, PNG và WEBP. Ứng dụng không chấp nhận SVG, GIF, video, tài liệu hoặc file thực thi do người dùng upload.

File được lưu local trong `uploads/listings/` với filename UUID do server tạo và phần mở rộng ánh xạ từ MIME type cho phép. Tên file gốc không được dùng làm tên lưu. MongoDB chỉ lưu public path dạng `/uploads/listings/<filename>`, không lưu Buffer, Base64 hoặc đường dẫn tuyệt đối. Thư mục `uploads/` nằm trong `.gitignore` nên ảnh người dùng không được commit lên Git.

Khi sửa Listing, owner hoặc admin có thể giữ ảnh cũ, tải thêm ảnh và chọn xóa riêng từng ảnh hiện tại. Ảnh cũ được đối chiếu với chính Listing trước khi xóa; file mới được dọn nếu upload, validation, category hoặc cập nhật database thất bại. File cũ chỉ bị xóa sau khi MongoDB cập nhật thành công. Ảnh đầu tiên trong mảng là ảnh chính.

Card sản phẩm và trang “Bài đăng của tôi” hiển thị ảnh chính. Trang chi tiết hiển thị gallery responsive. Listing cũ hoặc Listing mới không có ảnh sử dụng static placeholder `/images/listing-placeholder.svg`. Soft delete chỉ chuyển Listing sang `hidden` và không xóa ảnh, vì Listing vẫn có thể được owner xem hoặc kích hoạt lại.

Lưu ảnh local phù hợp cho môi trường development. Khi triển khai production trên nhiều máy hoặc filesystem không bền vững, có thể chuyển lớp lưu trữ sang Cloudinary hoặc S3 ở bước sau. Phiên bản hiện tại chưa triển khai Cloudinary.

## Tìm kiếm, lọc, sắp xếp và phân trang

Bước 8 bổ sung tìm kiếm công khai tại `GET /listings` bằng query string. Route hỗ trợ đúng các tham số `keyword`, `category`, `condition`, `minPrice`, `maxPrice`, `location`, `status`, `sort` và `page`. Giá trị mặc định lần lượt là chuỗi rỗng cho các bộ lọc tùy chọn, `status=all`, `sort=newest` và `page=1`. Mỗi trang luôn lấy tối đa 12 Listing; client không được tự thay đổi `limit`.

`keyword` tìm không phân biệt hoa thường trong `title` và `description`; `location` tìm chuỗi con không phân biệt hoa thường. Cả hai giá trị đều được giới hạn độ dài và escape ký tự regex trước khi tạo bộ lọc. Cách tìm bằng escaped regex phù hợp với phạm vi đồ án và lượng dữ liệu vừa phải; dự án chưa dùng MongoDB text index, Atlas Search, Elasticsearch hoặc dịch vụ tìm kiếm ngoài.

Danh mục được nhận dưới dạng slug và chỉ được resolve sang ObjectId khi Category còn active. `condition`, `status` và `sort` dùng whitelist cố định; `hidden` không bao giờ là trạng thái public. Giá chỉ nhận số nguyên từ 0 đến 100.000.000.000 và giá tối thiểu không được lớn hơn giá tối đa. `page` chỉ nhận số nguyên từ 1 đến 10.000. Các field lạ, object, array và cú pháp MongoDB operator từ query đều bị từ chối; `req.query` không được truyền hoặc spread trực tiếp vào truy vấn MongoDB.

Service dùng `countDocuments` song song với truy vấn `find`, đồng thời áp dụng `sort`, `skip` và `limit` ngay trong MongoDB. Phân trang giữ nguyên toàn bộ bộ lọc bằng `URLSearchParams`, hiển thị trang đầu/trước/các trang gần hiện tại/sau/cuối và chuyển về trang hợp lệ cuối cùng nếu người dùng yêu cầu trang vượt tổng kết quả. Trang chủ có form tìm nhanh gửi `GET /listings?keyword=...`; home controller vẫn chỉ tải danh mục active và 8 Listing active mới nhất như trước.

## Hồ sơ cá nhân

Bước 9 bổ sung trang hồ sơ riêng cho người dùng đã đăng nhập với các route:

- `GET /profile`: hiển thị thông tin tài khoản, ngày tham gia, thống kê Listing và tối đa 4 Listing gần đây.
- `GET /profile/edit`: hiển thị form chỉnh sửa hồ sơ.
- `PUT /profile`: cập nhật hồ sơ và ảnh đại diện.

Cả ba route đều dùng `requireAuth` và luôn lấy tài khoản từ `req.user._id`; route không nhận user ID từ URL hoặc form. Người dùng chỉ có thể cập nhật `name`, `phone`, `address` và `avatar`. Email, password, role và status không thể sửa trong bước này. Session tiếp tục chỉ lưu `userId`; tên và avatar mới được `loadCurrentUser` tải lại từ MongoDB ở request sau.

Avatar được upload bằng Multer qua field `avatar`, chỉ nhận một file JPG/JPEG, PNG hoặc WEBP tối đa 2 MB. File được đặt tên bằng UUID do server tạo, lưu trong `uploads/avatars/`, còn MongoDB chỉ lưu public path `/uploads/avatars/<uuid>.<extension>`. Ứng dụng không nhận filename gốc, Base64, absolute path, SVG, GIF, PDF hoặc video. Khi chưa có avatar, giao diện dùng placeholder tĩnh `/images/default-avatar.svg`.

Khi validation hoặc cập nhật database thất bại, avatar mới được dọn và avatar cũ được giữ nguyên. Avatar cũ chỉ bị xóa sau khi MongoDB cập nhật thành công, đồng thời utility chỉ cho phép xóa file thuộc đúng `uploads/avatars/`; ảnh Listing, placeholder và file ngoài thư mục này không bị tác động.

Thống kê hồ sơ dùng `countDocuments` riêng cho `active`, `sold` và `hidden`, sau đó tính tổng từ ba giá trị. Listing gần đây được truy vấn theo đúng seller hiện tại, sắp xếp mới nhất và giới hạn 4. Bước này chưa có đổi email, đổi mật khẩu, hồ sơ người bán công khai, Favorite hoặc Chat.

### Kiểm thử hồ sơ

Dự án dùng test runner có sẵn của Node.js nên không cần cài thêm package kiểm thử:

```bash
npm test
```

Bộ test kiểm tra validation name/phone/address, whitelist field cập nhật, bảo vệ route, thống kê Listing theo seller, Listing gần đây, Multer cho JPG/PNG/WEBP, giới hạn 2 MB, một file duy nhất, cleanup khi validation hoặc database lỗi, thay/xóa avatar, UUID public path, path traversal, placeholder và hồi quy auth/Category/Listing/search. Fixture avatar dùng UUID riêng và được xóa sau từng test; test không xóa ảnh Listing hoặc toàn bộ thư mục `uploads/`.

URL avatar đưa ra giao diện chỉ được chấp nhận khi khớp public path managed `/uploads/avatars/<uuid>.<extension>`; dữ liệu path khác sẽ hiển thị placeholder. Lỗi upload dự kiến trả form 422, còn lỗi filesystem hoặc Multer không dự kiến được chuyển cho error middleware thay vì bị che thành lỗi validation.

Khi `.env` đang trỏ tới database development dành cho kiểm thử, có thể chạy E2E profile:

```bash
npm run test:e2e:profile
```

Verifier tạo một tài khoản `example.test` ngẫu nhiên, kiểm tra session/profile/avatar trên HTTP và MongoDB thật, sau đó xóa đúng User, session và avatar của lần chạy đó. Script không in email, mật khẩu, cookie, MongoDB URI hoặc session secret; không dùng `deleteMany({})`, không xóa Listing và không giữ dữ liệu test.

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
│   │   ├── home.controller.js
│   │   ├── listing.controller.js
│   │   └── profile.controller.js
│   ├── middlewares/
│   │   ├── admin.middleware.js
│   │   ├── avatar.middleware.js
│   │   ├── auth.middleware.js
│   │   ├── error.middleware.js
│   │   ├── listing.middleware.js
│   │   ├── upload.middleware.js
│   │   └── notFound.middleware.js
│   ├── models/
│   │   ├── Category.js
│   │   ├── Listing.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminCategory.routes.js
│   │   ├── auth.routes.js
│   │   ├── category.routes.js
│   │   ├── home.routes.js
│   │   ├── listing.routes.js
│   │   └── profile.routes.js
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── category.service.js
│   │   ├── listing.service.js
│   │   └── profile.service.js
│   ├── utils/
│   │   ├── avatarStorage.js
│   │   ├── buildListingQuery.js
│   │   ├── createPagination.js
│   │   ├── createSlug.js
│   │   ├── escapeRegex.js
│   │   ├── fileStorage.js
│   │   ├── formatPrice.js
│   │   ├── normalizeListingQuery.js
│   │   └── presentListing.js
│   ├── validators/
│   │   ├── auth.validator.js
│   │   ├── category.validator.js
│   │   ├── listing.validator.js
│   │   └── profile.validator.js
│   ├── views/
│   │   ├── admin/categories/
│   │   ├── auth/
│   │   │   ├── login.ejs
│   │   │   └── register.ejs
│   │   ├── categories/
│   │   ├── errors/
│   │   ├── layouts/
│   │   ├── listings/
│   │   │   └── _pagination.ejs
│   │   ├── profile/
│   │   │   ├── edit.ejs
│   │   │   └── index.ejs
│   │   ├── partials/
│   │   └── home.ejs
│   ├── public/
│   │   ├── css/
│   │   ├── images/
│   │   └── js/
│   └── app.js
├── uploads/
│   ├── avatars/
│   └── listings/
├── scripts/
│   └── seedCategories.js
├── .env.example
├── package.json
├── server.js
└── README.md
```

## Trạng thái dự án

Bước 9 đã hoàn thành hồ sơ cá nhân có bảo vệ đăng nhập, chỉnh sửa thông tin liên hệ, upload/thay/xóa avatar, placeholder, thống kê Listing và Listing gần đây. Dự án tiếp tục giữ nguyên auth, session, Category, Listing CRUD, upload ảnh, soft delete và tìm kiếm/phân trang. Dự án chưa có đổi email, đổi mật khẩu, hồ sơ người bán công khai, Cloudinary, Atlas Search, Elasticsearch, JWT, admin dashboard hoàn chỉnh, Favorite, Chat hoặc thanh toán.
