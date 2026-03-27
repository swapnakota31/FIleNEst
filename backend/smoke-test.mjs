const email = `smoke_${Date.now()}@example.com`;
const base = 'http://localhost:5000/api/auth';

async function run() {
  const signupRes = await fetch(`${base}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Smoke Test', email, password: 'test123' })
  });

  const signupBody = await signupRes.text();

  const loginRes = await fetch(`${base}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'test123' })
  });

  const loginBody = await loginRes.text();

  console.log(`EMAIL=${email}`);
  console.log(`SIGNUP_STATUS=${signupRes.status}`);
  console.log(signupBody);
  console.log(`LOGIN_STATUS=${loginRes.status}`);
  console.log(loginBody);
}

run().catch((error) => {
  console.error('SMOKE_TEST_ERROR=' + error.message);
  process.exit(1);
});
