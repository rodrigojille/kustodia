interface DocumentType {
  id: string;
  name: string;
  description: string;
  required: boolean;
  acceptedFormats: string[];
  maxSizeMB: number;
  vertical: string[];
}

interface UploadedDocument {
  id: string;
  documentTypeId: string;
  fileName: string;
  fileSize: number;
  uploadedAt: Date;
  status: 'uploading' | 'uploaded' | 'verifying' | 'verified' | 'rejected';
  verificationResult?: {
    isValid: boolean;
    confidence: number;
    issues: string[];
    extractedData?: any;
  };
  url?: string;
}

interface DocumentVerificationResult {
  documentId: string;
  isValid: boolean;
  confidence: number;
  extractedData: any;
  issues: string[];
  processingTime: number;
}

export class DocumentUploadService {
  private static instance: DocumentUploadService;
  private baseUrl = process.env.NODE_ENV === 'production' 
    ? 'https://kustodia-backend-39ad4d1c3a78.herokuapp.com'
    : 'http://localhost:4000';

  static getInstance(): DocumentUploadService {
    if (!DocumentUploadService.instance) {
      DocumentUploadService.instance = new DocumentUploadService();
    }
    return DocumentUploadService.instance;
  }

  // Document types by vertical
  private documentTypes: DocumentType[] = [
    // Real Estate Documents
    {
      id: 'escritura_publica',
      name: 'Escritura Pública',
      description: 'Documento que acredita la propiedad del inmueble',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 10,
      vertical: ['real_estate', 'inmobiliarias']
    },
    {
      id: 'certificado_libertad_gravamen',
      name: 'Certificado de Libertad de Gravamen',
      description: 'Documento que certifica que la propiedad está libre de gravámenes',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 5,
      vertical: ['real_estate', 'inmobiliarias']
    },
    {
      id: 'predial_corriente',
      name: 'Predial al Corriente',
      description: 'Comprobante de pago del impuesto predial actualizado',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 5,
      vertical: ['real_estate', 'inmobiliarias']
    },
    {
      id: 'identificacion_oficial',
      name: 'Identificación Oficial',
      description: 'INE, pasaporte o cédula profesional vigente',
      required: true,
      acceptedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
      maxSizeMB: 5,
      vertical: ['real_estate', 'inmobiliarias', 'freelancer', 'marketplace', 'b2b']
    },
    // Vehicle Documents
    {
      id: 'tarjeta_circulacion',
      name: 'Tarjeta de Circulación',
      description: 'Documento oficial del vehículo',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 5,
      vertical: ['vehicles', 'compra_venta']
    },
    {
      id: 'factura_vehiculo',
      name: 'Factura del Vehículo',
      description: 'Factura original de compra del vehículo',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 10,
      vertical: ['vehicles', 'compra_venta']
    },
    // Freelancer Documents
    {
      id: 'contrato_servicios',
      name: 'Contrato de Servicios',
      description: 'Contrato que especifica los servicios a realizar',
      required: true,
      acceptedFormats: ['pdf', 'doc', 'docx'],
      maxSizeMB: 5,
      vertical: ['freelancer']
    },
    {
      id: 'portafolio_trabajos',
      name: 'Portafolio de Trabajos',
      description: 'Ejemplos de trabajos anteriores',
      required: false,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png', 'zip'],
      maxSizeMB: 20,
      vertical: ['freelancer']
    },
    // B2B Documents
    {
      id: 'rfc_empresa',
      name: 'RFC de la Empresa',
      description: 'Registro Federal de Contribuyentes',
      required: true,
      acceptedFormats: ['pdf', 'jpg', 'jpeg', 'png'],
      maxSizeMB: 5,
      vertical: ['b2b']
    },
    {
      id: 'acta_constitutiva',
      name: 'Acta Constitutiva',
      description: 'Documento de constitución de la empresa',
      required: true,
      acceptedFormats: ['pdf'],
      maxSizeMB: 10,
      vertical: ['b2b']
    }
  ];

  getDocumentTypes(vertical: string): DocumentType[] {
    return this.documentTypes.filter(doc => doc.vertical.includes(vertical));
  }

  getRequiredDocuments(vertical: string): DocumentType[] {
    return this.getDocumentTypes(vertical).filter(doc => doc.required);
  }

