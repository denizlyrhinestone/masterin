const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { body, query, param, validationResult } = require('express-validator');
const path = require('path'); // For file downloads

// Define UPLOAD_DIR_ROOT - this should ideally be from a centralized config
// Assuming this routes file is in masterin-org-backend/routes/
// And uploads are in masterin-org-backend/uploads/
const UPLOAD_DIR_ROOT = path.join(__dirname, '..', 'uploads');

const productValidationRules = [
  body('title').notEmpty().trim().escape().withMessage('Title is required.'),
  body('description').notEmpty().trim().escape().withMessage('Description is required.'),
  body('price').isFloat({ gt: -0.01 }).withMessage('Price must be a non-negative number.'),
  // For file_path and thumbnail_url, consider isURL validator if they should be URLs, or just escape if they are paths.
  body('file_path').notEmpty().trim().escape().withMessage('File path is required.'), // Basic sanitization for paths
  body('file_type').notEmpty().trim().escape().withMessage('File type is required.'),
  body('thumbnail_url').optional({ checkFalsy: true }).isURL().withMessage('Thumbnail URL must be a valid URL if provided.').trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array if provided.'),
  body('tags.*').if(body('tags').isArray()).trim().escape(), // Sanitize each tag if tags array is provided
  body('subject').optional({ checkFalsy: true }).trim().escape(),
  body('grade_level').optional({ checkFalsy: true }).trim().escape(),
  // Status is not set by user on creation, defaults in DB. For update, it's handled separately.
];

