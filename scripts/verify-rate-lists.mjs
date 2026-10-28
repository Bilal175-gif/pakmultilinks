import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';

const { loadEnvConfig } = nextEnv.default || nextEnv;
loadEnvConfig(process.cwd());

const base = process.env.TEST_BASE_URL || 'http://localhost:3003';
const db = new PrismaClient();
const secret = process.env.AUTH_SECRET || 'replace-with-a-long-random-secret';

const token = await new SignJWT({
  email: 'admin@pakmultilinks.test',
  name: 'Admin Verification',
  role: 'ADMIN',
})
  .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
  .setSubject('admin-verification')
  .setIssuedAt()
  .setExpirationTime('10m')
  .setIssuer('pak-multilinks-hygiene')
  .setAudience('pak-multilinks-web')
  .sign(new TextEncoder().encode(secret));

const authHeaders = {
  Cookie: `pmh_session=${token}`,
  Origin: base,
};

async function run() {
  console.log('1. Verifying unauthenticated access to /api/admin/rate-lists...');
  const unauthRes = await fetch(`${base}/api/admin/rate-lists`);
  assert.equal(unauthRes.status, 401, 'Unauthenticated request must return 401');

  console.log('2. Verifying authenticated GET /api/admin/rate-lists...');
  const listRes = await fetch(`${base}/api/admin/rate-lists`, {
    headers: { ...authHeaders },
  });
  assert.equal(listRes.status, 200, 'Authenticated request must return 200');
  const listData = await listRes.json();
  assert.ok(Array.isArray(listData.files), 'Response must have files array');
  assert.ok(listData.files.length >= 9, 'Must contain seeded rate list files');
  console.log(`   Found ${listData.files.length} rate list files in database.`);

  console.log('3. Verifying multipart PDF file upload...');
  // Minimal valid PDF content
  const samplePdfBytes = new Uint8Array([
    0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, // %PDF-1.4\n
    0x31, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x43, 0x61, 0x74, 0x61, 0x6c, 0x6f, 0x67, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
    0x32, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x73, 0x2f, 0x4b, 0x69, 0x64, 0x73, 0x5b, 0x33, 0x20, 0x30, 0x20, 0x52, 0x5d, 0x2f, 0x43, 0x6f, 0x75, 0x6e, 0x74, 0x20, 0x31, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
    0x33, 0x20, 0x30, 0x20, 0x6f, 0x62, 0x6a, 0x0a, 0x3c, 0x3c, 0x2f, 0x54, 0x79, 0x70, 0x65, 0x2f, 0x50, 0x61, 0x67, 0x65, 0x2f, 0x50, 0x61, 0x72, 0x65, 0x6e, 0x74, 0x20, 0x32, 0x20, 0x30, 0x20, 0x52, 0x2f, 0x4d, 0x65, 0x64, 0x69, 0x61, 0x42, 0x6f, 0x78, 0x5b, 0x30, 0x20, 0x30, 0x20, 0x36, 0x31, 0x32, 0x20, 0x37, 0x39, 0x32, 0x5d, 0x3e, 0x3e, 0x0a, 0x65, 0x6e, 0x64, 0x6f, 0x62, 0x6a, 0x0a,
    0x78, 0x72, 0x65, 0x66, 0x0a, 0x30, 0x20, 0x34, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x36, 0x35, 0x35, 0x33, 0x35, 0x20, 0x66, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x36, 0x30, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x30, 0x31, 0x31, 0x34, 0x20, 0x30, 0x30, 0x30, 0x30, 0x30, 0x20, 0x6e, 0x20, 0x0a,
    0x74, 0x72, 0x61, 0x69, 0x6c, 0x65, 0x72, 0x0a, 0x3c, 0x3c, 0x2f, 0x53, 0x69, 0x7a, 0x65, 0x20, 0x34, 0x2f, 0x52, 0x6f, 0x6f, 0x74, 0x20, 0x31, 0x20, 0x30, 0x20, 0x52, 0x3e, 0x3e, 0x0a,
    0x73, 0x74, 0x61, 0x72, 0x74, 0x78, 0x72, 0x65, 0x66, 0x0a, 0x31, 0x39, 0x30, 0x0a,
    0x25, 0x25, 0x45, 0x4f, 0x46, 0x0a // %%EOF\n
  ]);

  const formData = new FormData();
  const blob = new Blob([samplePdfBytes], { type: 'application/pdf' });
  formData.append('file', blob, 'verified-commercial-catalogue.pdf');
  formData.append('title', 'Verified Commercial Rate List 2026');
  formData.append('category', 'Commercial Paper');
  formData.append('description', 'Test upload verification document.');
  formData.append('isPrimary', 'false');
  formData.append('isActive', 'true');

  const uploadRes = await fetch(`${base}/api/admin/rate-lists`, {
    method: 'POST',
    headers: { ...authHeaders },
    body: formData,
  });

  const uploadData = await uploadRes.json();
  assert.equal(uploadRes.status, 201, `Upload failed: ${JSON.stringify(uploadData)}`);
  assert.equal(uploadData.success, true);
  assert.equal(uploadData.file.title, 'Verified Commercial Rate List 2026');
  assert.equal(uploadData.file.category, 'Commercial Paper');
  assert.equal(uploadData.file.pageCount, 1);
  console.log(`   Uploaded successfully! Record ID: ${uploadData.file.id}, FileUrl: ${uploadData.file.fileUrl}`);

  const uploadedId = uploadData.file.id;

  console.log('4. Verifying PATCH /api/admin/rate-lists/:id (toggle update)...');
  const patchRes = await fetch(`${base}/api/admin/rate-lists/${uploadedId}`, {
    method: 'PATCH',
    headers: { ...authHeaders, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Updated Commercial Rate List 2026',
      isActive: false,
    }),
  });
  assert.equal(patchRes.status, 200);
  const patchData = await patchRes.json();
  assert.equal(patchData.file.title, 'Updated Commercial Rate List 2026');
  assert.equal(patchData.file.isActive, false);
  console.log('   PATCH verified successfully.');

  console.log('5. Verifying DELETE /api/admin/rate-lists/:id...');
  const deleteRes = await fetch(`${base}/api/admin/rate-lists/${uploadedId}`, {
    method: 'DELETE',
    headers: { ...authHeaders },
  });
  assert.equal(deleteRes.status, 200);
  console.log('   DELETE verified successfully.');

  console.log('6. Verifying protected page rendering /admin/rate-lists...');
  const pageRes = await fetch(`${base}/admin/rate-lists`, {
    headers: { ...authHeaders },
  });
  assert.equal(pageRes.status, 200, 'Page must return 200 with admin session');
  const pageHtml = await pageRes.text();
  assert.ok(pageHtml.includes('Wholesale Rate Lists &amp; Files') || pageHtml.includes('Rate Lists &amp; Files') || pageHtml.includes('Rate Lists & Files'), 'Page must contain heading');
  console.log('   /admin/rate-lists rendered with HTTP 200.');

  console.log('\nALL VERIFICATIONS PASSED SUCCESSFULLY!');
}

try {
  await run();
} finally {
  await db.$disconnect();
}
