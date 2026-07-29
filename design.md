# Design — NTT Marketplace

Hệ thống thiết kế khóa cho toàn bộ ứng dụng. Mọi trang EJS đọc các token trong
`src/public/css/tokens.css`; không tạo thêm file token song song và không đổi
nghiệp vụ để phục vụ trình bày.

## Genre

Modern-minimal, thiên về utilitarian: rõ ràng, đáng tin cậy, ưu tiên khả năng đọc
và thao tác mua bán hơn hiệu ứng trang trí.

## Audience, use case và tone

- Audience: khách xem, người mua, người bán đồ cũ và quản trị viên danh mục.
- Use case: khám phá, tìm/lọc, xem chi tiết, đăng và quản lý tin; cập nhật hồ sơ.
- Tone: hiện đại, tiết chế, thực dụng và thân thiện; không mang cảm giác dashboard khô cứng.

## Macrostructure family

- Marketing/home: **Ecosystem Index** — hero ngắn, sau đó là các bề mặt khám phá theo danh mục và tin mới.
- App/task pages: **Workbench** — nội dung chức năng, form, profile và inspector rõ ràng.
- Inventory/content pages: **Catalogue** — lưới Listing/Category nhất quán, filter đứng trước kết quả.

## Theme

NTT Cobalt, kế thừa trực tiếp nền Hallmark đã có ở trang chi tiết Listing.

- `--color-paper`: `oklch(98% 0.008 250)`
- `--color-paper-2`: `oklch(95% 0.012 250)`
- `--color-paper-3`: `oklch(91% 0.015 250)`
- `--color-ink`: `oklch(20% 0.025 255)`
- `--color-ink-2`: `oklch(34% 0.025 255)`
- `--color-rule`: `oklch(72% 0.018 250)`
- `--color-rule-2`: `oklch(86% 0.014 250)`
- `--color-accent`: `oklch(52% 0.19 255)`
- `--color-focus`: `oklch(30% 0.16 255)`

Accent cobalt chỉ đóng vai trò tín hiệu: CTA chính, link, active state và focus.
Success, warning, danger, info, sold và hidden là màu semantic; không dùng làm
mảng trang trí.

## Typography

- Display: Bahnschrift, weight 700, style normal.
- Body: Aptos, weight 400.
- Outlier: Cascadia Mono, weight 700; chỉ dùng cho giá và số liệu ngắn.
- Display tracking: `-0.025em`.
- Type scale: major third 1.25; body tối thiểu `1rem`.
- Heading luôn upright; body copy giới hạn khoảng `65ch`.

Không tải font ngoài. Đây là chủ ý để giữ tốc độ, CSP hiện tại và nền system-font
đã được người dùng chấp thuận.

## Spacing

Thang 4-point đặt tại `src/public/css/tokens.css`. View chỉ dùng token hoặc
Bootstrap utility tương ứng; CSS mới không lặp lại các giá trị spacing tùy ý.

## Motion

- Easings: `--ease-out`, `--ease-in`, `--ease-in-out`.
- Chỉ animate `transform` và `opacity`.
- Không thêm reveal toàn trang; giữ one-shot stagger nhẹ của gallery hiện tại.
- Reduced motion: bỏ chuyển động không chức năng, tối đa 150 ms.

## Microinteractions stance

- Thành công hiển thị yên lặng qua trạng thái/result hiện có.
- Hover nhẹ; focus-visible xuất hiện tức thời.
- Button có default, hover, focus, active, disabled, loading, error và success.
- Form giữ border-width ở mọi trạng thái, lỗi luôn có message bên cạnh màu.

## Navigation và footer

- Navigation: N1b three-section, `centre-links=3`, `dropdowns=none`,
  `scroll=always-solid`; dùng Bootstrap collapse trên mobile.
- Footer: Ft2 inline-rule; chỉ dùng các liên kết thật, mô tả ngắn và copyright.

## CTA voice

- Primary: cobalt fill, góc vừa, động từ cụ thể.
- Secondary: nền trong suốt, border rõ.
- Danger: chỉ cho thao tác ẩn/xóa; không dùng như CTA trang trí.
- Affordance luôn một dòng và có hit target tối thiểu 44 px.

## Per-page allowances

- Home dùng nội dung thật từ Category/Listing; không tạo metric, testimonial hay ảnh giả.
- Listing/Category dùng ảnh người dùng và placeholder hiện có.
- App pages không thêm enrichment; chức năng là nội dung chính.
- Listing detail giữ nguyên logic ảnh, owner/admin actions và Workbench hiện có.

## What pages MUST share

- Wordmark NTT Marketplace và brand mark.
- Cobalt accent, typography, button/form voice và focus ring.
- Header/footer, section heading, card, badge, alert, empty state và pagination.
- Token semantic từ `src/public/css/tokens.css`.

## What pages MAY differ on

- Home có nhịp Ecosystem Index.
- Listing/Category dùng Catalogue grid.
- Form/Profile/Admin dùng Workbench panels.
- Listing detail có CSS riêng nhưng không được lệch theme.

## Exports

Các block dưới đây là bản portable. Nguồn chạy thật của dự án vẫn là
`src/public/css/tokens.css`.

### tokens.css

