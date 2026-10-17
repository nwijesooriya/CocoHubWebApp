/* Isolated API fixture: real Express routes, Mongoose validation and bcrypt;
 * in-memory persistence so verification never changes the project's MongoDB.
 */
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { User } = require("../models/user");
const Feedback = require("../models/feedback");

function query(value) {
  const promise = Promise.resolve(value);
  promise.select = () => {
    const sanitize = (doc) => {
      if (!doc) return doc;
      const { password, ...safe } = doc.toObject();
      return safe;
    };
    return Promise.resolve(
      Array.isArray(value) ? value.map(sanitize) : sanitize(value),
    );
  };
  return promise;
}

function createFixture() {
  process.env.JWTPRIVATEKEY = "isolated-cocohub-verification-key";
  delete process.env.EMAIL_USER;
  delete process.env.EMAIL_PASS;
  const users = new Map();
  const feedbacks = new Map();
  User.prototype.save = async function () {
    await this.validate();
    users.set(String(this._id), this);
    return this;
  };
  User.find = () => query([...users.values()]);
  User.findOne = async (filter) =>
    [...users.values()].find((u) => u.email === filter.email) || null;
  User.findById = (id) => query(users.get(String(id)) || null);
  User.findByIdAndUpdate = async (id, update) => {
    const user = users.get(String(id));
    if (!user) return null;
    user.set(update);
    await user.validate();
    return user;
  };
  User.findByIdAndDelete = async (id) => {
    const entry = users.get(String(id));
    users.delete(String(id));
    return entry;
  };
  Feedback.prototype.save = async function () {
    await this.validate();
    feedbacks.set(String(this._id), this);
    return this;
  };
  Feedback.find = async () => [...feedbacks.values()];
  Feedback.findById = async (id) => feedbacks.get(String(id)) || null;
  Feedback.findByIdAndUpdate = async (id, update) => {
    const entry = feedbacks.get(String(id));
    if (!entry) return null;
    const candidate = new Feedback({ ...entry.toObject(), ...update });
    await candidate.validate();
    feedbacks.set(String(id), candidate);
    return candidate;
  };
  Feedback.findByIdAndDelete = async (id) => {
    const entry = feedbacks.get(String(id));
    feedbacks.delete(String(id));
    return entry;
  };

  const app = express();
  app.use(cors({ origin: "http://localhost:3000", credentials: true }));
  app.use(express.json());
  app.use("/user", require("../routes/users"));
  app.use("/api/auth", require("../routes/auth"));
  app.use("/feedback", require("../routes/feedbacks"));
  return { app, users, feedbacks, User, Feedback, mongoose };
}

module.exports = { createFixture };
