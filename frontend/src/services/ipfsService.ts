// IPFS Service for file uploads
export interface IPFSUploadResult {
  hash: string;
  url: string;
  filename: string;
  size: number;
}

class IPFSService {
  private pinataApiKey: string;
  private pinataSecretKey: string;
  private pinataGateway: string;

  constructor() {
    // These should be set in environment variables
    this.pinataApiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY || '';
    this.pinataSecretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || '';
    this.pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'https://gateway.pinata.cloud/ipfs/';
  }

  /**
   * Upload a single file to IPFS via Pinata
   */
  async uploadFile(file: File, metadata?: any): Promise<IPFSUploadResult> {
    if (!this.pinataApiKey || !this.pinataSecretKey) {
      throw new Error('Pinata API credentials not configured');
    }

    const formData = new FormData();
    formData.append('file', file);

    // Add metadata if provided
    if (metadata) {
      formData.append('pinataMetadata', JSON.stringify({
        name: metadata.name || file.name,
        keyvalues: metadata.keyvalues || {}
      }));
    }

    // Pinata options
    formData.append('pinataOptions', JSON.stringify({
      cidVersion: 1,
      wrapWithDirectory: false
    }));

    try {
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Pinata upload failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      
      return {
        hash: result.IpfsHash,
        url: `${this.pinataGateway}${result.IpfsHash}`,
        filename: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('IPFS upload error:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files to IPFS
   */
  async uploadFiles(files: File[], metadata?: any): Promise<IPFSUploadResult[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(file, {
        ...metadata,
        name: `${metadata?.name || 'file'}_${file.name}`
      })
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Multiple file upload error:', error);
      throw error;
    }
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data: any, filename: string = 'metadata.json'): Promise<IPFSUploadResult> {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const file = new File([blob], filename, { type: 'application/json' });
    
    return this.uploadFile(file, {
      name: filename,
      keyvalues: {
        type: 'json',
        content: 'metadata'
      }
    });
  }

  /**
   * Get file from IPFS
   */
  getFileUrl(hash: string): string {
    return `${this.pinataGateway}${hash}`;
  }

  /**
   * Check if IPFS service is configured
   */
  isConfigured(): boolean {
    return !!(this.pinataApiKey && this.pinataSecretKey);
  }

  /**
   * Fallback upload to backend if IPFS is not configured
   */
  async uploadToBackend(files: File[]): Promise<IPFSUploadResult[]> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result.files || [];
    } catch (error) {
      console.error('Backend upload error:', error);
      throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Smart upload - tries IPFS first, falls back to backend
   */
  async smartUpload(files: File[], metadata?: any): Promise<IPFSUploadResult[]> {
    if (this.isConfigured()) {
      try {
        return await this.uploadFiles(files, metadata);
      } catch (error) {
        console.warn('IPFS upload failed, trying backend fallback:', error);
        return await this.uploadToBackend(files);
      }
    } else {
      console.log('IPFS not configured, using backend upload');
      return await this.uploadToBackend(files);
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();
export default ipfsService;
