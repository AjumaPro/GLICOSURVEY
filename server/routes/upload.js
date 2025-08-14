const express = require('express');
const router = express.Router();
const multer = require('multer');
const { initializeApp } = require('firebase/app');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const { query } = require('../database/connection');
const auth = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// POST /api/upload/image - Upload image to Firebase
router.post('/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { originalname, mimetype, buffer } = req.file;
    const fileExtension = originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `images/${req.user.id}/${fileName}`;

    // Upload to Firebase Storage
    const storageRef = ref(storage, filePath);
    const snapshot = await uploadBytes(storageRef, buffer, {
      contentType: mimetype,
      metadata: {
        originalName: originalname,
        uploadedBy: req.user.id
      }
    });

    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save to database
    const result = await query(
      `INSERT INTO images (user_id, filename, original_name, mime_type, size, url, firebase_path)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        fileName,
        originalname,
        mimetype,
        buffer.length,
        downloadURL,
        filePath
      ]
    );

    res.status(201).json({
      id: result.rows[0].id,
      filename: fileName,
      originalName: originalname,
      url: downloadURL,
      size: buffer.length
    });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// GET /api/upload/images - Get user's uploaded images
router.get('/images', auth, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM images WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: 'Failed to fetch images' });
  }
});

// DELETE /api/upload/image/:id - Delete uploaded image
router.delete('/image/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;

    // Get image details
    const imageResult = await query(
      'SELECT * FROM images WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const image = imageResult.rows[0];

    // Delete from Firebase Storage
    try {
      const storageRef = ref(storage, image.firebase_path);
      // Note: Firebase Admin SDK would be needed for delete operation
      // For now, we'll just delete from database
    } catch (firebaseError) {
      console.error('Firebase delete error:', firebaseError);
      // Continue with database deletion even if Firebase fails
    }

    // Delete from database
    await query('DELETE FROM images WHERE id = $1', [id]);

    res.json({ message: 'Image deleted successfully' });

  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// POST /api/upload/emoji-scale - Upload emoji scale images
router.post('/emoji-scale', auth, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const { originalname, mimetype, buffer } = file;
      const fileExtension = originalname.split('.').pop();
      const fileName = `emoji-scale-${uuidv4()}.${fileExtension}`;
      const filePath = `emoji-scales/${req.user.id}/${fileName}`;

      // Upload to Firebase Storage
      const storageRef = ref(storage, filePath);
      const snapshot = await uploadBytes(storageRef, buffer, {
        contentType: mimetype,
        metadata: {
          originalName: originalname,
          uploadedBy: req.user.id,
          type: 'emoji-scale'
        }
      });

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Save to database
      const result = await query(
        `INSERT INTO images (user_id, filename, original_name, mime_type, size, url, firebase_path)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          req.user.id,
          fileName,
          originalname,
          mimetype,
          buffer.length,
          downloadURL,
          filePath
        ]
      );

      uploadedImages.push({
        id: result.rows[0].id,
        filename: fileName,
        originalName: originalname,
        url: downloadURL,
        size: buffer.length
      });
    }

    res.status(201).json({
      message: `${uploadedImages.length} images uploaded successfully`,
      images: uploadedImages
    });

  } catch (error) {
    console.error('Error uploading emoji scale images:', error);
    res.status(500).json({ error: 'Failed to upload emoji scale images' });
  }
});

// GET /api/upload/emoji-scales - Get emoji scale templates
router.get('/emoji-scales', async (req, res) => {
  try {
    // Return predefined emoji scale templates (now using custom SVG emojis)
    const emojiScales = {
      satisfaction: [
        { value: 1, label: 'Very Unsatisfied' },
        { value: 2, label: 'Unsatisfied' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Satisfied' },
        { value: 5, label: 'Very Satisfied' }
      ],
      agreement: [
        { value: 1, label: 'Strongly Disagree' },
        { value: 2, label: 'Disagree' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Agree' },
        { value: 5, label: 'Strongly Agree' }
      ],
      quality: [
        { value: 1, label: 'Poor' },
        { value: 2, label: 'Fair' },
        { value: 3, label: 'Good' },
        { value: 4, label: 'Very Good' },
        { value: 5, label: 'Excellent' }
      ],
      thumbs: [
        { value: 1, label: 'Thumbs Down', emoji: '👎' },
        { value: 2, label: 'Thumbs Up', emoji: '👍' }
      ],
      recommendation_5: [
        { value: 1, label: 'Very Unlikely' },
        { value: 2, label: 'Unlikely' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Likely' },
        { value: 5, label: 'Very Likely' }
      ],
      recommendation_10: [
        { value: 1, label: 'Unlikely' },
        { value: 2, label: 'Unlikely' },
        { value: 3, label: 'Unlikely' },
        { value: 4, label: 'Unlikely' },
        { value: 5, label: 'Unlikely' },
        { value: 6, label: 'Unlikely' },
        { value: 7, label: 'Neutral' },
        { value: 8, label: 'Neutral' },
        { value: 9, label: 'Likely' },
        { value: 10, label: 'Likely' }
      ],
      customer_satisfaction: [
        { value: 1, label: 'Very Dissatisfied' },
        { value: 2, label: 'Dissatisfied' },
        { value: 3, label: 'Neutral' },
        { value: 4, label: 'Satisfied' },
        { value: 5, label: 'Very Satisfied' }
      ],
      ease_of_use: [
        { value: 1, label: 'Very Difficult' },
        { value: 2, label: 'Difficult' },
        { value: 3, label: 'Moderate' },
        { value: 4, label: 'Easy' },
        { value: 5, label: 'Very Easy' }
      ],
      stars: [
        { value: 1, label: '1 Star', emoji: '⭐' },
        { value: 2, label: '2 Stars', emoji: '⭐⭐' },
        { value: 3, label: '3 Stars', emoji: '⭐⭐⭐' },
        { value: 4, label: '4 Stars', emoji: '⭐⭐⭐⭐' },
        { value: 5, label: '5 Stars', emoji: '⭐⭐⭐⭐⭐' }
      ],
      hearts: [
        { value: 1, label: '1 Heart', emoji: '❤️' },
        { value: 2, label: '2 Hearts', emoji: '❤️❤️' },
        { value: 3, label: '3 Hearts', emoji: '❤️❤️❤️' },
        { value: 4, label: '4 Hearts', emoji: '❤️❤️❤️❤️' },
        { value: 5, label: '5 Hearts', emoji: '❤️❤️❤️❤️❤️' }
      ]
    };

    res.json(emojiScales);
  } catch (error) {
    console.error('Error fetching emoji scales:', error);
    res.status(500).json({ error: 'Failed to fetch emoji scales' });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ error: 'File upload error' });
  }
  
  if (error.message === 'Only image files are allowed') {
    return res.status(400).json({ error: 'Only image files are allowed' });
  }
  
  next(error);
});

module.exports = router; 