const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

// Initial seed posts for Grade 10 ICT & System Level Programming
const seedPosts = [
  {
    authorName: 'Tharindu Gunawardena',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=tharindu',
    title: 'How do UNIX directory management commands (pwd, cd, mkdir) work with relative vs absolute pathnames?',
    body: 'In our ICT Unit on System Level Programming & Operating Systems, we are learning directory management. If my current working directory is /home/student/Project, what is the difference between running "cd .." vs "cd /home/student"? Can someone explain absolute and relative paths with simple examples?',
    course: 'Grade 10 ICT - Operating Systems',
    tags: ['UNIX Commands', 'File System', 'Grade 10 ICT', 'Directory Management'],
    votes: 38,
    needsTeacherInput: true,
    replies: [
      {
        authorName: 'Kavindu Perera',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?u=kavindu',
        text: 'An absolute path always starts from the root directory "/" (like /home/student/Project). A relative path starts from your current directory! So "cd .." moves up one directory level to /home/student using a relative path.',
        createdAt: new Date(Date.now() - 3600000)
      }
    ]
  },
  {
    authorName: 'Nethmi Fernando',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=nethmi',
    title: 'Understanding UNIX file permissions in ls -l output (e.g. -rw-r--r-- and chmod modes)',
    body: 'When I run "ls -l notes.txt" in the terminal, the output shows "-rw-r--r-- 1 student csdept 1024 Nov 05 10:30 notes.txt". What do the 10 permission characters mean for owner, group, and others? How do I change permissions to rwxr-xr-x using octal mode with chmod?',
    course: 'Grade 10 ICT - System Level Programming',
    tags: ['File Permissions', 'chmod', 'ls -l', 'Grade 10 ICT'],
    votes: 29,
    needsTeacherInput: true,
    replies: [
      {
        authorName: 'Mr. Akila Savinda',
        authorRole: 'teacher',
        authorAvatar: 'https://i.pravatar.cc/150?u=akila',
        text: 'The 10 characters breakdown: 1st is file type ("-" for regular file), next 3 are owner permissions ("rw-"), next 3 are group ("r--"), last 3 are others ("r--"). To set permissions to rwxr-xr-x in octal mode, use "chmod 755 notes.txt" because owner=7 (4+2+1), group=5 (4+0+1), others=5 (4+0+1)!',
        createdAt: new Date(Date.now() - 7200000)
      }
    ]
  },
  {
    authorName: 'Sachintha Ranasinghe',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=sachintha',
    title: 'Differentiating base Linux distributions and derived Linux distributions with examples',
    body: 'Can someone help clarify the difference between base Linux distributions and derived Linux distributions for our ICT test? For example, is Debian a base distribution and Ubuntu a derived distribution?',
    course: 'Grade 10 ICT - Operating Systems',
    tags: ['Linux Distros', 'Operating Systems', 'Grade 10 ICT'],
    votes: 19,
    needsTeacherInput: false,
    replies: [
      {
        authorName: 'Dinithi Wickramasinghe',
        authorRole: 'student',
        authorAvatar: 'https://i.pravatar.cc/150?u=dinithi',
        text: 'Yes exactly! Base distributions like Debian or RedHat are built from scratch. Derived distributions like Ubuntu or Mint are built upon base distros to add user-friendly desktop environments and pre-installed software packages.',
        createdAt: new Date(Date.now() - 14400000)
      }
    ]
  },
  {
    authorName: 'Mr. Akila Savinda',
    authorRole: 'teacher',
    authorAvatar: 'https://i.pravatar.cc/150?u=akila',
    title: 'Grade 10 ICT Revision Outline: Purpose of core UNIX commands (ls, date, who, passwd)',
    body: 'Hello students! For your upcoming ICT exam, make sure you know the purpose of basic UNIX commands:\n1. ls - List directory contents\n2. date - Display current system date and time\n3. who - Show users currently logged into the system\n4. passwd - Change user password\nReview directory management commands (pwd, cd, mkdir) as well!',
    course: 'Grade 10 ICT - Computer Systems',
    tags: ['UNIX Commands', 'Instructor Announcement', 'Grade 10 ICT'],
    votes: 35,
    needsTeacherInput: false,
    replies: []
  },
  {
    authorName: 'Bhanuka Dilshan',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=bhanuka',
    title: 'What positional parameters ($#, $*, $1) represent in UNIX shell scripting?',
    body: 'When executing a bash shell script with command line arguments like "./script.sh apple banana orange", what do special parameters $#, $*, and positional variables $1 and $2 store inside the script?',
    course: 'Grade 10 ICT - Shell Scripting',
    tags: ['Shell Scripting', 'UNIX Variables', 'Grade 10 ICT'],
    votes: 14,
    needsTeacherInput: true,
    replies: []
  },
  {
    authorName: 'Amanda Perera',
    authorRole: 'student',
    authorAvatar: 'https://i.pravatar.cc/150?u=amanda',
    title: 'What information is stored in UNIX system files /etc/passwd, /etc/group, and /etc/shadow?',
    body: 'I am reviewing UNIX system configuration files. What is the specific purpose of /etc/passwd, /etc/group, and /etc/shadow? Why are encrypted passwords stored in /etc/shadow instead of /etc/passwd?',
    course: 'Grade 10 ICT - System Level Programming',
    tags: ['System Files', 'UNIX Security', 'Grade 10 ICT'],
    votes: 22,
    needsTeacherInput: true,
    replies: []
  }
];

