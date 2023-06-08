const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const port = process.env.PORT || 3000;
//2Mq6FIhWDHFlayAK
//islamtariqul652

// middleware
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://islamtariqul652:2Mq6FIhWDHFlayAK@cluster1.s9b74mm.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("LanguageDB");
    const userCollection = database.collection("user");
    const classCollection = database.collection("class");


    app.put('/regUser', async(req, res)=>{
        const regUser = req.body.email
        console.log(regUser);
        const result = await userCollection.insertOne(regUser)
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



app.get('/', (req, res)=>{
    res.send('speak free to world is running')
})

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);
})
