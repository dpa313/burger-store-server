const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wubkqtt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const burgerCollection = client.db("burgerDB").collection("burger");
    const userCollection = client.db("burgerDB").collection("user")

    app.get("/burger", async (req, res) => {
      const cursor = burgerCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/burger/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await burgerCollection.findOne(query);

        if(!result){
          return res.status(404).send("Burger not found")
        }

        res.send(result);
      } catch (error) {
        console.error("error retriving burger", error);
        res.status(500).send("Internal server  not found")
      }
    });

    app.post("/burger", async (req, res) => {
      const newBurger = req.body;
      console.log(newBurger);
      const result = await burgerCollection.insertOne(newBurger);
      res.send(result);
    });

    app.put('/burger/:id', async(req,res)=>{
      const id = req.params.id
      const filter = { _id: new ObjectId(id)}
      const options = {upsert : true}
      const updateBurger = req.body
      const burger = {
        $set: {
          name: updateBurger.name,
          quantity:updateBurger.quantity,
          supplier: updateBurger.supplier,
          taste: updateBurger.taste,
          category: updateBurger.category,
          details: updateBurger.details,
          photoUrl: updateBurger.photoUrl

        }
      }
      const result = await burgerCollection.updateOne(filter,burger,options)
      res.send(result)
    })

    app.delete("/burger/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await burgerCollection.deleteOne(query);
      res.send(result);
    });

    // =================USER RELATED API==================
    app.get('/users', async(req,res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    app.post('/users', async(req,res)=>{
      const user = req.body
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    app.patch('/users', async(req,res)=>{
      const user = req.body
      const filter = {email : user.email}
      const updateDoc = {
        $set : {
          lastLoggedAt: user.lastLoggedAt
        }
      }
      const result = await userCollection.updateOne(filter,updateDoc)
      res.send(result)
    })

    app.delete('/users/:id',async(req,res)=>{
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query)
      res.send(result)
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Burger server is running now");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
