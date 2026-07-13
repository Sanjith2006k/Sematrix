const axios = require('axios');

// In-memory cache for API responses to avoid rate limits
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

const getCached = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCache = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

exports.getProblems = async (req, res) => {
  const { topic } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  const topicSlug = topic.toLowerCase().replace(/\s+/g, '-');
  const cacheKey = `leetcode:${topicSlug}`;

  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const response = await axios.get('https://leetcode.com/api/problems/all/');
    const allProblems = response.data.stat_status_pairs || [];
    
    const problems = allProblems
      .filter(p => !p.paid_only) // Hide LeetCode Premium problems
      .map(p => {
        let diff = 'Easy';
        if (p.difficulty.level === 2) diff = 'Medium';
        if (p.difficulty.level === 3) diff = 'Hard';

        return {
          frontendQuestionId: p.stat.frontend_question_id,
          difficulty: diff,
          title: p.stat.question__title,
          titleSlug: p.stat.question__title_slug
        };
      })
      .sort((a, b) => a.frontendQuestionId - b.frontendQuestionId);
    
    if (problems.length > 0) {
      setCache(cacheKey, problems);
    }
    
    res.status(200).json(problems);
  } catch (error) {
    console.error('LeetCode API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch LeetCode problems.' });
  }
};

exports.getProblemContent = async (req, res) => {
  const { titleSlug } = req.body;
  if (!titleSlug) return res.status(400).json({ message: 'titleSlug is required' });

  const cacheKey = `leetcode:content:${titleSlug}`;
  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const query = `
      query questionContent($titleSlug: String!) {
        question(titleSlug: $titleSlug) {
          content
        }
      }
    `;
    const response = await axios.post('https://leetcode.com/graphql', {
      query,
      variables: { titleSlug }
    }, { headers: { 'Content-Type': 'application/json' } });

    const content = response.data.data?.question?.content;
    if (content) {
      setCache(cacheKey, { content });
      res.status(200).json({ content });
    } else {
      res.status(404).json({ message: 'Content not found' });
    }
  } catch (error) {
    console.error('LeetCode Content API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch LeetCode problem content.' });
  }
};

exports.getVideo = async (req, res) => {
  const { topic, language } = req.body;
  if (!topic) {
    return res.status(400).json({ message: 'Topic is required.' });
  }

  const searchQuery = `${topic} data structures algorithms tutorial ${language || ''}`.trim();
  const cacheKey = `youtube:${searchQuery}`;

  const cachedData = getCached(cacheKey);
  if (cachedData) {
    return res.status(200).json(cachedData);
  }

  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      // Fallback for development if no key is provided
      const fallback = {
        title: `Learn ${topic} in ${language || 'Programming'}`,
        videoId: '8hly31xKli0', // Example video
        channelTitle: 'freeCodeCamp.org'
      };
      return res.status(200).json(fallback);
    }

    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: 1,
        key: apiKey,
        order: 'relevance'
      }
    });

    const items = response.data.items;
    if (items && items.length > 0) {
      const video = items[0];
      const videoData = {
        title: video.snippet.title,
        videoId: video.id.videoId,
        channelTitle: video.snippet.channelTitle
      };
      setCache(cacheKey, videoData);
      res.status(200).json(videoData);
    } else {
      res.status(404).json({ message: 'No video found.' });
    }
  } catch (error) {
    console.error('YouTube API Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube video.' });
  }
};

const ProblemNote = require('../models/ProblemNote');
const User = require('../models/User');

exports.saveProblemNote = async (req, res) => {
  const { problemSlug, title, difficulty, topic, codeSnippet, notes, isSolved } = req.body;
  const userId = req.user._id;

  try {
    let problemNote = await ProblemNote.findOne({ user: userId, problemSlug });

    if (problemNote) {
      problemNote.title = title || problemNote.title;
      problemNote.difficulty = difficulty || problemNote.difficulty;
      problemNote.topic = topic || problemNote.topic;
      problemNote.codeSnippet = codeSnippet !== undefined ? codeSnippet : problemNote.codeSnippet;
      problemNote.notes = notes !== undefined ? notes : problemNote.notes;
      problemNote.isSolved = isSolved !== undefined ? isSolved : problemNote.isSolved;
      
      await problemNote.save();
    } else {
      problemNote = await ProblemNote.create({
        user: userId,
        problemSlug,
        title,
        difficulty,
        topic,
        codeSnippet,
        notes,
        isSolved
      });
    }

    res.status(200).json(problemNote);
  } catch (error) {
    console.error('Save Note Error:', error.message);
    res.status(500).json({ message: 'Failed to save problem note.' });
  }
};

exports.getProblemNotes = async (req, res) => {
  const userId = req.user._id;
  try {
    const notes = await ProblemNote.find({ user: userId }).sort({ updatedAt: -1 });
    res.status(200).json(notes);
  } catch (error) {
    console.error('Get Notes Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch problem notes.' });
  }
};

exports.updateFocusNote = async (req, res) => {
  const { dsaFocusNote } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.dsaFocusNote = dsaFocusNote;
    await user.save();
    res.status(200).json({ dsaFocusNote: user.dsaFocusNote });
  } catch (error) {
    console.error('Update Focus Note Error:', error.message);
    res.status(500).json({ message: 'Failed to update focus note.' });
  }
};