// POST /api/marketplace/products - Create a new product
router.post('/', verifyToken, checkRole(['teacher']), productValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    title, description, price,
    file_path, file_type, thumbnail_url,
    tags, subject, grade_level
  } = req.body;
  const seller_id = req.user.id; // From verifyToken

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
router.get('/', [
  query('subject').optional().trim().escape(),
  query('grade_level').optional().trim().escape(),
  query('min_price').optional().isFloat({ gt: -0.01 }).toFloat(),
  query('max_price').optional().isFloat({ gt: -0.01 }).toFloat(),
  query('tag').optional().trim().escape(),
  query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer.'),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be a positive integer (max 100).')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  // Use sanitized values from req.query for page and limit, and other filters
  const { subject: querySubject, grade_level: queryGradeLevel, min_price, max_price, tag } = req.query;
  const page = req.query.page || 1; // Default to 1 if not provided or invalid
  const limit = req.query.limit || 10; // Default to 10

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

// Helper function to fetch file metadata
async function fetchFileMetadata(fileIds) {
  if (!fileIds || fileIds.length === 0) {
    return [];
  }
  try {
    const query = `
      SELECT id, file_name, file_path, mime_type, size_bytes, created_at, updated_at
      FROM uploaded_files
      WHERE id = ANY($1::int[])
      ORDER BY id; -- Optional: order by name or other attribute
    `;
    const { rows } = await db.query(query, [fileIds]);
    return rows;
  } catch (error) {
    console.error('Error fetching file metadata:', error);
    // Depending on desired error handling, you might throw, or return empty/error indicator
    return [];
  }
}

// GET /api/marketplace/products/:productId - Get a single approved product
router.get('/:productId', [
  param('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { productId } = req.params;

  try {
    const productQuery = `
      SELECT
        mp.id, mp.title, mp.description, mp.price,
        mp.seller_id, seller.full_name AS seller_name, seller_uf.file_path AS seller_profile_picture_url,
        mp.file_path, mp.file_type, mp.thumbnail_url, mp.tags, mp.subject, mp.grade_level,
        mp.average_rating, mp.total_ratings, mp.created_at, mp.status,
        mp.content_file_ids, mp.preview_file_ids
      FROM marketplace_products mp
      JOIN users seller ON mp.seller_id = seller.id
      LEFT JOIN uploaded_files seller_uf ON seller.profile_picture_file_id = seller_uf.id
      WHERE mp.id = $1 AND mp.status = 'approved';
    `;
    const { rows: [product] } = await db.query(productQuery, [productId]);

    if (!product) {
      return res.status(404).json({ message: 'Approved product not found.' });
    }

    // Fetch associated file metadata
    const content_files = await fetchFileMetadata(product.content_file_ids);
    const preview_files = await fetchFileMetadata(product.preview_file_ids);

    // Construct the response object
    const responseProduct = {
      ...product,
      content_files,
      preview_files
    };
    // Remove individual ID arrays from top level if desired, as they are now expanded
    // delete responseProduct.content_file_ids;
    // delete responseProduct.preview_file_ids;
    // Decided to keep them for now, client can ignore if they use the _files arrays.

    res.json(responseProduct);
  } catch (error) {
    console.error('Error fetching single product:', error.stack);
    res.status(500).json({ message: 'Server error fetching product.' });
  }
});

// PUT /api/marketplace/products/:productId - Update a product (for seller)
// Apply similar validation rules as for POST, but make all fields optional
const updateProductValidationRules = [
  param('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.'),
  body('title').optional().notEmpty().trim().escape().withMessage('Title cannot be empty if provided.'),
  body('description').optional().notEmpty().trim().escape().withMessage('Description cannot be empty if provided.'),
  body('price').optional().isFloat({ gt: -0.01 }).withMessage('Price must be a non-negative number if provided.'),
  body('file_path').optional({checkFalsy: true}).trim().escape(), // Allow empty string to clear? Or notEmpty()
  body('file_type').optional({checkFalsy: true}).trim().escape(),
  body('thumbnail_url').optional({ checkFalsy: true }).isURL().withMessage('Thumbnail URL must be a valid URL if provided.').trim(),
  body('tags').optional().isArray().withMessage('Tags must be an array if provided.'),
  body('tags.*').if(body('tags').isArray()).trim().escape(),
  body('subject').optional({ checkFalsy: true }).trim().escape(),
  body('grade_level').optional({ checkFalsy: true }).trim().escape(),
  body('status').optional().isIn(['pending_review', 'approved', 'rejected', 'archived']).withMessage('Invalid status value.')
];

router.put('/:productId', verifyToken, checkRole(['teacher']), updateProductValidationRules, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId } = req.params; // Validated
  const seller_id = req.user.id;
  const { title, description, price, file_path, file_type, thumbnail_url, tags, subject, grade_level, status } = req.body;

  // No need for the manual 'at least one field' check if using optional validators correctly.
  // The logic below already handles updating only provided fields.

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
router.delete('/:productId', verifyToken, [
  param('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { productId } = req.params; // Validated
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

// POST /api/marketplace/products/:productId/acquire - Acquire a product
router.post('/:productId/acquire', verifyToken, [
    param('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId } = req.params;
    const userId = req.user.id;

    try {
      // 1. Fetch product by productId
      const productResult = await db.query('SELECT id, title, price, status FROM marketplace_products WHERE id = $1', [productId]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ success: false, message: 'Product not found.' });
      }
      const product = productResult.rows[0];

      // 2. Check product status
      if (product.status !== 'approved') {
        return res.status(400).json({ success: false, message: 'Product not available for acquisition.' });
      }

      // 3. Check if user already acquired the product
      const existingPurchaseResult = await db.query(
        'SELECT id FROM user_product_purchases WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      if (existingPurchaseResult.rows.length > 0) {
        return res.status(200).json({ success: true, message: 'Product already acquired.', purchase: existingPurchaseResult.rows[0] });
      }

      // 4. Determine price_paid and transaction_id (simulate payment for priced items)
      const price_paid = product.price;
      let transaction_id = null;

      if (price_paid > 0) {
        // TODO: Integrate with a real payment gateway in a production environment
        console.log(`Simulating payment for user ${userId}, product ${productId}, price ${price_paid}`);
        transaction_id = `MOCK_TXN_${Date.now()}_${userId}_${productId}`;
      }

      // 5. Insert into user_product_purchases
      const insertQuery = `
        INSERT INTO user_product_purchases (user_id, product_id, price_paid, transaction_id)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
      `;
      const { rows: [newPurchase] } = await db.query(insertQuery, [userId, productId, price_paid, transaction_id]);

      // 6. Return success with the new purchase record
      res.status(201).json({ success: true, message: 'Product acquired successfully.', purchase: newPurchase });

    } catch (error) {
      console.error(`Error acquiring product ${productId} for user ${userId}:`, error.stack);
      if (error.code === '23505') { // Unique constraint violation (user_id, product_id)
        return res.status(409).json({ success: false, message: 'Conflict: Purchase record might already exist or race condition occurred.' });
      }
      res.status(500).json({ success: false, message: 'Server error acquiring product.' });
    }
});

// GET /api/marketplace/products/:productId/download/:fileId - Download a specific content file for an acquired product
router.get('/:productId/download/:fileId', verifyToken, [
    param('productId').isInt({ gt: 0 }).withMessage('Product ID must be a positive integer.'),
    param('fileId').isInt({ gt: 0 }).withMessage('File ID must be a positive integer.')
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { productId, fileId } = req.params;
    const userId = req.user.id;

    try {
      // 1. Check if user acquired the product
      const purchaseCheck = await db.query(
        'SELECT id FROM user_product_purchases WHERE user_id = $1 AND product_id = $2',
        [userId, productId]
      );
      if (purchaseCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Access denied: Product not acquired or purchase record not found.' });
      }

      // 2. Fetch product's content_file_ids and the specific file's details
      const fileAccessQuery = `
        SELECT
          mp.content_file_ids,
          uf.file_path,
          uf.file_name,
          uf.mime_type
        FROM marketplace_products mp
        JOIN uploaded_files uf ON uf.id = $1 -- Param for fileId
        WHERE mp.id = $2; -- Param for productId
      `;
      const { rows: [productAndFileData] } = await db.query(fileAccessQuery, [fileId, productId]);

      // 3. If product or file metadata not found
      if (!productAndFileData) {
        return res.status(404).json({ success: false, message: 'Product or file not found.' });
      }

      const { content_file_ids, file_path, file_name, mime_type } = productAndFileData;

      // 4. Verify fileId is actually in product.content_file_ids array
      if (!content_file_ids || !content_file_ids.includes(parseInt(fileId))) {
        return res.status(403).json({ success: false, message: 'Access denied: File not part of this product\'s content or content IDs missing.' });
      }

      // 5. Construct absolute file path
      // file_path from uploaded_files is expected to be relative to the UPLOAD_DIR_ROOT
      // e.g., if UPLOAD_DIR_ROOT is /app/uploads and file_path is 'product_files/xyz.pdf'
      // then absoluteFilePath will be /app/uploads/product_files/xyz.pdf
      const absoluteFilePath = path.join(UPLOAD_DIR_ROOT, file_path);

      // 6. Send the file for download
      // res.download() sets Content-Disposition to 'attachment', prompting download.
      // It can also infer Content-Type from file extension, but explicit is safer.
      res.setHeader('Content-Type', mime_type || 'application/octet-stream');
      res.download(absoluteFilePath, file_name, (err) => {
        if (err) {
          console.error(`File download error for fileId ${fileId}, path ${absoluteFilePath}:`, err);
          // Avoid sending another response if headers already sent
          if (!res.headersSent) {
            res.status(500).send({ success: false, message: 'Error downloading file. Check server logs.'});
          }
        }
      });

    } catch (error) {
      console.error(`Error processing download for product ${productId}, file ${fileId}, user ${userId}:`, error.stack);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Server error processing download.' });
      }
    }
});


module.exports = router;
