const router = require("express").Router();
const Feedback = require("../models/feedback");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");

const normalizeEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";
const escapeHtml = (value) =>
  String(value || "").replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );

router.post("/add", async (req, res) => {
  try {
    const { customerName, email, comment, productItem, rating } = req.body;
    const entry = new Feedback({
      customerName: customerName?.trim(),
      email: email?.trim(),
      comment: comment?.trim(),
      productItem,
      rating,
      date: req.body.date ? new Date(req.body.date) : new Date(),
    });
    await entry.save();

    // Email delivery is optional; a delivery failure must not undo a saved review.
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      transporter.sendMail(
        {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "Thank you for your CocoHub feedback!",
          html: `<h2>Hi ${escapeHtml(customerName)},</h2><p>Thank you for sharing your feedback about <b>${escapeHtml(productItem)}</b>.</p><p>Your opinion helps CocoHub grow better.</p><p>Best wishes,<br/>CocoHub Team</p>`,
        },
        (error) => {
          if (error)
            console.error(
              "Feedback saved; thank-you email could not be delivered.",
            );
        },
      );
    }
    res.json("Feedback Added");
  } catch (error) {
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({
        error:
          error.name === "ValidationError"
            ? "Please provide a name, email, comment, product, and rating between 1 and 5."
            : "Failed to add feedback",
      });
  }
});

router.get("/", async (req, res) => {
  try {
    // Keep stored dates as ISO timestamps so the browser can format them reliably.
    res.json(await Feedback.find());
  } catch (error) {
    res
      .status(500)
      .json({ error: "Unable to load feedback. Please try again." });
  }
});

// Preserve email confirmation and enforce it on the server for both mutations.
async function verifyOwner(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid feedback ID." });
  const email = normalizeEmail(req.body?.email);
  if (!email)
    return res
      .status(403)
      .json({
        message: "Enter the original email address to confirm this action.",
      });
  try {
    const entry = await Feedback.findById(req.params.id);
    if (!entry) return res.status(404).json({ message: "Feedback not found." });
    if (normalizeEmail(entry.email) !== email)
      return res
        .status(403)
        .json({ message: "Email does not match this feedback." });
    req.feedbackEntry = entry;
    next();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to verify feedback. Please try again." });
  }
}

router.put("/update/:id", verifyOwner, async (req, res) => {
  try {
    const { customerName, comment, productItem, rating } = req.body;
    const update = { updatedAt: new Date() };
    // Partial edits retain the original name, product, and ownership email.
    if (customerName !== undefined) update.customerName = customerName.trim();
    if (comment !== undefined) update.comment = comment.trim();
    if (productItem !== undefined) update.productItem = productItem;
    if (rating !== undefined) update.rating = rating;
    const updated = await Feedback.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Feedback not found." });
    res.status(200).json({ status: "User Updated" });
  } catch (error) {
    res
      .status(error.name === "ValidationError" ? 400 : 500)
      .json({
        message:
          error.name === "ValidationError"
            ? "Provide a comment and a rating between 1 and 5."
            : "Error updating feedback.",
      });
  }
});

router.delete("/delete/:id", verifyOwner, async (req, res) => {
  try {
    const deleted = await Feedback.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Feedback not found." });
    res.status(200).json({ status: "user deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting feedback." });
  }
});

router.get("/get/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id))
    return res.status(400).json({ message: "Invalid feedback ID." });
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback)
      return res.status(404).json({ message: "Feedback not found." });
    res.status(200).json({ status: "User Fetched", feedback });
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback." });
  }
});

module.exports = router;
