const CommunityPost = require('../models/CommunityPost');

// Initial seed posts if database collection is empty
const seedPosts = [
  {
    authorName: 'Alex Chen',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=alexchen',
    title: 'Help understanding the Chain Rule application in multi-variable functions?',
    body: "I'm struggling with assignment 4. When applying the chain rule to f(x,y) where both x and y are functions of t, I keep messing up the partial derivatives. Does anyone have a good mental model or visual?",
    course: 'Advanced Calculus',
    tags: ['Calculus', 'Math 301', 'Help Needed'],
    votes: 42,
    needsTeacherInput: true,
    replies: [
      {
        authorName: 'Sarah Jenkins',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?u=sarahj',
        text: 'Try drawing a tree diagram! Put f at the top, branch to x and y, and then branch both of those down to t. Multiply along branches and add them together!',
        createdAt: new Date(Date.now() - 3600000)
      }
    ]
  },
  {
    authorName: 'Dr. Sarah Jenkins',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?u=drjenkins',
    title: 'Clarification on Thermodynamics Midterm Study Outline',
    body: 'Hello class! Please note that entropy calculations for non-ideal gases will NOT be tested in detail. Focus on ideal gas cycles and Carnot efficiency equations.',
    course: 'Physics 202',
    tags: ['Physics', 'Exam Prep', 'Instructor Announcement'],
    votes: 28,
    needsTeacherInput: false,
    replies: []
  },
  {
    authorName: 'Student ID #892',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=student892',
    title: "Clarification needed on Maxwell's Equations in non-vacuum media",
    body: "I'm struggling to understand how the permittivity and permeability constants change when we move from a vacuum to a dielectric material like glass.",
    course: 'Physics 202',
    tags: ['Electromagnetism', 'Physics 202'],
    votes: 14,
    needsTeacherInput: true,
    replies: []
  }
];

// @desc    Get all community posts
// @route   GET /api/community
const getPosts = async (req, res) => {
  try {
    let count = await CommunityPost.countDocuments();
    if (count === 0) {
      await CommunityPost.insertMany(seedPosts);
    }

    const { filter, search } = req.query;
    let query = {};

    if (filter === 'unanswered') {
      query.needsTeacherInput = true;
    } else if (filter === 'flagged') {
      query.isFlagged = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
        { course: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (filter === 'hot') {
      sortOptions = { votes: -1, createdAt: -1 };
    }

    const posts = await CommunityPost.find(query).sort(sortOptions);
    res.status(200).json(posts);
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: 'Server error fetching community posts' });
  }
};

// @desc    Create a new community post
// @route   POST /api/community
const createPost = async (req, res) => {
  try {
    const { title, body, course, tags, authorName, authorRole, authorAvatar } = req.body;

    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required' });
    }

    const user = req.user;
    const post = new CommunityPost({
      title,
      body,
      course: course || 'General Academic',
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(t => t.trim()) : []),
      authorName: authorName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Anonymous Student'),
      authorRole: authorRole || (user ? user.role : 'student'),
      authorAvatar: authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(authorName || 'user')}`,
      needsTeacherInput: (authorRole || user?.role) !== 'teacher'
    });

    const savedPost = await post.save();
    res.status(201).json(savedPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ message: 'Server error creating post' });
  }
};

// @desc    Add reply / guidance to a post
// @route   POST /api/community/:id/reply
const addReply = async (req, res) => {
  try {
    const { text, authorName, authorRole, authorAvatar } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Reply text is required' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const user = req.user;
    const replyAuthorRole = authorRole || (user ? user.role : 'student');
    const replyAuthorName = authorName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Peer Contributor');

    post.replies.push({
      authorName: replyAuthorName,
      authorRole: replyAuthorRole,
      authorAvatar: authorAvatar || `https://i.pravatar.cc/150?u=${encodeURIComponent(replyAuthorName)}`,
      text,
      createdAt: new Date()
    });

    if (replyAuthorRole === 'teacher') {
      post.needsTeacherInput = false;
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Server error adding reply' });
  }
};

// @desc    Upvote or downvote post
// @route   POST /api/community/:id/vote
const votePost = async (req, res) => {
  try {
    const { voteType, userId } = req.body; // voteType: 'up' or 'down'
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const uid = userId || (req.user ? req.user._id.toString() : 'anon_user');

    if (voteType === 'up') {
      if (post.upvotedBy.includes(uid)) {
        post.upvotedBy = post.upvotedBy.filter(id => id !== uid);
        post.votes -= 1;
      } else {
        post.upvotedBy.push(uid);
        post.votes += 1;
        if (post.downvotedBy.includes(uid)) {
          post.downvotedBy = post.downvotedBy.filter(id => id !== uid);
          post.votes += 1;
        }
      }
    } else if (voteType === 'down') {
      if (post.downvotedBy.includes(uid)) {
        post.downvotedBy = post.downvotedBy.filter(id => id !== uid);
        post.votes += 1;
      } else {
        post.downvotedBy.push(uid);
        post.votes -= 1;
        if (post.upvotedBy.includes(uid)) {
          post.upvotedBy = post.upvotedBy.filter(id => id !== uid);
          post.votes -= 1;
        }
      }
    }

    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error voting post:', error);
    res.status(500).json({ message: 'Server error voting post' });
  }
};

// @desc    Flag a post for moderation
// @route   POST /api/community/:id/flag
const flagPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFlagged = true;
    post.flagReason = reason || 'Academic integrity or conduct query';
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error flagging post:', error);
    res.status(500).json({ message: 'Server error flagging post' });
  }
};

// @desc    Dismiss flag on post
// @route   POST /api/community/:id/dismiss-flag
const dismissFlag = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.isFlagged = false;
    post.flagReason = '';
    const updatedPost = await post.save();
    res.status(200).json(updatedPost);
  } catch (error) {
    console.error('Error dismissing flag:', error);
    res.status(500).json({ message: 'Server error dismissing flag' });
  }
};

module.exports = {
  getPosts,
  createPost,
  addReply,
  votePost,
  flagPost,
  dismissFlag
};
