const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser=require('cookie-parser');
const port =process.env.PORT || 5000;
require('dotenv').config();
const jwt = require('jsonwebtoken');


//middlewsonwebtokene
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('car doctor is running!');
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pflyccd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    const servicesCollection=client.db("CarDoctor").collection("Services");
    const bookingsCollection=client.db("CarDoctor").collection("Bookings");
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
    //bookings
    app.post('/bookings',async (req,res)=>{
        const booking=req.body;
        const result=await bookingsCollection.insertOne(booking);
        res.json(result);
    });
    app.get('/bookings', async (req, res) => {
      console.log('cookies:',req.cookies);
      console.log('token:',req.cookies.token);  
      let query={};
        let cursor= bookingsCollection.find(query);
        if(req.query.email){
          query.email=req.query.email;
          cursor=bookingsCollection.find(query);
        }
        
        const bookings=await cursor.toArray();
        res.send(bookings);
    });
    app.delete('/bookings/:id',async (req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const result=await bookingsCollection.deleteOne(query);
      res.json(result);
    });
    app.patch
    ('/bookings/:id',async (req,res)=>{
      const id=req.params.id;
      const query={_id: new ObjectId(id)};
      const updatedBooking=req.body;
      console.log(updatedBooking);
      const updateDoc={
        $set:updatedBooking,
      };
      const result=await bookingsCollection.updateOne(query,updateDoc);
      res.json(result);
    });

    //auth related

    app.post('/jwt',async (req,res)=>{
      const user=req.body;
      console.log(user);
      const token=jwt.sign(user,process.env.Access_Token_Secret,{
        expiresIn:'1h'
      
      });
      res
      .cookie('token',token,{
        httpOnly:true,
        secure:process.env.NODE_ENV==='production',
        sameSite:process.env.NODE_ENV==='production'?'none':'strict',
      
      })
      .send({success:true});
    });
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