```css
:root {
  --color-paper: oklch(98% 0.008 250);
  --color-paper-2: oklch(95% 0.012 250);
  --color-paper-3: oklch(91% 0.015 250);
  --color-rule: oklch(72% 0.018 250);
  --color-rule-2: oklch(86% 0.014 250);
  --color-muted: oklch(45% 0.02 255);
  --color-neutral: oklch(38% 0.022 255);
  --color-ink-2: oklch(34% 0.025 255);
  --color-ink: oklch(20% 0.025 255);
  --color-accent: oklch(52% 0.19 255);
  --color-accent-ink: oklch(98% 0.008 250);
  --color-focus: oklch(30% 0.16 255);

  --font-display: Bahnschrift, "Arial Narrow", "Aptos Display", sans-serif;
  --font-body: Aptos, "Segoe UI", system-ui, sans-serif;
  --font-outlier: "Cascadia Mono", "SFMono-Regular", ui-monospace, monospace;

  --space-3xs: 0.125rem;
  --space-2xs: 0.25rem;
  --space-xs: 0.5rem;
  --space-sm: 0.75rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2.5rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;
  --text-display: clamp(2rem, 5vw, 3.75rem);

  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-micro: 120ms;
  --dur-short: 220ms;
  --dur-long: 420ms;

  --radius-card: 0.75rem;
  --radius-pill: 999px;
  --radius-input: 0.375rem;
}
```

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper: oklch(98% 0.008 250);
  --color-paper-2: oklch(95% 0.012 250);
  --color-paper-3: oklch(91% 0.015 250);
  --color-rule: oklch(72% 0.018 250);
  --color-rule-2: oklch(86% 0.014 250);
  --color-muted: oklch(45% 0.02 255);
  --color-neutral: oklch(38% 0.022 255);
  --color-ink-2: oklch(34% 0.025 255);
  --color-ink: oklch(20% 0.025 255);
  --color-accent: oklch(52% 0.19 255);
  --color-focus: oklch(30% 0.16 255);

  --font-display: Bahnschrift, "Arial Narrow", "Aptos Display", sans-serif;
  --font-body: Aptos, "Segoe UI", system-ui, sans-serif;
  --font-outlier: "Cascadia Mono", "SFMono-Regular", ui-monospace, monospace;

  --spacing-3xs: 0.125rem;
  --spacing-2xs: 0.25rem;
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2.5rem;
  --spacing-2xl: 4rem;
  --spacing-3xl: 6rem;

  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-md: 1.25rem;
  --text-lg: 1.5625rem;
  --text-xl: 1.9531rem;
  --text-2xl: 2.4414rem;

  --radius-card: 0.75rem;
  --radius-pill: 999px;
  --radius-input: 0.375rem;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
}
```

### DTCG `tokens.json`

```json
{
  "$schema": "https://design-tokens.github.io/community-group/format/",
  "color": {
    "paper": { "$value": "oklch(98% 0.008 250)", "$type": "color" },
    "paper-2": { "$value": "oklch(95% 0.012 250)", "$type": "color" },
    "paper-3": { "$value": "oklch(91% 0.015 250)", "$type": "color" },
    "rule": { "$value": "oklch(72% 0.018 250)", "$type": "color" },
    "rule-2": { "$value": "oklch(86% 0.014 250)", "$type": "color" },
    "muted": { "$value": "oklch(45% 0.02 255)", "$type": "color" },
    "neutral": { "$value": "oklch(38% 0.022 255)", "$type": "color" },
    "ink-2": { "$value": "oklch(34% 0.025 255)", "$type": "color" },
    "ink": { "$value": "oklch(20% 0.025 255)", "$type": "color" },
    "accent": { "$value": "oklch(52% 0.19 255)", "$type": "color" },
    "focus": { "$value": "oklch(30% 0.16 255)", "$type": "color" }
  },
  "font": {
    "display": { "$value": "Bahnschrift, Arial Narrow, Aptos Display, sans-serif", "$type": "fontFamily" },
    "body": { "$value": "Aptos, Segoe UI, system-ui, sans-serif", "$type": "fontFamily" },
    "outlier": { "$value": "Cascadia Mono, SFMono-Regular, ui-monospace, monospace", "$type": "fontFamily" }
  },
  "space": {
    "3xs": { "$value": "0.125rem", "$type": "dimension" },
    "2xs": { "$value": "0.25rem", "$type": "dimension" },
    "xs": { "$value": "0.5rem", "$type": "dimension" },
    "sm": { "$value": "0.75rem", "$type": "dimension" },
    "md": { "$value": "1rem", "$type": "dimension" },
    "lg": { "$value": "1.5rem", "$type": "dimension" },
    "xl": { "$value": "2.5rem", "$type": "dimension" },
    "2xl": { "$value": "4rem", "$type": "dimension" },
    "3xl": { "$value": "6rem", "$type": "dimension" }
  },
  "duration": {
    "micro": { "$value": "120ms", "$type": "duration" },
    "short": { "$value": "220ms", "$type": "duration" },
    "long": { "$value": "420ms", "$type": "duration" }
  }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 98% 0.008 250;
  --foreground: 20% 0.025 255;
  --card: 95% 0.012 250;
  --card-foreground: 20% 0.025 255;
  --popover: 95% 0.012 250;
  --popover-foreground: 20% 0.025 255;
  --primary: 52% 0.19 255;
  --primary-foreground: 98% 0.008 250;
  --secondary: 91% 0.015 250;
  --secondary-foreground: 34% 0.025 255;
  --muted: 86% 0.014 250;
  --muted-foreground: 45% 0.02 255;
  --accent: 52% 0.19 255;
  --accent-foreground: 98% 0.008 250;
  --destructive: 48% 0.17 28;
  --destructive-foreground: 98% 0.008 250;
  --border: 86% 0.014 250;
  --input: 86% 0.014 250;
  --ring: 30% 0.16 255;
  --radius: 0.75rem;
}
```

