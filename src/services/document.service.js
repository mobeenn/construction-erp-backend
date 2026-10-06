const Document = require("../models/Document");
const fs = require("fs");
const path = require("path");

const UPLOAD_BASE = path.join(__dirname, "..", "..", "uploads", "documents");

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_BASE)) {
   fs.mkdirSync(UPLOAD_BASE, { recursive: true });
}

/**
 * Map entity type to the corresponding database field
 */
const entityTypeToField = {
   project: "project",
   contract: "contract",
   client: "client",
   purchaseOrder: "purchaseOrder",
   grn: "grn",
   vendor: "vendor",
   interimPayment: "interimPayment",
   expense: "expense",
   employee: "employee",
   dailyReport: "dailyReport",
};

/**
 * Get the entity ID based on entity type
 */
const getEntityId = (data) => {
   const field = entityTypeToField[data.entityType];
   return field ? data[field] : null;
};

/**
 * Create a new document record
 */
exports.createDocument = async (data, userId, file = null) => {
   const docData = {
      name: data.name || file?.originalname || "Unnamed",
      entityType: data.entityType,
      entityId: data.entityId,
      description: data.description || "",
      uploadedBy: userId,
   };

   // Set the appropriate entity reference
   const field = entityTypeToField[data.entityType];
   if (field && data[field]) {
      docData[field] = data[field];
   }

   // If file was uploaded, include file metadata
   if (file) {
      docData.fileType = file.mimetype;
      docData.size = file.size;
      docData.url = `/uploads/documents/${file.filename}`;
   } else if (data.url) {
      docData.url = data.url;
      docData.fileType = data.fileType || "";
      docData.size = data.size || 0;
   }

   return await Document.create(docData);
};

/**
 * Get all documents with optional filtering
 */
exports.getAllDocuments = async (filters = {}) => {
   const query = { isActive: true };

   if (filters.entityType) query.entityType = filters.entityType;
   if (filters.entityId) query.entityId = filters.entityId;
   if (filters.project) query.project = filters.project;
   if (filters.contract) query.contract = filters.contract;
   if (filters.client) query.client = filters.client;
   if (filters.purchaseOrder) query.purchaseOrder = filters.purchaseOrder;
   if (filters.grn) query.grn = filters.grn;
   if (filters.vendor) query.vendor = filters.vendor;
   if (filters.interimPayment) query.interimPayment = filters.interimPayment;
   if (filters.expense) query.expense = filters.expense;
   if (filters.employee) query.employee = filters.employee;
   if (filters.dailyReport) query.dailyReport = filters.dailyReport;

   return await Document.find(query)
      .populate("uploadedBy", "name email")
      .populate("project", "name")
      .populate("contract", "contractNo")
      .populate("client", "name clientCode")
      .populate("purchaseOrder", "poNumber")
      .populate("grn", "grnNumber")
      .populate("vendor", "name vendorCode")
      .populate("interimPayment", "billNo")
      .populate("expense", "expenseNo")
      .populate("employee", "name employeeCode")
      .sort({ createdAt: -1 });
};

/**
 * Get a single document by ID
 */
exports.getDocumentById = async (id) => {
   return await Document.findById(id)
      .populate("uploadedBy", "name email")
      .populate("project", "name")
      .populate("contract", "contractNo")
      .populate("client", "name clientCode")
      .populate("purchaseOrder", "poNumber")
      .populate("grn", "grnNumber")
      .populate("vendor", "name vendorCode")
      .populate("interimPayment", "billNo")
      .populate("expense", "expenseNo")
      .populate("employee", "name employeeCode");
};

/**
 * Update a document
 */
exports.updateDocument = async (id, data) => {
   return await Document.findByIdAndUpdate(id, data, { new: true });
};

/**
 * Soft delete a document
 */
exports.softDeleteDocument = async (id) => {
   return await Document.findByIdAndUpdate(id, { isActive: false }, { new: true });
};

/**
 * Hard delete a document and optionally remove the file
 */
exports.hardDeleteDocument = async (id, removeFile = false) => {
   const doc = await Document.findById(id);
   if (!doc) return null;

   // Remove file from disk if requested
   if (removeFile && doc.url) {
      const filePath = path.join(__dirname, "..", "..", doc.url);
      try {
         if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
         }
      } catch (error) {
         // File may already be deleted, continue
      }
   }

   return await Document.findByIdAndDelete(id);
};

/**
 * Get documents by entity type and ID
 */
exports.getDocumentsByEntity = async (entityType, entityId) => {
   const query = { entityType, entityId, isActive: true };
   return await Document.find(query)
      .populate("uploadedBy", "name email")
      .sort({ createdAt: -1 });
};

/**
 * Get file path for download
 */
exports.getFilePath = (url) => {
   return path.join(__dirname, "..", "..", url);
};

/**
 * Check if file exists
 */
exports.fileExists = (filePath) => {
   return fs.existsSync(filePath);
};

/**
 * Get upload base path
 */
exports.getUploadBasePath = () => UPLOAD_BASE;
