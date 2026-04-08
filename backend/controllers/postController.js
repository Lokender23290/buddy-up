const Post = require('../models/Post');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Create Broadcast Post
// @route   POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { title, category } = req.body;
    const authorId = req.user.id;

    if (!title) return next(new ErrorResponse('Broadcast payload empty', 400));

    const post = await Post.create({
      author: authorId,
      title,
      category: category || 'Other'
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Get All Active Broadcasts
// @route   GET /api/posts
exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find({ isResolved: false })
      .populate('author', 'name branch year skills')
      .sort({ createdAt: -1 });

    res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark Post as Resolved
// @route   PUT /api/posts/:id/resolve
exports.resolvePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorResponse('Post not found', 404));

    if (post.author.toString() !== req.user.id) {
      return next(new ErrorResponse('Unauthorized escalation', 403));
    }

    post.isResolved = true;
    await post.save();

    res.json({ success: true, message: 'Broadcast resolved successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Join Community Post
// @route   PUT /api/posts/:id/join
exports.joinCommunity = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorResponse('Community not found', 404));

    if (post.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already joined this community' });
    }

    if (post.author.toString() === req.user.id) {
       return res.status(400).json({ success: false, message: 'Author is already part of the community' });
    }

    post.members.push(req.user.id);
    await post.save();

    res.json({ success: true, message: 'Joined community successfully', post });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave Community Post
// @route   PUT /api/posts/:id/leave
exports.leaveCommunity = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new ErrorResponse('Community not found', 404));

    if (!post.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Not a member of this community' });
    }

    post.members = post.members.filter(member => member.toString() !== req.user.id);
    await post.save();

    res.json({ success: true, message: 'Left community successfully', post });
  } catch (error) {
    next(error);
  }
};
