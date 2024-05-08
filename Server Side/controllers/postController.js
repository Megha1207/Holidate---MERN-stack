import Post from '../models/postModel.js';
import multer from 'multer';

// Multer configuration for storing files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export const newPost = async (req, res) => {
  try {
    const { userId, location, activity, caption, userPicturePath } = req.body;

    // Handle file upload
    upload.single('picture')(req, res, async (err) => {
      if (err instanceof multer.MulterError) {
        console.error('Multer error:', err);
        return res.status(400).json({ error: 'File upload error' });
      } else if (err) {
        console.error('Unknown error:', err);
        return res.status(500).json({ error: 'Server error' });
      }

      // Access the uploaded file from req.file
      const compressedImageBuffer = req.file.buffer;
      const pictureBase64 = `data:${req.file.mimetype};base64,${compressedImageBuffer.toString('base64')}`;
      const pictureData = pictureBase64.split(',')[1];

      // Create a new post instance
      const post = new Post({ userId, location, activity, caption, picture: { data: pictureData, contentType: req.file.mimetype }, userPicturePath });

      // Save the post to the database
      await post.save();

      // Return the newly created post
      res.status(200).json(post);
    });
  } catch (error) {
    //console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};


export const seePost = async (req, res) => {
  try {
    const ID = req.params.id;
    console.log(ID);
    const post = await Post.findOne({ _id: ID });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.json({ error });
  }
}

export const updatePost = async (req, res) => {
  try {
    const ID = req.params.id; // Get the post ID from request parameters
    console.log(ID);

    // Find the post by ID
    const post = await Post.findOne({ _id: ID });

    // Check if post exists
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Update the post fields
    post.caption = req.body.caption || post.caption;
    post.activity = req.body.activity || post.activity;
    post.location = req.body.location || post.location;

    // Save the updated post
    const updatedPost = await post.save();

    // Return the updated post
    res.json(updatedPost);
  } catch (error) {
    // Handle errors
    res.json({ error });
  }
}

export const deletePost = async (req, res) => {
  try {
    const ID = req.params.id; // Get the post ID from request parameters

    // Find the post by ID
    const post = await Post.findOneAndDelete({ _id: ID });

    // Return success message
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    // Handle errors
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

export const getUserPosts = async(req,res) => {
  try {
    const ID = req.params.id;
    const post = await Post.find({ userId: ID });
    console.log(post);
    if (post.length > 0) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "No posts found for the user." });
    }
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const dashboard = async(req, res) => {
  try {
    console.log('yes it works')
    const posts = await Post.find().sort({ createdAt: -1 });
    if (posts.length > 0) {
      res.status(200).json(posts);
    } else {
      res.status(404).json({ message: "No posts found." });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export const likePost = async(req,res) => {
  try {
    const id = req.params.id;
    const userId = req.body.uid;
    console.log(req)
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
}

export const addComment = async(req,res) => {
  const { id } = req.params;
  const { userId, comment } = req.body;

  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    post.comments.push({ userId, comment });
    await post.save();

    res.status(201).json({ message: "Comment added successfully", post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error" });
  }
}