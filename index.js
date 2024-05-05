const express = require('express');
const cors = require('cors');
const app = express();
const port =process.env.PORT || 5000;
require('dotenv').config();
//middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('car doctor is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
//CarDoctor
//aSFTxz4c7AG6FRXd

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pflyccd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const servicesCollection=client.db("CarDoctor").collection("Services");
    app.get('/services', async (req, res) => {
        const cursor= servicesCollection.find();
        const services=await cursor.toArray();
        res.send(services);
    });
    app.get('/services/:id',async (req,res)=>{
        const id=req.params.id;
        const query={_id: new ObjectId(id)};
        const options={
            projection:{title:1,img:1,price:1,service_id:1}
        };
        
        const service=await servicesCollection.findOne(query,options);
        res.send(service);

    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);