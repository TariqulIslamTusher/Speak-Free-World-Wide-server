const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000;
const morgan = require('morgan')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
app.use(cors())
app.use(express.json())
app.use(morgan('dev'))



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.setnbur.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const database = client.db("DetailsDB");
    const classCollection = database.collection("class");
    const userCollection = database.collection("user");


    // get all the data from classCollection & sort data of popular class by query searching
    app.get('/class', async (req, res) => {
      var query = {}
      if (req.query.email) {
        query = req.query
        // console.log(query);
        const result = await classCollection.find().sort({ classView: -1 }).toArray()
        res.send(result)
      } else if (req.query) {
        query = req.query
        console.log(query);
        const result = await classCollection.find(query).toArray()
        res.send(result)
      } else {
        const result = await classCollection.find().toArray()
        res.send(result)
      }
    })

    // get the data to sort the popular instructions
    app.get('/instructor', async (req, res) => {
      const result = await classCollection.find().sort({ attendedStudent: -1 }).toArray()
      res.send(result)

    })

    //  set the email and role by put methods in the userCollection
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      let user = req.body
      if (email === 'islamtariqul652@gmail.com' || email === 'islamtariqul@gmail.com') {
        user.role = "admin"
      }
      const query = { email: email }
      const option = { upsert: true }
      console.log(user);
      const updateDoc = {
        $set: user
      }
      const result = await userCollection.updateOne(query, updateDoc, option)
      res.send(result)
    })

    // get the data by single email to show on database matching the user email
    app.get('/users', async (req, res) => {
      let query = {}
      if (req.query) {
        query = req.query
      }
      console.log(query)
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })

    // change the user role from user to admin or instructor 
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const user = req.body
      const option = { upsert: true }
      const updateDoc = {
        $set: user
      }
      console.log(filter, user);
      const result = await userCollection.updateOne(filter, updateDoc, option)
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('speak free to world is running')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
})
