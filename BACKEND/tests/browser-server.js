const { createFixture } = require("./fixture");
const { app, Feedback } = createFixture();

(async () => {
  for (const review of [
    {
      customerName: "Amali Perera",
      email: "amali@example.test",
      comment: "A lovely addition to my kitchen.",
      productItem: "Coconut Oil",
      rating: 5,
    },
    {
      customerName: "Nimal Silva",
      email: "nimal@example.test",
      comment: "A practical product. I would like more size options.",
      productItem: "Fiber rope",
      rating: 4,
    },
  ])
    await new Feedback(review).save();
  app.listen(8011, "127.0.0.1", () =>
    console.log("Isolated browser API ready on 8011; no MongoDB connection."),
  );
})();