  async uploadDocument(
    file: File, 
    documentTypeId: string, 
    paymentId?: string,
    metadata?: any
  ): Promise<UploadedDocument> {
    const documentType = this.documentTypes.find(dt => dt.id === documentTypeId);
    if (!documentType) {
      throw new Error(`Document type ${documentTypeId} not found`);
    }

    // Validate file
    this.validateFile(file, documentType);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTypeId', documentTypeId);
    if (paymentId) formData.append('paymentId', paymentId);
    if (metadata) formData.append('metadata', JSON.stringify(metadata));

    try {
      const response = await fetch(`${this.baseUrl}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        id: result.id,
        documentTypeId,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date(),
        status: 'uploaded',
        url: result.url
      };
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    }
  }

  async verifyDocument(documentId: string): Promise<DocumentVerificationResult> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${this.baseUrl}/api/documents/${documentId}/verify`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      return {
        documentId,
        isValid: result.isValid,
        confidence: result.confidence,
        extractedData: result.extractedData,
        issues: result.issues || [],
        processingTime: Date.now() - startTime
      };
    } catch (error) {
      console.error('Document verification failed:', error);
      throw error;
    }
  }

  async getDocumentStatus(documentId: string): Promise<UploadedDocument> {
    try {
      const response = await fetch(`${this.baseUrl}/api/documents/${documentId}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to get document status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get document status:', error);
      throw error;
    }
  }

  async getPaymentDocuments(paymentId: string): Promise<UploadedDocument[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/payments/${paymentId}/documents`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to get payment documents: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get payment documents:', error);
      throw error;
    }
  }

  private validateFile(file: File, documentType: DocumentType): void {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > documentType.maxSizeMB) {
      throw new Error(`File size (${fileSizeMB.toFixed(1)}MB) exceeds maximum allowed size (${documentType.maxSizeMB}MB)`);
    }

    // Check file format
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !documentType.acceptedFormats.includes(fileExtension)) {
      throw new Error(`File format .${fileExtension} not accepted. Allowed formats: ${documentType.acceptedFormats.join(', ')}`);
    }
  }

  // Mock verification for demo purposes
  async mockVerifyDocument(documentType: string): Promise<DocumentVerificationResult> {
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    const mockResults: { [key: string]: Partial<DocumentVerificationResult> } = {
      escritura_publica: {
        isValid: true,
        confidence: 0.95,
        extractedData: {
          propertyAddress: 'Av. Insurgentes Sur 123, Col. Roma Norte',
          ownerName: 'Juan Pérez García',
          propertyValue: 2500000,
          registrationNumber: 'RP-2024-001234'
        },
        issues: []
      },
      certificado_libertad_gravamen: {
        isValid: true,
        confidence: 0.92,
        extractedData: {
          propertyId: 'RP-2024-001234',
          status: 'Libre de gravámenes',
          issueDate: '2024-01-15'
        },
        issues: []
      },
      predial_corriente: {
        isValid: true,
        confidence: 0.88,
        extractedData: {
          propertyId: 'RP-2024-001234',
          paymentYear: 2024,
          amount: 15000,
          status: 'Al corriente'
        },
        issues: []
      },
      identificacion_oficial: {
        isValid: true,
        confidence: 0.97,
        extractedData: {
          name: 'Juan Pérez García',
          idNumber: 'PEGJ850315HDFRRN01',
          expirationDate: '2029-03-15'
        },
        issues: []
      }
    };

    const result = mockResults[documentType] || {
      isValid: Math.random() > 0.1,
      confidence: 0.8 + Math.random() * 0.2,
      extractedData: {},
      issues: Math.random() > 0.8 ? ['Minor formatting issue detected'] : []
    };

    return {
      documentId: `doc_${Date.now()}`,
      processingTime: 1500 + Math.random() * 2000,
      ...result
    } as DocumentVerificationResult;
  }

  // Generate document checklist for a vertical
  generateDocumentChecklist(vertical: string, paymentAmount?: number): {
    required: DocumentType[];
    optional: DocumentType[];
    estimatedVerificationTime: number;
  } {
    const allDocs = this.getDocumentTypes(vertical);
    const required = allDocs.filter(doc => doc.required);
    const optional = allDocs.filter(doc => !doc.required);

    // Estimate verification time based on document count and payment amount
    let baseTime = required.length * 2 + optional.length * 1; // minutes
    if (paymentAmount && paymentAmount > 1000000) {
      baseTime *= 1.5; // Higher value transactions take longer
    }

    return {
      required,
      optional,
      estimatedVerificationTime: Math.ceil(baseTime)
    };
  }
}

export default DocumentUploadService;
