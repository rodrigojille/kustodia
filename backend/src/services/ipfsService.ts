import axios from 'axios';
import FormData from 'form-data';

class IPFSService {
  private pinataApiKey: string;
  private pinataSecretApiKey: string;
  private pinataJWT: string;

  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY || '';
    this.pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY || '';
    this.pinataJWT = process.env.PINATA_JWT || '';

    if (!this.pinataJWT) {
      console.warn('[IPFS] Pinata credentials not configured - IPFS functionality will be disabled');
    } else {
      console.log('[IPFS] Service initialized successfully');
    }
  }

  /**
   * Upload JSON metadata to IPFS via Pinata
   */
  async uploadMetadata(metadata: any, name: string = 'NFT Metadata'): Promise<string> {
    try {
      if (!this.pinataJWT) {
        throw new Error('Pinata JWT not configured');
      }

      console.log('[IPFS] Uploading metadata to IPFS:', name);

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinJSONToIPFS',
        {
          pinataContent: metadata,
          pinataMetadata: {
            name: name,
            keyvalues: {
              type: 'nft-metadata',
              timestamp: new Date().toISOString()
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.pinataJWT}`
          }
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      console.log('[IPFS] Metadata uploaded successfully:', ipfsUrl);
      return ipfsUrl;

    } catch (error) {
      console.error('[IPFS] Error uploading metadata:', error);
      throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload file to IPFS via Pinata
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string = 'image/png'): Promise<string> {
    try {
      if (!this.pinataJWT) {
        throw new Error('Pinata JWT not configured');
      }

      console.log('[IPFS] Uploading file to IPFS:', fileName);

      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: mimeType
      });

      formData.append('pinataMetadata', JSON.stringify({
        name: fileName,
        keyvalues: {
          type: 'nft-image',
          timestamp: new Date().toISOString()
        }
      }));

      formData.append('pinataOptions', JSON.stringify({
        cidVersion: 1
      }));

      const response = await axios.post(
        'https://api.pinata.cloud/pinning/pinFileToIPFS',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'Authorization': `Bearer ${this.pinataJWT}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      const ipfsHash = response.data.IpfsHash;
      const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
      
      console.log('[IPFS] File uploaded successfully:', ipfsUrl);
      return ipfsUrl;

    } catch (error) {
      console.error('[IPFS] Error uploading file:', error);
      throw new Error(`Failed to upload file to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate a placeholder image for vehicle NFTs
   */
  generateVehicleImageSVG(vehicleData: any): string {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)"/>
        <text x="200" y="50" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">
          🚗 Kustodia NFT
        </text>
        <text x="200" y="100" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="white">
          ${vehicleData.make} ${vehicleData.model}
        </text>
        <text x="200" y="130" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="white">
          Año: ${vehicleData.year}
        </text>
        <text x="200" y="160" font-family="Arial, sans-serif" font-size="14" text-anchor="middle" fill="white">
          VIN: ${vehicleData.vin}
        </text>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.8)">
          Gemelo Digital Vehicular
        </text>
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="12" text-anchor="middle" fill="rgba(255,255,255,0.8)">
          Verificado por Kustodia
        </text>
        <text x="200" y="260" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="rgba(255,255,255,0.6)">
          Blockchain: Arbitrum • Red: Sepolia
        </text>
      </svg>
    `;
    return svg;
  }

  /**
   * Upload vehicle image to IPFS
   */
  async uploadVehicleImage(vehicleData: any): Promise<string> {
    try {
      const svg = this.generateVehicleImageSVG(vehicleData);
      const svgBuffer = Buffer.from(svg, 'utf8');
      
      const fileName = `vehicle-${vehicleData.vin}-${Date.now()}.svg`;
      return await this.uploadFile(svgBuffer, fileName, 'image/svg+xml');
    } catch (error) {
      console.error('[IPFS] Error uploading vehicle image:', error);
      // Return a fallback placeholder
      return 'https://via.placeholder.com/400x300/667eea/ffffff?text=Kustodia+Vehicle+NFT';
    }
  }
}

export default new IPFSService();
