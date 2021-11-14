const express = require('express');
const mongoose = require('mongoose');

const homeStartingContent = 'Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.';
const aboutContent = 'Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.';
const contactContent = 'Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.';

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// mongoose.connect('mongodb+srv://priya_ghosh:mongodb@1234@cluster0.l75h3.mongodb.net/blogDB?retryWrites=true&w=majority', 
// { useNewUrlParser: true, useUnifiedTopology: true });

// Connecting database using async / await
const connectDB = async () => {
  try {
      await mongoose.connect( process.env.MONGODB , {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('MongoDB connected!!');
  } catch (err) {
      console.log('Failed to connect to MongoDB', err);
  }
};

connectDB();

const postSchema = mongoose.Schema({
  title: {
    type: String,
    required: [true, 'A post must have a title.']
  },
  content: {
    type: String,
    required: [true, 'A post must have content.']
  }
});
const Post = mongoose.model('Post', postSchema);

const port = process.env.PORT||3000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

app.get('/', async (req, res) => {
  let posts;
  try {
    posts = await Post.find({});
  } catch (err) {
    console.log(err);
  }
  res.render('home', { homeStartingContent, posts });
});

app.get('/about', (req, res) => {
  res.render('about', { aboutContent });
});

app.get('/contact', (req, res) => {
  res.render('contact', { contactContent });
});

app.get('/compose', (req, res) => {
  res.render('compose');
});

app.post('/compose', async (req, res) => {
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody
  });
  try {
    await post.save();
  } catch (err) {
    console.log(err);
  }
  res.redirect('/');
});

app.get('/posts/:postId', async (req, res) => {
  let post;
  try {
    post = await Post.findById(req.params.postId);
  } catch (err) {
    console.log(err);
  }

  res.render('post', { post });
});

app.get('/delete/:_id', async (req, res) => {
  try {
      const removePost = await Post.remove({
          _id: req.params._id
      });
      res.json({
          error: false,
          message: "User Deleted Successfully!",
          Response: removePost
      });
  } catch (err) {
      res.json({
          message: err
      });

  }
});

app.get('/postDashboard',(req,res) =>{

  Post.find({}, function (err, allDetails) {
    if (err) {
    console.log(err);
    } else {
    res.render("allPost", { details: allDetails })
    };
  })
});

app.post('/edit/:id', (req, res, next) => {
  
  const postId = req.params.id;
 
  console.log(req.body);
  
  const title = req.body.title;
  const content = req.body.content
  
  
  
  Post.findById(postId)
  .then((post) => {
  if (!post) {
  const error = new Error("Could not find post.");
  error.statusCode = 404;
  throw error;
  }
  
  post.title = title || post.title;
  post.content = content || post.content;
  
  return post.save();
  })
  .then((result) => {
  res
  .status(200)
  .json({ message: "Post updated!", post: result });
  })
  .catch((err) => {
  if (!err.statusCode) {
  err.statusCode = 500;
  }
  next(err);
  });
  });
