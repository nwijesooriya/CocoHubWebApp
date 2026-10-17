const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createFixture } = require("./fixture");

test("registration, login, profile and feedback lifecycle preserve API contracts", async (t) => {
  const { app, users } = createFixture();
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const base = `http://127.0.0.1:${server.address().port}`;
  async function request(path, method = "GET", body) {
    const response = await fetch(base + path, {
      method,
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
    return { status: response.status, body: await response.json() };
  }
  const account = {
    name: "Test Customer",
    email: "customer@example.com",
    password: "Coconut123",
    mobile: "0771234567",
    dob: "2000-01-01",
    gender: "Other",
    expectedRole: "Customer",
  };
  const registration = await request("/user/add", "POST", account);
  assert.equal(registration.status, 200);
  const userId = registration.body.data;
  assert.ok(userId);
  assert.notEqual(users.get(userId).password, account.password);
  assert.equal(
    (await request("/user/add", "POST", account)).status,
    400,
    "duplicate registration is rejected",
  );
  assert.equal(
    (
      await request("/api/auth", "POST", {
        email: account.email,
        password: "wrong",
      })
    ).status,
    401,
  );
  const login = await request("/api/auth", "POST", {
    email: account.email,
    password: account.password,
  });
  assert.equal(login.status, 200);
  assert.ok(login.body.data.token);
  assert.equal(login.body.data.userId, userId);
  const profile = await request(`/user/get/${userId}`);
  assert.equal(profile.body.name, account.name);
  assert.equal(
    profile.body.password,
    undefined,
    "profile never returns a password hash",
  );
  assert.equal((await request("/user/")).body[0].password, undefined);
  assert.equal(
    (
      await request(`/user/update/${userId}`, "PUT", {
        field: "name",
        value: "Updated Customer",
      })
    ).status,
    200,
  );
  assert.equal(
    (await request(`/user/get/${userId}`)).body.name,
    "Updated Customer",
  );

  const photo = new FormData();
  photo.append("userId", userId);
  photo.append(
    "profileImage",
    new Blob(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a7WQAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      { type: "image/png" },
    ),
    "verification.png",
  );
  const upload = await fetch(base + "/user/upload-image", {
    method: "POST",
    body: photo,
  });
  assert.equal(upload.status, 200);
  const uploaded = await upload.json();
  assert.ok(uploaded.imageUrl.startsWith("/uploads/"));
  const fs = require("fs");
  const path = require("path");
  const uploadedPath = path.join(__dirname, "..", uploaded.imageUrl);
  t.after(() => {
    if (fs.existsSync(uploadedPath)) fs.unlinkSync(uploadedPath);
  });
  assert.ok(fs.existsSync(uploadedPath));
  assert.equal(
    (await request(`/user/get/${userId}`)).body.profileImage,
    uploaded.imageUrl,
  );

  const review = {
    customerName: "Updated Customer",
    email: account.email,
    comment: "A useful coconut product.",
    productItem: "Coconut Oil",
    rating: 4,
  };
  assert.equal((await request("/feedback/add", "POST", review)).status, 200);
  let list = await request("/feedback/");
  assert.equal(list.body.length, 1);
  const id = list.body[0]._id;
  assert.ok(!Number.isNaN(Date.parse(list.body[0].date)), "date is parseable");
  assert.equal(
    (await request(`/feedback/get/${id}`)).body.feedback.comment,
    review.comment,
  );
  for (const email of ["wrong@example.com", undefined]) {
    assert.equal(
      (
        await request(`/feedback/update/${id}`, "PUT", {
          email,
          comment: "Unauthorized",
          rating: 1,
        })
      ).status,
      403,
    );
    assert.equal(
      (await request(`/feedback/delete/${id}`, "DELETE", { email })).status,
      403,
    );
  }
  assert.equal((await request("/feedback/")).body[0].comment, review.comment);
  assert.equal(
    (
      await request(`/feedback/update/${id}`, "PUT", {
        email: account.email,
        comment: "Updated review",
        rating: 5,
      })
    ).status,
    200,
  );
  list = await request("/feedback/");
  assert.equal(list.body[0].comment, "Updated review");
  assert.equal(list.body[0].rating, 5);
  assert.equal(list.body[0].customerName, review.customerName);
  assert.equal(list.body[0].productItem, review.productItem);
  assert.equal(list.body[0].email, review.email);
  assert.ok(list.body[0].updatedAt);
  assert.equal(
    (
      await request(`/feedback/update/${id}`, "PUT", {
        email: account.email,
        comment: " ",
        rating: 0,
      })
    ).status,
    400,
  );
  assert.equal((await request("/feedback/")).body[0].comment, "Updated review");
  assert.equal(
    (
      await request(`/feedback/delete/${id}`, "DELETE", {
        email: " CUSTOMER@EXAMPLE.COM ",
      })
    ).status,
    200,
  );
  assert.equal((await request("/feedback/")).body.length, 0);
  assert.equal(
    (
      await request(`/feedback/delete/${id}`, "DELETE", {
        email: account.email,
      })
    ).status,
    404,
  );
  assert.equal(
    (
      await request("/feedback/update/not-an-id", "PUT", {
        email: account.email,
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("/feedback/add", "POST", { ...review, rating: 8 })).status,
    400,
  );
  assert.equal(
    (
      await request("/user/reset-password", "PUT", {
        email: account.email,
        currentPassword: "wrong",
        newPassword: "Replacement123",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/user/reset-password", "PUT", {
        email: account.email,
        currentPassword: account.password,
        newPassword: "Replacement123",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/api/auth", "POST", {
        email: account.email,
        password: "Replacement123",
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/user/forgot-password", "PUT", {
        email: account.email,
        newPassword: account.password,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/api/auth", "POST", {
        email: account.email,
        password: account.password,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request(`/user/delete/${userId}`, "DELETE", {
        currentPassword: "wrong",
        requesterId: userId,
      })
    ).status,
    401,
  );
  assert.equal(
    (
      await request(`/user/delete/${userId}`, "DELETE", {
        currentPassword: account.password,
        requesterId: userId,
      })
    ).status,
    200,
  );
  assert.equal((await request(`/user/get/${userId}`)).status, 404);
});

test("a feedback database failure produces an HTTP error instead of hanging", async (t) => {
  const { app, Feedback } = createFixture();
  Feedback.find = async () => {
    throw new Error("Simulated storage failure");
  };
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/feedback/`,
  );
  assert.equal(response.status, 500);
  assert.ok((await response.json()).error);
});
