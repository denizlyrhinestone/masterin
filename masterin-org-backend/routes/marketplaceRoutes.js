const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// POST /api/marketplace/products - Create a new product
router.post('/', verifyToken, checkRole(['teacher']), async (req, res) => {
  const {
    title, description, price,
    file_path, file_type, thumbnail_url,
    tags, subject, grade_level
  } = req.body;
  const seller_id = req.user.id; // From verifyToken

  // Basic validation
  if (!title || !description || price === undefined || !file_path || !file_type) {
    return res.status(400).json({ message: 'Title, description, price, file_path, and file_type are required.' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'Price must be a non-negative number.' });
  }

  // Phase 1: File upload is simulated.
  // In a real application, file upload logic (e.g., using multer for local storage,
  // or AWS S3 SDK for cloud storage) would be handled here or in a dedicated service.
  // The `file_path` would be determined by the upload process.
  console.log('Simulating file upload: file_path received as', file_path);

  try {
    const query = `
      INSERT INTO marketplace_products
        (title, description, price, seller_id, file_path, file_type, thumbnail_url, tags, subject, grade_level, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    // Default status for new products is 'pending_review' (handled by DB default)
    const values = [
      title, description, price, seller_id, file_path, file_type,
      thumbnail_url || null, tags || null, subject || null, grade_level || null,
      'pending_review' // Explicitly set, though DB has default
    ];
    const { rows: [newProduct] } = await db.query(query, values);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating marketplace product:', error.stack);
    res.status(500).json({ message: 'Server error creating product.' });
  }
});

// GET /api/marketplace/products - List all approved products with filtering
router.get('/', async (req, res) => {
  const { subject: querySubject, grade_level: queryGradeLevel, min_price, max_price, tag, page = 1, limit = 10 } = req.query;

  let baseQuery = `
    SELECT mp.id, mp.title, mp.description, mp.price, mp.seller_id, u.email as seller_email,
           mp.file_type, mp.thumbnail_url, mp.tags, mp.subject, mp.grade_level,
           mp.average_rating, mp.total_ratings, mp.created_at
    FROM marketplace_products mp
    JOIN users u ON mp.seller_id = u.id
    WHERE mp.status = 'approved'
  `;
  const conditions = [];
  const queryParams = [];
  let paramIndex = 1;

  if (querySubject) {
    conditions.push(`mp.subject ILIKE $${paramIndex++}`);
    queryParams.push(`%${querySubject}%`);
  }
  if (queryGradeLevel) {
    conditions.push(`mp.grade_level ILIKE $${paramIndex++}`);
    queryParams.push(`%${queryGradeLevel}%`);
  }
  if (min_price) {
    conditions.push(`mp.price >= $${paramIndex++}`);
    queryParams.push(parseFloat(min_price));
  }
  if (max_price) {
    conditions.push(`mp.price <= $${paramIndex++}`);
    queryParams.push(parseFloat(max_price));
  }
  if (tag) {
    conditions.push(`$${paramIndex++} = ANY(mp.tags)`); // Check if tag exists in the tags array
    queryParams.push(tag);
  }

  if (conditions.length > 0) {
    baseQuery += ' AND ' + conditions.join(' AND ');
  }

  baseQuery += ` ORDER BY mp.created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  queryParams.push(parseInt(limit), offset);

  try {
    const { rows: products } = await db.query(baseQuery, queryParams);
    // Could also add a query to get total count for pagination metadata
    res.json(products);
  } catch (error) {
    console.error('Error fetching marketplace products:', error.stack);
    res.status(500).json({ message: 'Server error fetching products.' });
  }
});

// GET /api/marketplace/products/:productId - Get a single approved product
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;
  try {
    const query = `
      SELECT mp.id, mp.title, mp.description, mp.price, mp.seller_id, u.email as seller_email,
             mp.file_path, mp.file_type, mp.thumbnail_url, mp.tags, mp.subject, mp.grade_level,
             mp.average_rating, mp.total_ratings, mp.created_at, mp.status
      FROM marketplace_products mp
      JOIN users u ON mp.seller_id = u.id
      WHERE mp.id = $1 AND mp.status = 'approved';
    `;
    const { rows: [product] } = await db.query(query, [productId]);
    if (!product) {
      return res.status(404).json({ message: 'Approved product not found.' });
    }
    res.json(product);
  } catch (error) {
    console.error('Error fetching single product:', error.stack);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// PUT /api/marketplace/products/:productId - Update a product (for seller)
router.put('/:productId', verifyToken, checkRole(['teacher']), async (req, res) => {
  const { productId } = req.params;
  const seller_id = req.user.id;
  const { title, description, price, file_path, file_type, thumbnail_url, tags, subject, grade_level, status } = req.body;

  // Basic validation
  if (!title && !description && price === undefined && !file_path && !file_type && !thumbnail_url && !tags && !subject && !grade_level && !status) {
    return res.status(400).json({ message: 'At least one field to update is required.' });
  }

  try {
    // Check if product exists and belongs to the seller
    const productCheck = await db.query('SELECT * FROM marketplace_products WHERE id = $1 AND seller_id = $2', [productId, seller_id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found or you are not the seller.' });
    }
    const currentProduct = productCheck.rows[0];

    // Construct update query (only update fields that are provided)
    // For status, if a teacher updates, it might go back to 'pending_review' unless they are also an admin.
    // For simplicity here, we allow teacher to update status if provided, but a real system might have stricter rules.
    const newStatus = status || currentProduct.status;

    const updateQuery = `
      UPDATE marketplace_products SET
        title = $1, description = $2, price = $3, file_path = $4, file_type = $5,
        thumbnail_url = $6, tags = $7, subject = $8, grade_level = $9, status = $10,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11 AND seller_id = $12
      RETURNING *;
    `;
    const values = [
      title || currentProduct.title,
      description || currentProduct.description,
      price === undefined ? currentProduct.price : price,
      file_path || currentProduct.file_path,
      file_type || currentProduct.file_type,
      thumbnail_url === undefined ? currentProduct.thumbnail_url : thumbnail_url, // Allow setting to null
      tags || currentProduct.tags,
      subject || currentProduct.subject,
      grade_level || currentProduct.grade_level,
      newStatus,
      productId,
      seller_id
    ];

    const { rows: [updatedProduct] } = await db.query(updateQuery, values);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error.stack);
    res.status(500).json({ message: 'Server error updating product.' });
  }
});

// DELETE /api/marketplace/products/:productId - Delete a product (for seller or admin)
router.delete('/:productId', verifyToken, async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let deleteQuery;
    let queryParams;

    if (userRole === 'admin') {
      deleteQuery = 'DELETE FROM marketplace_products WHERE id = $1 RETURNING *;';
      queryParams = [productId];
    } else if (userRole === 'teacher') {
      deleteQuery = 'DELETE FROM marketplace_products WHERE id = $1 AND seller_id = $2 RETURNING *;';
      queryParams = [productId, userId];
    } else {
      // Should not happen if checkRole is used, but as a safeguard:
      return res.status(403).json({ message: 'You do not have permission to delete products.' });
    }

    const { rows: [deletedProduct] } = await db.query(deleteQuery, queryParams);

    if (!deletedProduct) {
      if (userRole === 'admin') {
        return res.status(404).json({ message: 'Product not found.' });
      } else {
        return res.status(404).json({ message: 'Product not found or you are not the seller.' });
      }
    }
    // Consider soft delete by changing status if needed later (e.g., status = 'archived')
    res.status(200).json({ message: 'Product deleted successfully.', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error.stack);
    res.status(500).json({ message: 'Server error deleting product.' });
  }
});

module.exports = router;
