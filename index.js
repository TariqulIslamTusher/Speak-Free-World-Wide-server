const express = require('express')
const app = express()
const cors = require('cors')
const port = process.env.PORT || 3000;
const morgan = require('morgan')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

// middleware
const corsConfig = {
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}
// app.use(cors())
app.use(cors(corsConfig))
// PushSubscriptionOptions("", cors(corsConfig))
app.use(express.json())


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

    // user database and collection is here
    const database = client.db("DetailsDB");
    const classCollection = database.collection("class");
    const userCollection = database.collection("user");
    const bookingCollection = database.collection("myBookings")

    // =================GET METHODE============================

    // get all the data from classCollection & sort data of popular class by query searching
    // query email & query search implemented here 
    // app.get('/class', async (req, res) => {
    //   var query = {}


    //   if (req.query.email) {
    //     query = req.query
    //     // console.log(query);
    //     const result = await classCollection.find().sort({ classView: -1 }).toArray()
    //     res.send(result)
    //   } else {
    //     const result = await classCollection.find().toArray()
    //     res.send(result)
    //   }
    // })

    // this get is implemented only to sort the instructors
    // get the data to sort the popular instructions
    app.get('/class/:id', async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await classCollection.findOne(query)
      res.send(result)
    })

    app.get('/class', async (req, res) => {
      let options = {}
      let query = {}

      const filter = req.query
      const sort = req.query.sort

      if (req.query) {
        query = req.query
      }

      if (req.query && req.query.email) {
        query = { instructorEmail: req.query.email }
      }


      if (req.query && req.query.classStatus === 'approved') {
        query = { classStatus: req.query.classStatus }
      }

      if (sort && sort === 'attendedStudent') {
        options = {
          sort: { "attendedStudent": -1 }
        }
      }
      if (filter && sort === 'classView') {
        options = {
          sort: { 'classView': -1 }
        }
        // const result = await classCollection.find().sort({ classView: -1 }).toArray()
        // return res.send(result)
      }


      const result = await classCollection.find(query, options).toArray()
      res.send(result)
    })

    // get the data to see all user in tabular form
    app.get('/users', async (req, res) => {
      let query = {}
      if (req.query) {
        query = req.query
      }
      console.log(query, 'tabular user')
      const result = await userCollection.find(query).toArray()
      res.send(result)
    })


    // get THE MY BOOKED DATA BY GET METHODE 
    app.get('/booking', async(req, res) =>{
      let query = {}
      const email = req.query.email 
      if(email){
        query= {userEmail: email}
      }
      result = await bookingCollection.find(query).toArray()
      res.send(result)

    })










    // =================POST METHODE  ============================

    // set the add new data by instructor to db 
    app.post('/class', async (req, res) => {
      const doc = req.body
      console.log(doc, 'set new data')
      const result = await classCollection.insertOne(doc);
      res.send(result)
    })


    // set the booked data from the card sectionssss 
    app.post('/booking', async (req, res) => {
      // const query = {_id : new ObjectId(id)}
      const doc = req.body
      console.log(doc)
      const result = await bookingCollection.insertOne(doc);
      res.send(result)
    })








    // =================PUT METHODE / UPDATE METHODE ============================
    //  set the email and role by put methods in the userCollection
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      let user = req.body
      if (email === 'islamtariqul652@gmail.com' || email === 'islamtariqul@gmail.com') {
        user.role = "admin"
      }
      const query = { email: email }
      const option = { upsert: true }
      console.log(user, 'user to database');
      const updateDoc = {
        $set: user
      }
      const result = await userCollection.updateOne(query, updateDoc, option)
      res.send(result)
    })



    // =================PATCH METHODE============================
    // change the user role from user to admin or instructor 
    app.patch('/users/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const user = req.body
      console.log(user, 'approved deny');
      const option = { upsert: true }
      const updateDoc = {
        $set: user
      }

      const result = await userCollection.updateOne(filter, updateDoc, option)
      res.send(result)
    })


    // change the class status of approve or deny
    app.patch('/class/:id', async (req, res) => {
      const id = req.params.id
      const filter = { _id: new ObjectId(id) }
      const classData = req.body
      console.log(classData, 'update data.............');
      const options = { upsert: true }
      const updateDoc = {
        $set: classData
      }
      const result = await classCollection.updateOne(filter, updateDoc, options)
      res.send(result)
    })




    // ==================DELETE METHODES==============
    app.delete('/class/:id', async(req,res)=>{
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await classCollection.deleteOne(query)
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