let hasCleanedUpLegacyData = false;

// @desc    Get all community posts
// @route   GET /api/community
const getPosts = async (req, res) => {
  try {
    // Only run database cleanup/seeding once on startup, not on every HTTP GET request
    if (!hasCleanedUpLegacyData) {
      hasCleanedUpLegacyData = true;
      try {
        await CommunityPost.deleteMany({
          $or: [
            { course: 'Advanced Calculus' },
            { course: 'Physics 202' },
            { title: { $regex: "Maxwell's Equations|Chain Rule|Thermodynamics", $options: 'i' } }
          ]
        });

        await CommunityPost.updateMany(
          { authorName: /Wickramasinghe/i, authorRole: 'teacher' },
          { $set: { authorName: 'Mr. Akila Savinda', authorAvatar: 'https://i.pravatar.cc/150?u=akila' } }
        );
        await CommunityPost.updateMany(
          { 'replies.authorName': /Wickramasinghe/i, 'replies.authorRole': 'teacher' },
          { $set: { 'replies.$[elem].authorName': 'Mr. Akila Savinda', 'replies.$[elem].authorAvatar': 'https://i.pravatar.cc/150?u=akila' } },
          { arrayFilters: [{ 'elem.authorName': { $regex: /Wickramasinghe/i }, 'elem.authorRole': 'teacher' }] }
        );

        const count = await CommunityPost.countDocuments();
        if (count === 0) {
          await CommunityPost.insertMany(seedPosts);
        }
      } catch (cleanupErr) {
        console.warn('Community legacy data cleanup error:', cleanupErr.message);
      }
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

    // Only fetch profile pictures for users who authored posts or replies in this list
    const authorNames = new Set();
    posts.forEach(p => {
      if (p.authorName) authorNames.add(p.authorName.trim());
      (p.replies || []).forEach(r => {
        if (r.authorName) authorNames.add(r.authorName.trim());
      });
    });

    const profilePicMap = new Map();
    if (authorNames.size > 0) {
      const queryOr = [];
      authorNames.forEach(name => {
        const cleanName = name.replace(/^(mr\.|mrs\.|ms\.|dr\.)\s*/i, '').trim();
        queryOr.push({ username: new RegExp(`^${name}$`, 'i') });
        queryOr.push({ username: new RegExp(`^${cleanName}$`, 'i') });

        const parts = cleanName.split(/\s+/);
        if (parts.length > 1) {
          queryOr.push({
            firstName: new RegExp(`^${parts[0]}$`, 'i'),
            lastName: new RegExp(`^${parts.slice(1).join(' ')}$`, 'i')
          });
        } else if (parts[0]) {
          queryOr.push({ firstName: new RegExp(`^${parts[0]}$`, 'i') });
        }
      });

      const users = await User.find({ $or: queryOr }, 'firstName lastName username profilePicture').lean();
      users.forEach(u => {
        if (u.profilePicture) {
          const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
          if (fullName) {
            profilePicMap.set(fullName, u.profilePicture);
            profilePicMap.set(`mr. ${fullName}`, u.profilePicture);
            profilePicMap.set(`mrs. ${fullName}`, u.profilePicture);
            profilePicMap.set(`dr. ${fullName}`, u.profilePicture);
          }
          if (u.username) {
            profilePicMap.set(u.username.toLowerCase(), u.profilePicture);
          }
        }
      });
    }

    const enrichedPosts = posts.map(post => {
      const postObj = post.toObject();

      const authorKey = (postObj.authorName || '').toLowerCase();
      const dbProfilePic = profilePicMap.get(authorKey);
      if (dbProfilePic) {
        postObj.authorAvatar = dbProfilePic;
      }

      if (postObj.replies && postObj.replies.length > 0) {
        postObj.replies = postObj.replies.map(reply => {
          const replyAuthorKey = (reply.authorName || '').toLowerCase();
          const replyDbProfilePic = profilePicMap.get(replyAuthorKey);
          if (replyDbProfilePic) {
            reply.authorAvatar = replyDbProfilePic;
          }
          return reply;
        });
      }

      return postObj;
    });

    res.status(200).json(enrichedPosts);
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
      authorAvatar: authorAvatar || req.user?.profilePicture || null,
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
    const replyAuthorName = authorName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : 'Kavindu Perera');

    post.replies.push({
      authorName: replyAuthorName,
      authorRole: replyAuthorRole,
      authorAvatar: authorAvatar || req.user?.profilePicture || null,
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

// @desc    Delete a post
// @route   DELETE /api/community/:id
const deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully', id: req.params.id });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ message: 'Server error deleting post' });
  }
};

module.exports = {
  getPosts,
  createPost,
  addReply,
  votePost,
  flagPost,
  dismissFlag,
  deletePost
};
