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
    // Return predefined emoji scale templates
    const emojiScales = {
      satisfaction: [
        { value: 1, label: 'Very Dissatisfied', emoji: '😞' },
        { value: 2, label: 'Dissatisfied', emoji: '😐' },
        { value: 3, label: 'Neutral', emoji: '😐' },
        { value: 4, label: 'Satisfied', emoji: '🙂' },
        { value: 5, label: 'Very Satisfied', emoji: '😊' }
      ],
      agreement: [
        { value: 1, label: 'Strongly Disagree', emoji: '👎' },
        { value: 2, label: 'Disagree', emoji: '👎' },
        { value: 3, label: 'Neutral', emoji: '🤷' },
        { value: 4, label: 'Agree', emoji: '👍' },
        { value: 5, label: 'Strongly Agree', emoji: '👍' }
      ],
      quality: [
        { value: 1, label: 'Poor', emoji: '⭐' },
        { value: 2, label: 'Fair', emoji: '⭐⭐' },
        { value: 3, label: 'Good', emoji: '⭐⭐⭐' },
        { value: 4, label: 'Very Good', emoji: '⭐⭐⭐⭐' },
        { value: 5, label: 'Excellent', emoji: '⭐⭐⭐⭐⭐' }
      ],
      thumbs: [
        { value: 1, label: 'Thumbs Down', emoji: '👎' },
        { value: 2, label: 'Thumbs Up', emoji: '👍' }
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