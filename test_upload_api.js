// Test API generate-from-document với cả file .txt lẫn khác
const fs = require('fs');
const path = require('path');

const API_URL = 'http://localhost:5000/api/v1';

async function main() {
  // 1. Login
  console.log('=== Đăng nhập ===');
  const loginRes = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'trongnv@gmail.com', password: '12345678' }),
  });
  const loginData = await loginRes.json();
  if (!loginData.success) { console.error('Login failed:', loginData); return; }
  const token = loginData.token;
  console.log('Login OK, token:', token ? 'YES' : 'NO');

  // 2. Test with .txt file
  console.log('\n=== Test với file .txt ===');
  const txtContent = fs.readFileSync(path.resolve('test_reference_doc.txt'));
  const formData = new FormData();
  formData.append('document', new Blob([txtContent], { type: 'text/plain' }), 'test_reference_doc.txt');
  formData.append('topic', 'Luyện thi TOEIC');
  formData.append('platform', 'Blog');
  formData.append('tone', 'Professional');
  formData.append('needOutline', 'false');
  formData.append('needSEO', 'false');
  formData.append('needImage', 'false');

  const res = await fetch(`${API_URL}/ai/generate-from-document`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Success:', data.success);
  if (data.success) {
    console.log('Response preview:', data.data.substring(0, 200) + '...');
  } else {
    console.log('Error:', data.message);
  }
}

main().catch(console.error);
