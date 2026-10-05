# Pillar Core Web

เว็บไซต์หลักของ Pillar Core (Next.js 16 + Auth.js + Tailwind CSS 4): หน้าแนะนำแพลตฟอร์ม แอปบน Pillar Core ข่าวสาร
Marketplace ศูนย์ช่วยเหลือ และบัญชีของผู้ใช้ ข้อมูลทั้งหมดจัดการจาก Pillar Core Admin (`/site/*`) และมาจาก plc-portal
ผ่าน plc-gateway ตามสัญญา API ใน `pillar-core-backend/docs/pillarcore-site-api.md`

| ส่วน | รายละเอียด |
|---|---|
| ภาษา | `/th/*` และ `/en/*` (proxy เลือกจาก cookie `plc_lang` แล้ว `Accept-Language`) ข้อความอยู่ใน `src/dictionaries` |
| ธีม | สว่าง / มืด / ตามระบบ (next-themes) สีหลักส้มตามโลโก้ เสริมด้วย teal และ violet สีทั้งหมดเป็น token ใน `src/app/globals.css` |
| เข้าสู่ระบบ | Keycloak client `pillar-web` (realm `pillarcore`) สมัครด้วยอีเมลแล้วยืนยันผ่านอีเมล หรือ Google / Facebook / LINE / GitHub ผ่าน identity provider ของ Keycloak บัญชีเดียวกับทุกแอป |
| Session | JWT cookie เข้ารหัส (ไม่มี DB) token ของ Keycloak อยู่ใน cookie นี้เท่านั้นและอ่านฝั่ง server; proxy refresh token ให้ระหว่างใช้งาน |
| ชำระเงิน | plc-portal (`PAYMENT_PROVIDER=mock` ตอน dev มีหน้าจ่ายเงินจำลองที่ `/[lang]/checkout/mock/[orderId]`, `stripe` สำหรับใช้จริง) |
| รูปภาพ | path `/api/portal/public/media/*` ถูก rewrite ไปที่ `API_BASE_URL` (ต้องตั้งค่าก่อน `next build`) |

## Dev

```bash
cp .env.example .env.local     # ใส่ AUTH_SECRET: openssl rand -base64 32
pnpm install
pnpm dev                       # http://localhost:3200
```

ต้องมี Keycloak (`pillar-core-backend/infra`) และ plc-gateway + plc-portal ทำงานอยู่ ถ้า API ยังไม่ขึ้น หน้าเว็บสาธารณะยังเปิดได้
(แสดง Landie / Appoiz จากข้อมูลสำรองและซ่อนส่วนที่ไม่มีข้อมูล)

Realm ที่สร้างไว้ก่อนแล้วต้องรัน `infra/keycloak/setup-web-client.sh` เพื่อเพิ่ม client `pillar-web` และ social login
แล้วใส่ชื่อ provider ที่เปิดไว้ใน `AUTH_SOCIAL_PROVIDERS` (เช่น `google,facebook,line`)

ตรวจก่อน push: `pnpm exec next typegen && pnpm exec tsc --noEmit && pnpm lint && pnpm build`
