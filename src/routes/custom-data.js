const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Configure multer for CSV and JSON uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../data/custom-datasets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/json') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and JSON files are allowed!'), false);
    }
  }
});

// Custom Dataset Management
class CustomDatasetManager {
  constructor() {
    this.datasets = new Map();
    this.loadExistingDatasets();
  }

  // Load existing datasets from disk
  loadExistingDatasets() {
    const dataDir = path.join(__dirname, '../data/custom-datasets');
    if (fs.existsSync(dataDir)) {
      const files = fs.readdirSync(dataDir);
      files.forEach(file => {
        if (file.endsWith('.json')) {
          try {
            const data = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'));
            this.datasets.set(data.id, data);
          } catch (error) {
            console.error(`Error loading dataset ${file}:`, error);
          }
        }
      });
    }
  }

  // Add new dataset
  addDataset(dataset) {
    const id = `dataset_${Date.now()}`;
    const newDataset = {
      id,
      name: dataset.name,
      type: dataset.type,
      description: dataset.description,
      data: dataset.data,
      metadata: {
        createdAt: new Date().toISOString(),
        source: dataset.source || 'user_upload',
        location: dataset.location || 'India',
        lastUpdated: new Date().toISOString()
      }
    };

    this.datasets.set(id, newDataset);
    this.saveDatasetToDisk(newDataset);
    return newDataset;
  }

  // Save dataset to disk
  saveDatasetToDisk(dataset) {
    const dataDir = path.join(__dirname, '../data/custom-datasets');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const filePath = path.join(dataDir, `${dataset.id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(dataset, null, 2));
  }

  // Get relevant data for AI context
  getRelevantData(query, context = {}) {
    const relevantData = [];
    
    for (const [id, dataset] of this.datasets) {
      if (this.isRelevant(dataset, query, context)) {
        relevantData.push({
          source: dataset.name,
          type: dataset.type,
          data: this.extractRelevantData(dataset, query),
          confidence: this.calculateRelevanceScore(dataset, query, context)
        });
      }
    }

    // Sort by relevance score
    return relevantData.sort((a, b) => b.confidence - a.confidence);
  }

  // Check if dataset is relevant to query
  isRelevant(dataset, query, context) {
    const queryLower = query.toLowerCase();
    const contextLower = (context.location || '').toLowerCase();
    
    // Check dataset name and description
    if (dataset.name.toLowerCase().includes(queryLower) || 
        dataset.description.toLowerCase().includes(queryLower)) {
      return true;
    }

    // Check location relevance
    if (context.location && dataset.metadata.location) {
      if (dataset.metadata.location.toLowerCase().includes(contextLower) ||
          contextLower.includes(dataset.metadata.location.toLowerCase())) {
        return true;
      }
    }

    // Check data content for relevance
    if (dataset.data && typeof dataset.data === 'object') {
      return this.searchInData(dataset.data, queryLower);
    }

    return false;
  }

  // Search in dataset content
  searchInData(data, query) {
    if (typeof data === 'string') {
      return data.toLowerCase().includes(query);
    }
    
    if (Array.isArray(data)) {
      return data.some(item => this.searchInData(item, query));
    }
    
    if (typeof data === 'object') {
      return Object.values(data).some(value => this.searchInData(value, query));
    }
    
    return false;
  }

  // Extract relevant data from dataset
  extractRelevantData(dataset, query) {
    if (!dataset.data) return null;
    
    // For now, return a summary. In production, you'd implement more sophisticated extraction
    if (typeof dataset.data === 'string') {
      return dataset.data.length > 200 ? dataset.data.substring(0, 200) + '...' : dataset.data;
    }
    
    if (Array.isArray(dataset.data)) {
      return dataset.data.slice(0, 5); // Return first 5 items
    }
    
    if (typeof dataset.data === 'object') {
      return Object.keys(dataset.data).slice(0, 5).reduce((obj, key) => {
        obj[key] = dataset.data[key];
        return obj;
      }, {});
    }
    
    return dataset.data;
  }

  // Calculate relevance score
  calculateRelevanceScore(dataset, query, context) {
    let score = 0;
    
    // Exact matches get higher scores
    if (dataset.name.toLowerCase().includes(query.toLowerCase())) score += 0.3;
    if (dataset.description.toLowerCase().includes(query.toLowerCase())) score += 0.2;
    
    // Location relevance
    if (context.location && dataset.metadata.location) {
      if (dataset.metadata.location.toLowerCase().includes(context.location.toLowerCase())) {
        score += 0.4;
      }
    }
    
    // Recency bonus
    const daysSinceUpdate = (Date.now() - new Date(dataset.metadata.lastUpdated).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 30) score += 0.1;
    
    return Math.min(score, 1.0);
  }
}

const datasetManager = new CustomDatasetManager();

// Routes

// Upload custom dataset
router.post('/upload', upload.single('dataset'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { name, type, description, source, location } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ success: false, error: 'Name and type are required' });
    }

    let data;
    
    if (req.file.mimetype === 'text/csv') {
      // Parse CSV
      data = await parseCSV(req.file.path);
    } else if (req.file.mimetype === 'application/json') {
      // Parse JSON
      data = JSON.parse(fs.readFileSync(req.file.path, 'utf8'));
    }

    const dataset = datasetManager.addDataset({
      name,
      type,
      description: description || '',
      data,
      source,
      location
    });

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: 'Dataset uploaded successfully',
      dataset: {
        id: dataset.id,
        name: dataset.name,
        type: dataset.type,
        description: dataset.description,
        metadata: dataset.metadata
      }
    });

  } catch (error) {
    console.error('Dataset upload error:', error);
    res.status(500).json({ success: false, error: 'Failed to upload dataset' });
  }
});

// Get all datasets
router.get('/datasets', (req, res) => {
  try {
    const datasets = Array.from(datasetManager.datasets.values()).map(dataset => ({
      id: dataset.id,
      name: dataset.name,
      type: dataset.type,
      description: dataset.description,
      metadata: dataset.metadata
    }));

    res.json({
      success: true,
      datasets,
      total: datasets.length
    });

  } catch (error) {
    console.error('Get datasets error:', error);
    res.status(500).json({ success: false, error: 'Failed to get datasets' });
  }
});

// Get dataset by ID
router.get('/datasets/:id', (req, res) => {
  try {
    const dataset = datasetManager.datasets.get(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }

    res.json({
      success: true,
      dataset
    });

  } catch (error) {
    console.error('Get dataset error:', error);
    res.status(500).json({ success: false, error: 'Failed to get dataset' });
  }
});

// Delete dataset
router.delete('/datasets/:id', (req, res) => {
  try {
    const dataset = datasetManager.datasets.get(req.params.id);
    
    if (!dataset) {
      return res.status(404).json({ success: false, error: 'Dataset not found' });
    }

    // Remove from memory and disk
    datasetManager.datasets.delete(req.params.id);
    
    const filePath = path.join(__dirname, '../data/custom-datasets', `${req.params.id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Dataset deleted successfully'
    });

  } catch (error) {
    console.error('Delete dataset error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete dataset' });
  }
});

// Get relevant data for AI context
router.post('/context', (req, res) => {
  try {
    const { query, context } = req.body;
    
    if (!query) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const relevantData = datasetManager.getRelevantData(query, context);

    res.json({
      success: true,
      relevantData,
      totalFound: relevantData.length
    });

  } catch (error) {
    console.error('Get context error:', error);
    res.status(500).json({ success: false, error: 'Failed to get context data' });
  }
});

// Helper function to parse CSV
async function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

module.exports = router;
