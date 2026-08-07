# Production checklist — NTT Marketplace

## Trước khi triển khai

- [ ] Dùng phiên bản Node.js đáp ứng yêu cầu trong `package.json`/README.
- [ ] Chạy `npm ci` từ lockfile đã review.
- [ ] Đặt `NODE_ENV=production`.
- [ ] Cấu hình `MONGODB_URI` bằng secret của nền tảng, không ghi vào Git hay log.
- [ ] Cho phép đúng IP/network của máy chủ trong MongoDB Atlas và kiểm tra backup.
- [ ] Tạo `SESSION_SECRET` ngẫu nhiên, riêng cho production, tối thiểu 32 ký tự.
- [ ] Cấu hình `SESSION_COOKIE_NAME` và `SESSION_MAX_AGE_MS` hợp lệ nếu cần đổi mặc định.
- [ ] Bật HTTPS ở load balancer/reverse proxy.
- [ ] Đặt `TRUST_PROXY` đúng số hop proxy tin cậy; dùng `0` nếu Node nhận kết nối trực tiếp.
- [ ] Xác nhận cookie có `Secure`, `HttpOnly`, `SameSite=Lax` khi chạy production qua HTTPS.

## Dữ liệu và file upload

- [ ] Cấp persistent disk cho `uploads/listings`, `uploads/avatars`, `uploads/categories`.
- [ ] Nếu hosting dùng filesystem tạm thời, chuyển sang persistent disk hoặc object storage trước khi nhận dữ liệu thật.
- [ ] Chạy `npm run audit:data` và review orphan/missing file; lệnh này chỉ đọc dữ liệu.
- [ ] Chạy `npm run cleanup:orphans` nếu cần xem kế hoạch dry-run.
- [ ] Không chạy cleanup `--apply` nếu chưa backup và review từng ID/path.
- [ ] Kiểm tra chính sách backup/restore MongoDB và upload cùng một thời điểm nhất quán.

## Kiểm thử và khởi động

- [ ] Chạy `npm run test:all` và yêu cầu exit code 0.
- [ ] Chạy `npm audit` và review mọi cảnh báo runtime/transitive.
- [ ] Khởi động bằng `npm start` (không dùng Nodemon).
- [ ] Cấu hình health check tới `GET /healthz`; response mong đợi là `{"status":"ok"}`.
- [ ] Smoke test `/`, `/categories`, `/listings`, auth, private routes, admin và 404.
- [ ] Kiểm tra SIGTERM: ngừng nhận request, đóng HTTP server, session store và MongoDB trong timeout.

## Vận hành

- [ ] Log chỉ gồm method, status và thời gian xử lý; không log cookie, token, password, URI hoặc nội dung Message.
- [ ] Theo dõi tỷ lệ 4xx/5xx/429 và dung lượng persistent upload.
- [ ] Kiểm tra CSP/Helmet sau mọi thay đổi CDN hoặc asset.
- [ ] Định kỳ chạy audit dữ liệu read-only và diễn tập restore backup.
