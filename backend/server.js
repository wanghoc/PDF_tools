const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const pino = require('pino');
const pinoPretty = require('pino-pretty');

// Initialize logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true
    }
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  logger.info('Created uploads directory');
}

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// File upload rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: 'Too many file uploads from this IP, please try again later.',
});
app.use('/api/upload', uploadLimiter);

// Middleware
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  res.setHeader('X-Request-ID', requestId);
  
  logger.info({
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  
  next();
});

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: (req, file, cb) => {
    // Validate file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'application/msword', // .doc
      'application/vnd.ms-excel', // .xls
      'application/vnd.ms-powerpoint' // .ppt
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, images, and Office documents are allowed.'));
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// File upload endpoint
app.post('/api/upload', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        requestId: req.requestId
      });
    }

    const uploadedFiles = req.files.map(file => ({
      id: uuidv4(),
      originalName: file.originalname,
      filename: file.filename,
      size: file.size,
      mimetype: file.mimetype,
      path: file.path,
      uploadedAt: new Date().toISOString()
    }));

    logger.info({
      requestId: req.requestId,
      action: 'file_upload',
      fileCount: uploadedFiles.length,
      totalSize: uploadedFiles.reduce((sum, file) => sum + file.size, 0)
    });

    res.json({
      success: true,
      files: uploadedFiles,
      requestId: req.requestId
    });

  } catch (error) {
    logger.error({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'File upload failed',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Job creation endpoint
app.post('/api/jobs', async (req, res) => {
  try {
    const { tool, options, files } = req.body;
    
    if (!tool || !files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        error: 'Invalid job parameters',
        requestId: req.requestId
      });
    }

    const jobId = uuidv4();
    const job = {
      id: jobId,
      tool,
      options: options || {},
      inputFiles: files,
      status: 'queued',
      progress: 0,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutes
    };

    // TODO: Add job to Redis queue
    // await queue.add(jobId, job);

    logger.info({
      requestId: req.requestId,
      action: 'job_created',
      jobId,
      tool,
      fileCount: files.length
    });

    res.json({
      success: true,
      jobId,
      job,
      requestId: req.requestId
    });

  } catch (error) {
    logger.error({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Job creation failed',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Job status endpoint
app.get('/api/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // TODO: Get job status from Redis/database
    const job = {
      id: jobId,
      status: 'processing',
      progress: 50,
      createdAt: new Date().toISOString(),
      // Mock data for now
    };

    res.json({
      success: true,
      job,
      requestId: req.requestId
    });

  } catch (error) {
    logger.error({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Failed to get job status',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// File download endpoint
app.get('/api/download/:fileId', (req, res) => {
  try {
    const { fileId } = req.params;
    
    // TODO: Implement secure file download with signed URLs
    // For now, just return a mock response
    res.json({
      success: true,
      downloadUrl: `https://example.com/download/${fileId}`,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      requestId: req.requestId
    });

  } catch (error) {
    logger.error({
      requestId: req.requestId,
      error: error.message,
      stack: error.stack
    });

    res.status(500).json({
      error: 'Download failed',
      message: error.message,
      requestId: req.requestId
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error({
    requestId: req.requestId,
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File size exceeds 50MB limit',
        requestId: req.requestId
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maximum 10 files allowed',
        requestId: req.requestId
      });
    }
  }

  res.status(500).json({
    error: 'Internal server error',
    message: error.message,
    requestId: req.requestId
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: 'The requested resource was not found',
    requestId: req.requestId
  });
});

// Start server
app.listen(PORT, () => {
  logger.info({
    message: `PDF Converter Backend server running on port ${PORT}`,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

module.exports = app;
