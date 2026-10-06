const Document = require("../../models/Document");
const { documentSchema, updateDocumentSchema } = require("../../validators/document.validation");
const {
   createDocument,
   getAllDocuments,
   getDocumentById,
   updateDocument,
   softDeleteDocument,
   hardDeleteDocument,
   getDocumentsByEntity,
   getFilePath,
   fileExists,
} = require("../../services/document.service");

/**
 * Upload and create a new document
 */
exports.upload = async (req, res) => {
   try {
      const data = documentSchema.parse(req.body);
      const document = await createDocument(data, req.user._id, req.file);
      res.status(201).json({ success: true, data: document });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

/**
 * Create a document record without file upload
 */
exports.create = async (req, res) => {
   try {
      const data = documentSchema.parse(req.body);
      const document = await createDocument(data, req.user._id);
      res.status(201).json({ success: true, data: document });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

/**
 * Get all documents with optional filtering
 */
exports.getAll = async (req, res) => {
   try {
      const documents = await getAllDocuments(req.query);
      res.status(200).json({ success: true, data: documents });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Get documents by entity type and ID
 */
exports.getByEntity = async (req, res) => {
   try {
      const { entityType, entityId } = req.params;
      const documents = await getDocumentsByEntity(entityType, entityId);
      res.status(200).json({ success: true, data: documents });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Get a single document by ID
 */
exports.getById = async (req, res) => {
   try {
      const document = await getDocumentById(req.params.id);
      if (!document) {
         return res.status(404).json({ success: false, message: "Document not found" });
      }
      res.status(200).json({ success: true, data: document });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Update a document
 */
exports.update = async (req, res) => {
   try {
      const data = updateDocumentSchema.parse(req.body);
      const document = await updateDocument(req.params.id, data);
      if (!document) {
         return res.status(404).json({ success: false, message: "Document not found" });
      }
      res.status(200).json({ success: true, data: document });
   } catch (error) {
      res.status(400).json({ success: false, message: error.message });
   }
};

/**
 * Download a document file
 */
exports.download = async (req, res) => {
   try {
      const document = await getDocumentById(req.params.id);
      if (!document) {
         return res.status(404).json({ success: false, message: "Document not found" });
      }

      if (!document.url) {
         return res.status(404).json({ success: false, message: "No file associated with this document" });
      }

      const filePath = getFilePath(document.url);
      if (!fileExists(filePath)) {
         return res.status(404).json({ success: false, message: "File not found on server" });
      }

      return res.download(filePath, document.name);
   } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Soft delete a document
 */
exports.remove = async (req, res) => {
   try {
      const document = await softDeleteDocument(req.params.id);
      if (!document) {
         return res.status(404).json({ success: false, message: "Document not found" });
      }
      res.status(200).json({ success: true, message: "Document deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};

/**
 * Hard delete a document and its file
 */
exports.hardDelete = async (req, res) => {
   try {
      const document = await hardDeleteDocument(req.params.id, true);
      if (!document) {
         return res.status(404).json({ success: false, message: "Document not found" });
      }
      res.status(200).json({ success: true, message: "Document and file deleted" });
   } catch (error) {
      res.status(500).json({ success: false, message: error.message });
   }
};
