const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

const corsConfig = {
  origin: "*",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
};
app.use(cors(corsConfig));
// const corsOptions = {
//   origin: "*",
//   credentials: true,
//   optionSuccessStatus: 200,
// };

// app.use(cors(corsOptions));
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pq4nrld.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   },
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   maxPoolSize: 10,
// });
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // client.connect((err) => {
    //   if (err) {
    //     console.error(err);
    //     return;
    //   }
    // });
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const toysCollection = client.db("toyCarLand").collection("toyList");
    app.get("/", (req, res) => {
      res.send("Toys server is running ...");
    });
    app.get("/allToys", async (req, res) => {
      try {
        let query = {};
        if (req.query?.email) {
          query = { email: req.query.email };
        }
        const result = await toysCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.get("/allToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.findOne(query);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.put("/allToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const toy = req.body;
        const query = { _id: new ObjectId(id) };
        const options = { upsert: true };
        const updatedToy = {
          $set: {
            name: toy.name,
            seller: toy.seller,
            email: toy.email,
            price: toy.price,
            category: toy.category,
            rating: toy.rating,
            photo: toy.photo,
            quantity: toy.quantity,
            description: toy.description,
          },
        };
        const result = await toysCollection.updateOne(
          query,
          updatedToy,
          options
        );
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });

    app.post("/addToys", async (req, res) => {
      try {
        const toys = req.body;
        const result = await toysCollection.insertOne(toys);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
    app.delete("/allToys/:id", async (req, res) => {
      try {
        const id = req.params.id;
        // console.log(id);
        const query = { _id: new ObjectId(id) };
        const result = await toysCollection.deleteOne(query);
        res.send(result);
      } catch (error) {
        res.send(error);
      }
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}

run()
  .app.listen(port, () => {
    console.log(`Toy server is running on port: ${port}`);
  })
  .catch(console.dir);
