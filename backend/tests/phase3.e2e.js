const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");

const PORT = 4110;
const BASE = `http://127.0.0.1:${PORT}`;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  return { res, body };
}

async function login(email, password) {
  const { res, body } = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  assert.equal(res.status, 201);
  return body.accessToken;
}

async function main() {
  const runId = Date.now();
  const env = {
    ...process.env,
    PORT: String(PORT),
    MONGODB_URI: "mongodb://localhost:27017",
    MONGO_DB: `promath_crm_phase3_e2e_${runId}`,
    JWT_SECRET: "phase3-e2e-secret",
    JWT_EXPIRES_IN: "1h",
    CORS_ORIGINS: "http://127.0.0.1:5173",
    ADMIN_EMAIL: "phase3-admin@example.com",
    ADMIN_PASSWORD: "Phase3AdminPass123!",
    ADMIN_NAME: "Phase 3 Admin",
  };

  const child = spawn("node", ["dist/main.js"], {
    cwd: __dirname + "/..",
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    stdout += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
  });

  try {
    let ready = false;
    for (let i = 0; i < 40; i += 1) {
      await wait(500);
      try {
        const { res } = await request("/auth/me");
        if (res.status === 401) {
          ready = true;
          break;
        }
      } catch {}
    }
    assert.equal(ready, true, `server did not become ready\nSTDOUT:\n${stdout}\nSTDERR:\n${stderr}`);

    const invalidLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "not-an-email", password: "" }),
    });
    assert.equal(invalidLogin.res.status, 400);
    assert.equal(invalidLogin.body.statusCode, 400);

    const wrongLogin = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "phase3-admin@example.com", password: "wrong-password" }),
    });
    assert.equal(wrongLogin.res.status, 401);

    const unknownReset = await request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email: "unknown-user@example.com" }),
    });
    assert.equal(unknownReset.res.status, 201);
    assert.match(unknownReset.body.message, /reset link/i);

    const invalidReset = await request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        token: "x".repeat(64),
        password: "NewPassword123!",
      }),
    });
    assert.equal(invalidReset.res.status, 400);
    assert.match(invalidReset.body.message, /invalid or has expired/i);

    const adminToken = await login("phase3-admin@example.com", "Phase3AdminPass123!");
    const admin = { Authorization: `Bearer ${adminToken}` };
    const currentAdmin = await request("/auth/me", { headers: admin });
    assert.equal(currentAdmin.res.status, 200);
    assert.equal(currentAdmin.body.role, "admin");

    const cors = await fetch(BASE + "/api/health", {
      method: "OPTIONS",
      headers: {
        Origin: "http://127.0.0.1:5173",
        "Access-Control-Request-Method": "GET",
      },
    });
    assert.equal(cors.headers.get("access-control-allow-origin"), "http://127.0.0.1:5173");

    const unauth = await request("/colleges");
    assert.equal(unauth.res.status, 401);

    const contentUser = await request("/users", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({
        name: "Phase 3 Content",
        email: "phase3-content@example.com",
        password: "ContentPass123!",
        role: "content",
      }),
    });
    assert.equal(contentUser.res.status, 201);
    assert.equal(contentUser.body.role, "content");
    const contentToken = await login("phase3-content@example.com", "ContentPass123!");
    const content = { Authorization: `Bearer ${contentToken}` };
    const forbiddenUsers = await request("/users", { headers: content });
    assert.equal(forbiddenUsers.res.status, 403);

    const invalidCollege = await request("/colleges", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({ location: "Missing name" }),
    });
    assert.equal(invalidCollege.res.status, 400);

    const collegeCreate = await request("/colleges", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({
        name: "Phase 3 Test College",
        email: "phase3-college@example.com",
        phone: "9999999999",
        location: "Chennai",
      }),
    });
    assert.equal(collegeCreate.res.status, 201);
    const collegeId = collegeCreate.body._id;
    assert.equal(collegeCreate.body.version, 1);

    const collegeRead = await request(`/colleges/${collegeId}`, { headers: content });
    assert.equal(collegeRead.res.status, 200);

    const collegeUpdate = await request(`/colleges/${collegeId}`, {
      method: "PATCH",
      headers: admin,
      body: JSON.stringify({ version: 1, notes: "Phase 3 updated" }),
    });
    assert.equal(collegeUpdate.res.status, 200, JSON.stringify(collegeUpdate.body));
    assert.equal(collegeUpdate.body.notes, "Phase 3 updated");
    assert.equal(collegeUpdate.body.version, 2);

    const stageForbidden = await request(`/colleges/${collegeId}/stages`, {
      method: "POST",
      headers: content,
      body: JSON.stringify({ stageName: "implementation", stageIndex: 1, status: "completed" }),
    });
    assert.equal(stageForbidden.res.status, 403);

    const stageCreate = await request(`/colleges/${collegeId}/stages`, {
      method: "POST",
      headers: admin,
      body: JSON.stringify({ stageName: "implementation", stageIndex: 1, status: "completed" }),
    });
    assert.equal(stageCreate.res.status, 201);
    const stageUpdate = await request(`/colleges/${collegeId}/stages/${stageCreate.body._id}`, {
      method: "PATCH",
      headers: admin,
      body: JSON.stringify({ remarks: "Phase 3 stage updated" }),
    });
    assert.equal(stageUpdate.res.status, 200);
    assert.equal(stageUpdate.body.remarks, "Phase 3 stage updated");

    const staleUpdate = await request(`/colleges/${collegeId}`, {
      method: "PATCH",
      headers: admin,
      body: JSON.stringify({ version: 1, notes: "stale" }),
    });
    assert.equal(staleUpdate.res.status, 409);

    const billingCreate = await request("/billing/proposals", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({
        collegeId,
        proposalNumber: "P3-001",
        proposalTitle: "Phase 3 Proposal",
        amount: 1000,
        discount: 100,
      }),
    });
    assert.equal(billingCreate.res.status, 201);
    const billingId = billingCreate.body._id;
    const billingPatch = await request(`/billing/proposals/${billingId}`, {
      method: "PATCH",
      headers: admin,
      body: JSON.stringify({ status: "sent" }),
    });
    assert.equal(billingPatch.res.status, 200, `${JSON.stringify(billingPatch.body)}\n${stderr}`);
    const billingForbidden = await request("/billing/proposals", { headers: content });
    assert.equal(billingForbidden.res.status, 403);

    const notificationCreate = await request("/notifications", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({ title: "Phase 3", message: "Ready", targetRole: "content" }),
    });
    assert.equal(notificationCreate.res.status, 201);
    const notificationId = notificationCreate.body._id;
    const notificationRead = await request(`/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: content,
    });
    assert.equal(notificationRead.res.status, 200);
    const notificationDelete = await request(`/notifications/${notificationId}`, {
      method: "DELETE",
      headers: admin,
    });
    assert.equal(notificationDelete.res.status, 200);

    const excelImport = await request("/imports/excel", {
      method: "POST",
      headers: admin,
      body: JSON.stringify({
        fileName: "phase3-test.xlsx",
        rows: [{ name: "Imported College" }],
      }),
    });
    assert.equal(excelImport.res.status, 201);
    const importList = await request("/imports", { headers: admin });
    assert.equal(importList.res.status, 200);
    assert.ok(importList.body.some((item) => item.fileName === "phase3-test.xlsx"));
    const importForbidden = await request("/imports", { headers: content });
    assert.equal(importForbidden.res.status, 403);

    const legacyCrmWrite = await request("/api/storage/promath_crm_v13", {
      method: "PUT",
      headers: admin,
      body: JSON.stringify({
        value: JSON.stringify({
          colleges: [
            {
              id: "legacy-college",
              name: "Legacy Phase 3 College",
              email: "legacy-phase3@example.com",
              phone: "8888888888",
              stages: {
                initial_meeting: { status: "completed", completed_at: new Date().toISOString(), data: {} },
              },
            },
          ],
          notifications: [{ role: "admin", message: "Legacy note", read: false }],
        }),
      }),
    });
    assert.equal(legacyCrmWrite.res.headers.get("deprecation"), "true");
    await request("/api/storage/promath_billing_v2", {
      method: "PUT",
      headers: admin,
      body: JSON.stringify({
        value: JSON.stringify({
          proposals: [{ id: "LEG-P3-001", college_id: "legacy-college", college_name: "Legacy Phase 3 College", total_value: 500 }],
        }),
      }),
    });
    const migration = await request("/imports/migrate-storage", { method: "POST", headers: admin });
    assert.equal(migration.res.status, 201);
    assert.ok(migration.body.collegesCreated >= 1);
    assert.ok(migration.body.stagesCreated >= 1);
    assert.ok(migration.body.billingProposalsCreated >= 1);
    assert.ok(migration.body.notificationsCreated >= 1);

    const billingDelete = await request(`/billing/proposals/${billingId}`, { method: "DELETE", headers: admin });
    assert.equal(billingDelete.res.status, 200);
    const collegeDeleteForbidden = await request(`/colleges/${collegeId}`, { method: "DELETE", headers: content });
    assert.equal(collegeDeleteForbidden.res.status, 403);
    const collegeDelete = await request(`/colleges/${collegeId}`, { method: "DELETE", headers: admin });
    assert.equal(collegeDelete.res.status, 200);

    console.log("phase3 e2e passed");
  } finally {
    child.kill("SIGTERM");
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
