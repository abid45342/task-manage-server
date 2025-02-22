const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const port = 5000;



// middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://Lostify:PfBEUlDBuZqgaU6V@cluster0.uxfsb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";








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

    const TodoCollection = client.db('Todo').collection('TodoCollection'); 

    app.get('/tasks', async (req, res) => {
        const result = await TodoCollection.find().toArray();
        res.send(result);
    })
    
    app.patch('/tasks/reorder', async (req, res) => {
        const { taskId, newOrder } = req.body;
      
        // Find the task that needs to be reordered
        const task = await TodoCollection.findOne({ _id: new ObjectId(taskId) });
      
        if (!task) {
          return res.status(404).send({ message: "Task not found" });
        }
      
        const oldOrder = task.order;
        const category = task.category;
      
        // If the new order is different, we need to shift tasks in the category
        if (oldOrder !== newOrder) {
          if (oldOrder < newOrder) {
            // Moving down, shift the tasks with order greater than oldOrder d
            await TodoCollection.updateMany(
              { category, order: { $gt: oldOrder, $lte: newOrder } },
              { $inc: { order: -1 } }
            );
          } else {
            // Moving up, shift the tasks with order less than oldOrder
            await TodoCollection.updateMany(
              { category, order: { $lt: oldOrder, $gte: newOrder } },
              { $inc: { order: 1 } }
            );
          }
      
          // Update the order of the task itself
          await TodoCollection.updateOne(
            { _id: new ObjectId(taskId) },
            { $set: { order: newOrder } }
          );
        }
      
        res.send({ message: "Task reordered successfully!" });
      });
      
      

      app.delete('/tasks/:id', async (req, res) => {
        const { id } = req.params;
        const result = await TodoCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      });


      app.post('/tasks', async (req, res) => {
        const { title, description, category } = req.body;
      
        // Input validation
        if (!title || title.length > 50) {
          return res.status(400).send('Title is required and should not exceed 50 characters');
        }
        if (description && description.length > 200) {
          return res.status(400).send('Description should not exceed 200 characters');
        }
      
        // Get the highest order value in the given category
        const maxOrderTask = await TodoCollection.find({ category }).sort({ order: -1 }).limit(1);
        const newOrder = maxOrderTask.length > 0 ? maxOrderTask[0].order + 1 : 0;
      
        const newTask = {
          title: title,
          description: description || '',
          category: category || 'To-Do',
          order: newOrder,
          timestamp: new Date(),
        };
      
        const result = await TodoCollection.insertOne(newTask);
        res.status(201).send(result);
      });
      
      
  







    // await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);











app.get('/',(req,res)=>{
    res.send('Hello World');
})
app.listen(port,()=>{
    console.log(`Example app listening at ${port}`);
})
























