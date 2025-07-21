import * as puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Payment } from '../entity/Payment';
import { User } from '../entity/User';
import { JunoTransaction } from '../entity/JunoTransaction';
import { listJunoTransactions, getWithdrawalStatus } from './junoService';

export interface SPEIReceiptData {
  // Transaction Info
  transactionId: string;
  junoTransactionId?: string;
  amount: number;
  currency: string;
  status: 'PROCESSING' | 'SUCCEEDED' | 'FAILED';
  createdAt: Date;
  updatedAt?: Date;
  
  // Payment Info
  paymentId: number;
  paymentDescription?: string;
  escrowId?: number;
  
  // Recipient Info
  recipientName: string;
  recipientEmail: string;
  bankAccountId?: string;
  clabe?: string;
  
  // Sender Info (Platform)
  senderName: string;
  senderInfo: string;
  
  // Additional Details
  reference?: string;
  concept?: string;
  speiReference?: string;
  
  // Fees & Commissions
  originalAmount?: number;
  commissionAmount?: number;
  netAmount: number;
  
  // Security & Compliance (Mexican CEP Requirements - Banxico)
  digitalSignature?: string;        // Sello Digital
  verificationHash?: string;        // Hash de Verificación
  certificateSerial?: string;       // Número de Serie del Certificado
  originalChain?: string;           // Cadena Original
  securitySeal?: string;           // Sello de Seguridad
  complianceCode?: string;         // Código de Cumplimiento
  institutionCode?: string;        // Código de Institución
  
  // SPEI-specific CEP fields (required by Banxico)
  trackingKey?: string;            // Clave de Rastreo (up to 30 alphanumeric)
  referenceNumber?: string;        // Número de Referencia (up to 7 digits)
  sendingBank?: string;            // Banco Emisor (buyer's bank)
  receivingBank?: string;          // Banco Receptor (recipient's bank)
  operationDate?: Date;            // Fecha de Operación
  speiTransactionId?: string;      // ID de Transacción SPEI
  
  // Kustodia-specific fields for custody flow
  originalSenderName?: string;     // Original buyer/payer name
  custodyProvider?: string;        // Kustodia as custody provider
  paymentProcessor?: string;       // Nvio as payment processor
  originalDepositAmount?: number;  // Original deposit amount from buyer
}

export interface SPEIReceiptOptions {
  includeQRCode?: boolean;
  includeTimeline?: boolean;
  format?: 'pdf' | 'html';
  language?: 'es' | 'en';
  logoUrl?: string;
}

/**
 * Generate SPEI receipt for payout transactions
 */
export class SPEIReceiptService {
  private static readonly RECEIPT_TEMPLATE_PATH = path.join(__dirname, '../templates/spei-receipt.html');
  private static readonly TEMP_DIR = path.join(__dirname, '../../temp/receipts');
  
  // Mexican Banking Security Constants (CEP Compliance)
  // Nvio is the actual bank emisor for SPEI transfers
  private static readonly NVIO_INSTITUTION_CODE = 'NVIO001';
  private static readonly NVIO_BANK_NAME = 'Nvio Pagos México';
  private static readonly KUSTODIA_SERVICE_NAME = 'Kustodia';
  private static readonly SECURITY_ALGORITHM = 'sha256';
  private static readonly DIGITAL_SIGNATURE_KEY = process.env.SPEI_SIGNATURE_KEY || 'nvio-spei-2024-secure-key';
  
  // SPEI/CEP Constants
  private static readonly SPEI_CERTIFICATE_SERIAL_PREFIX = 'NVI';
  private static readonly CEP_VERSION = '1.0';
  
  /**
   * Generate SPEI tracking key (Clave de Rastreo) - up to 30 alphanumeric characters
   */
  private static generateTrackingKey(receiptData: SPEIReceiptData): string {
    const timestamp = receiptData.createdAt.getTime().toString();
    const paymentId = receiptData.paymentId.toString().padStart(6, '0');
    const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return `${this.SPEI_CERTIFICATE_SERIAL_PREFIX}${paymentId}${timestamp.slice(-8)}${randomSuffix}`.substring(0, 30);
  }
  
  /**
   * Generate reference number (7 digits max)
   * Generate SPEI reference number (Número de Referencia) - up to 7 digits
   */
  private static generateReferenceNumber(receiptData: SPEIReceiptData): string {
    // Use payment ID as base, ensuring it fits in 7 digits
    const paymentId = receiptData.paymentId % 9999999; // Ensure max 7 digits
    return paymentId.toString().padStart(7, '0');
  }

  /**
   * Get bank name from CLABE code (first 3 digits)
   */
  private static getBankNameFromClabe(clabe: string): string {
    if (!clabe || clabe.length < 3) return 'Banco Desconocido';
    
    const bankCode = clabe.substring(0, 3);
    const bankMap: { [key: string]: string } = {
      '002': 'Banamex',
      '012': 'BBVA México',
      '014': 'Santander México',
      '019': 'Banco Nacional de México',
      '021': 'HSBC México',
      '030': 'Banco Bajío',
      '032': 'IXE Banco',
      '036': 'Inbursa',
      '037': 'Interacciones',
      '042': 'Mifel',
      '044': 'Scotiabank México',
      '058': 'Banco Regional de Monterrey',
      '059': 'Invex',
      '060': 'Bansi',
      '062': 'Afirme',
      '072': 'Banorte',
      '103': 'American Express',
      '106': 'Bank of America',
      '108': 'Tokyo',
      '110': 'JP Morgan',
      '112': 'Bmonex',
      '113': 'Ve por Más',
      '116': 'Credit Suisse',
      '124': 'Deutsche Bank',
      '126': 'Credit Agricole',
      '127': 'Azteca',
      '128': 'Autofin',
      '129': 'Barclays',
      '130': 'Compartamos',
      '131': 'Banco Famsa',
      '132': 'BMULTIVA',
      '133': 'Actinver',
      '134': 'WAL-MART',
      '135': 'Nafin',
      '136': 'Interbanco',
      '137': 'Bancoppel',
      '138': 'ABC Capital',
      '139': 'UBS Bank',
      '140': 'Consubanco',
      '141': 'Volkswagen Bank',
      '143': 'CIBanco',
      '145': 'Bbase',
      '166': 'Bansefi',
      '168': 'Hipotecaria Federal',
      '600': 'Monexcb',
      '601': 'GBM',
      '602': 'Masari',
      '605': 'Value',
      '606': 'Estructuradores',
      '607': 'Tiber',
      '608': 'Vector',
      '610': 'B&B',
      '614': 'Accival',
      '615': 'Merrill Lynch',
      '616': 'Finamex',
      '617': 'Valmex',
      '618': 'Unica',
      '630': 'Intercam Banco',
      '631': 'Multiva Chubb',
      '632': 'Finamex',
      '633': 'Mediolanum',
      '634': 'Swiss Bank',
      '636': 'Unagra',
      '637': 'Mapfre',
      '638': 'Afore Banamex',
      '640': 'CB Actinver',
      '642': 'Oactin',
      '646': 'STP',
      '647': 'Telecomunicaciones de México',
      '648': 'Evercore',
      '649': 'Skandia',
      '651': 'Segmty',
      '652': 'Asea',
      '653': 'Kuspit',
      '655': 'Sofiexpress',
      '656': 'Unisolucion',
      '659': 'Opciones Empresariales del Noroeste',
      '670': 'Libertad Servicios Financieros',
      '674': 'ArkCapital',
      '677': 'Caja Popular Mexicana',
      '679': 'Caja de Ahorro de los Telefonistas',
      '684': 'Nvio Pagos México',
      '710': 'Nvio',
      '901': 'Cls Bank International',
      '902': 'Indeval'
    };
    
    return bankMap[bankCode] || `Banco ${bankCode}`;
  }
  
  /**
   * Generate security elements for Mexican CEP compliance (Banxico requirements)
   */
  private static generateSecurityElements(receiptData: SPEIReceiptData): {
    digitalSignature: string;
    verificationHash: string;
    certificateSerial: string;
    originalChain: string;
    securitySeal: string;
    complianceCode: string;
    trackingKey: string;
    referenceNumber: string;
    sendingBank: string;
    receivingBank: string;
    operationDate: Date;
  } {
    // Generate SPEI-specific fields first
    const trackingKey = this.generateTrackingKey(receiptData);
    const referenceNumber = this.generateReferenceNumber(receiptData);
    const operationDate = receiptData.createdAt;
    
    // Correct banking flow: Nvio is the actual bank emisor for SPEI transfers
    // Kustodia only instructs Nvio to execute the transfer
    const sendingBank = this.NVIO_BANK_NAME;
    const receivingBank = this.getBankNameFromClabe(receiptData.clabe || '') || 'Banco del Beneficiario';
    
    // Create original chain (cadena original) - CEP format as per Banxico requirements
    const originalChain = [
      this.CEP_VERSION,                                    // Version del CEP
      receiptData.transactionId,                          // ID de Transacción
      trackingKey,                                        // Clave de Rastreo
      referenceNumber,                                    // Número de Referencia
      receiptData.amount.toFixed(2),                      // Monto (2 decimales)
      receiptData.currency,                               // Moneda
      operationDate.toISOString().split('T')[0],          // Fecha de Operación (YYYY-MM-DD)
      sendingBank,                                        // Banco Emisor
      receivingBank,                                      // Banco Receptor
      receiptData.recipientName,                          // Beneficiario
      receiptData.clabe || receiptData.bankAccountId || '', // CLABE/Cuenta
      receiptData.concept || receiptData.paymentDescription || '', // Concepto
      this.NVIO_INSTITUTION_CODE                      // Código de Institución
    ].join('||'); // Using double pipe as separator for CEP format
    
    // Generate verification hash
    const verificationHash = crypto
      .createHash(this.SECURITY_ALGORITHM)
      .update(originalChain)
      .digest('hex')
      .toUpperCase();
    
    // Generate digital signature (sello digital)
    const digitalSignature = crypto
      .createHmac(this.SECURITY_ALGORITHM, this.DIGITAL_SIGNATURE_KEY)
      .update(originalChain)
      .digest('hex')
      .toUpperCase();
    
    // Generate certificate serial number
    const certificateSerial = crypto
      .createHash('md5')
      .update(`${this.NVIO_INSTITUTION_CODE}-${receiptData.transactionId}-${Date.now()}`)
      .digest('hex')
      .toUpperCase()
      .substring(0, 16);
    
    // Generate security seal
    const securitySeal = crypto
      .createHash(this.SECURITY_ALGORITHM)
      .update(`${digitalSignature}${verificationHash}${certificateSerial}`)
      .digest('hex')
      .toUpperCase()
      .substring(0, 32);
    
    // Generate compliance code (Mexican CEP format)
    const complianceCode = `CEP-${this.NVIO_INSTITUTION_CODE}-${receiptData.paymentId.toString().padStart(8, '0')}-${Date.now().toString().slice(-6)}`;
    
    return {
      digitalSignature,
      verificationHash,
      certificateSerial,
      originalChain,
      securitySeal,
      complianceCode,
      trackingKey,
      referenceNumber,
      sendingBank,
      receivingBank,
      operationDate
    };
  }
  

  
  /**
   * Validate security elements of a receipt
   */
  static validateReceiptSecurity(receiptData: SPEIReceiptData): boolean {
    if (!receiptData.digitalSignature || !receiptData.originalChain) {
      return false;
    }
    
    try {
      const expectedSignature = crypto
        .createHmac(this.SECURITY_ALGORITHM, this.DIGITAL_SIGNATURE_KEY)
        .update(receiptData.originalChain)
        .digest('hex')
        .toUpperCase();
      
      return expectedSignature === receiptData.digitalSignature;
    } catch (error) {
      console.error('[SPEI Security] Validation failed:', error);
      return false;
    }
  }
  
  /**
   * Generate QR code data for receipt verification
   */
  private static generateQRCodeData(receiptData: SPEIReceiptData): string {
    const qrData = {
      tx: receiptData.transactionId,
      amt: receiptData.amount,
      cur: receiptData.currency,
      ref: receiptData.speiReference,
      hash: receiptData.verificationHash,
      seal: receiptData.securitySeal,
      inst: this.NVIO_INSTITUTION_CODE,
      ts: receiptData.createdAt.getTime()
    };
    
    const params = new URLSearchParams();
    Object.entries(qrData).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    
    return `https://kustodia.com/verify-receipt?${params.toString()}`;
  }

  /**
   * Generate SPEI receipt from payment and Juno transaction data
   */
  static async generateReceiptFromPayment(
    payment: Payment,
    user: User,
    junoTransactionId?: string,
    options: SPEIReceiptOptions = {}
  ): Promise<Buffer> {
    // Fetch Juno transaction details if available
    let junoTransaction = null;
    if (junoTransactionId) {
      try {
        junoTransaction = await getWithdrawalStatus(junoTransactionId);
      } catch (error) {
        console.warn(`[SPEI Receipt] Could not fetch Juno transaction ${junoTransactionId}:`, error);
      }
    }

    // Build receipt data
    const receiptData: SPEIReceiptData = {
      transactionId: junoTransactionId || `PAY-${payment.id}-${Date.now()}`,
      junoTransactionId,
      amount: junoTransaction?.amount || Number(payment.amount),
      currency: junoTransaction?.currency?.toUpperCase() || payment.currency || 'MXN',
      status: junoTransaction?.summary_status || 'PROCESSING',
      createdAt: junoTransaction?.created_at ? new Date(junoTransaction.created_at) : payment.created_at,
      updatedAt: junoTransaction?.updated_at ? new Date(junoTransaction.updated_at) : payment.updated_at,
      
      paymentId: payment.id,
      paymentDescription: payment.description,
      escrowId: payment.escrow?.id,
      
      recipientName: user.full_name || user.email,
      recipientEmail: user.email,
      bankAccountId: payment.payout_juno_bank_account_id,
      clabe: user.payout_clabe,
      
      senderName: 'Kustodia',
      senderInfo: 'Plataforma de Pagos Seguros',
      
      reference: payment.reference || `KUSTODIA-${payment.id}`,
      concept: payment.description || 'Pago de custodia liberada',
      speiReference: `KUS${payment.id.toString().padStart(6, '0')}`,
      
      originalAmount: Number(payment.amount),
      commissionAmount: payment.commission_amount ? Number(payment.commission_amount) : 0,
      netAmount: junoTransaction?.amount || (Number(payment.amount) - (payment.commission_amount ? Number(payment.commission_amount) : 0)),
      institutionCode: this.NVIO_INSTITUTION_CODE
    };

    // Add security elements
    const securityElements = this.generateSecurityElements(receiptData);
    Object.assign(receiptData, securityElements);

    return this.generateReceipt(receiptData, options);
  }

  /**
   * Generate SPEI receipt from raw data
   */
  static async generateReceipt(
    data: SPEIReceiptData,
    options: SPEIReceiptOptions = {}
  ): Promise<Buffer> {
    // Ensure security elements are present
    if (!data.digitalSignature) {
      const securityElements = this.generateSecurityElements(data);
      Object.assign(data, securityElements);
    }
    
    const html = this.generateReceiptHTML(data, options);
    
    if (options.format === 'html') {
      return Buffer.from(html, 'utf8');
    }
    
    // Generate PDF using Puppeteer
    return this.generatePDF(html);
  }

  /**
   * Generate HTML receipt
   */
  private static generateReceiptHTML(data: SPEIReceiptData, options: SPEIReceiptOptions): string {
    const formatCurrency = (amount: number, currency: string = 'MXN') => {
      return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

    const formatDate = (date: Date) => {
      return format(date, "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
    };

    const statusText = {
      'PROCESSING': 'En Proceso',
      'SUCCEEDED': 'Completado',
      'FAILED': 'Fallido'
    }[data.status] || 'Desconocido';

    const statusColor = {
      'PROCESSING': '#f39c12',
      'SUCCEEDED': '#27ae60',
      'FAILED': '#e74c3c'
    }[data.status] || '#95a5a6';

    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Comprobante SPEI - Kustodia</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: #f8f9fa; 
            padding: 20px;
            color: #2c3e50;
        }
        .receipt-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        .header { 
            background: linear-gradient(135deg, #2e7ef7 0%, #1e5bb8 100%); 
            color: white; 
            padding: 30px;
            text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 8px; }
        .header p { font-size: 16px; opacity: 0.9; }
        .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            margin-top: 15px;
            background: ${statusColor};
            color: white;
        }
        .content { padding: 40px; }
        .section { margin-bottom: 30px; }
        .section h2 { 
            color: #2e7ef7; 
            font-size: 20px; 
            margin-bottom: 15px; 
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 8px;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-bottom: 20px;
        }
        .info-item { 
            padding: 15px; 
            background: #f8f9fa; 
            border-radius: 8px;
            border-left: 4px solid #2e7ef7;
        }
        .info-item label { 
            display: block; 
            font-weight: 600; 
            color: #6c757d; 
            font-size: 14px; 
            margin-bottom: 5px;
        }
        .info-item value { 
            display: block; 
            font-size: 16px; 
            color: #2c3e50;
        }
        .amount-highlight { 
            text-align: center; 
            padding: 25px; 
            background: linear-gradient(135deg, #e8f5e8 0%, #d4edda 100%); 
            border-radius: 12px;
            border: 2px solid #27ae60;
            margin: 20px 0;
        }
        .amount-highlight .amount { 
            font-size: 36px; 
            font-weight: bold; 
            color: #27ae60; 
            margin-bottom: 8px;
        }
        .amount-highlight .label { 
            font-size: 16px; 
            color: #6c757d;
        }
        .footer { 
            background: #f8f9fa; 
            padding: 25px; 
            text-align: center; 
            border-top: 1px solid #e9ecef;
        }
        .footer p { 
            color: #6c757d; 
            font-size: 14px; 
            margin-bottom: 5px;
        }
        .transaction-id { 
            font-family: 'Courier New', monospace; 
            background: #e9ecef; 
            padding: 8px 12px; 
            border-radius: 4px; 
            display: inline-block;
            font-weight: bold;
        }
        .qr-code { 
            text-align: center; 
            margin: 20px 0;
        }
        @media print {
            body { background: white; padding: 0; }
            .receipt-container { box-shadow: none; }
        }
        @media (max-width: 600px) {
            .info-grid { grid-template-columns: 1fr; }
            .content { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="receipt-container">
        <div class="header">
            <h1>Comprobante SPEI</h1>
            <p>Transferencia Electrónica de Fondos</p>
            <div class="status-badge">${statusText}</div>
        </div>
        
        <div class="content">
            <div class="section">
                <h2>Información de la Transferencia SPEI</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>ID de Transacción</label>
                        <value class="transaction-id">${data.transactionId}</value>
                    </div>
                    ${data.trackingKey ? `
                    <div class="info-item">
                        <label>Clave de Rastreo</label>
                        <value class="transaction-id">${data.trackingKey}</value>
                    </div>
                    ` : ''}
                    ${data.referenceNumber ? `
                    <div class="info-item">
                        <label>Número de Referencia</label>
                        <value class="transaction-id">${data.referenceNumber}</value>
                    </div>
                    ` : ''}
                    <div class="info-item">
                        <label>Referencia SPEI</label>
                        <value>${data.speiReference}</value>
                    </div>
                    <div class="info-item">
                        <label>Fecha de Operación</label>
                        <value>${formatDate(data.operationDate || data.createdAt)}</value>
                    </div>
                    <div class="info-item">
                        <label>Estado</label>
                        <value>${statusText}</value>
                    </div>
                    ${data.sendingBank && data.receivingBank ? `
                    <div class="info-item">
                        <label>Banco Emisor</label>
                        <value>${data.sendingBank}</value>
                    </div>
                    <div class="info-item">
                        <label>Banco Receptor</label>
                        <value>${data.receivingBank}</value>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="amount-highlight">
                <div class="amount">${formatCurrency(data.netAmount, data.currency)}</div>
                <div class="label">Monto Transferido</div>
            </div>

            <div class="section">
                <h2>Información del Beneficiario</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Nombre</label>
                        <value>${data.recipientName}</value>
                    </div>
                    <div class="info-item">
                        <label>Email</label>
                        <value>${data.recipientEmail}</value>
                    </div>
                    ${data.clabe ? `
                    <div class="info-item">
                        <label>CLABE</label>
                        <value>${data.clabe}</value>
                    </div>
                    ` : ''}
                    ${data.bankAccountId ? `
                    <div class="info-item">
                        <label>ID Cuenta Bancaria</label>
                        <value>${data.bankAccountId}</value>
                    </div>
                    ` : ''}
                </div>
            </div>

            <div class="section">
                <h2>Detalles del Pago</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>ID de Pago Kustodia</label>
                        <value>#${data.paymentId}</value>
                    </div>
                    <div class="info-item">
                        <label>Concepto</label>
                        <value>${data.concept}</value>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2>Información del Comprador Original</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <label>Nombre del Comprador</label>
                        <value>${data.originalSenderName || data.senderName}</value>
                    </div>
                    <div class="info-item">
                        <label>Monto del Depósito Original</label>
                        <value>${formatCurrency(data.originalDepositAmount || data.netAmount, data.currency)}</value>
                    </div>
                    <div class="info-item">
                        <label>Procesador de Pago</label>
                        <value>${data.paymentProcessor || this.NVIO_BANK_NAME}</value>
                    </div>
                    <div class="info-item">
                        <label>Fecha del Depósito</label>
                        <value>${formatDate(data.createdAt)}</value>
                    </div>
                </div>
            </div>

            ${data.digitalSignature ? `
            <div class="section">
                <h2>Comprobante Electrónico de Pago (CEP) - Elementos de Seguridad</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 20px 0;">
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Código de Cumplimiento</label>
                        <value style="font-family: 'Courier New', monospace; background: #e9ecef; padding: 8px 12px; border-radius: 4px; display: inline-block; font-weight: bold;">${data.complianceCode}</value>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Número de Serie del Certificado</label>
                        <value style="font-family: 'Courier New', monospace; font-size: 12px; word-break: break-all;">${data.certificateSerial}</value>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Hash de Verificación</label>
                        <value style="font-family: 'Courier New', monospace; font-size: 11px; word-break: break-all; color: #495057;">${data.verificationHash}</value>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Sello Digital</label>
                        <value style="font-family: 'Courier New', monospace; font-size: 10px; word-break: break-all; color: #495057; line-height: 1.4;">${data.digitalSignature}</value>
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Sello de Seguridad</label>
                        <value style="font-family: 'Courier New', monospace; font-size: 11px; word-break: break-all; color: #495057;">${data.securitySeal}</value>
                    </div>
                    <div>
                        <label style="font-weight: 600; color: #6c757d; font-size: 14px; display: block; margin-bottom: 5px;">Código de Institución</label>
                        <value style="font-family: 'Courier New', monospace; background: #e9ecef; padding: 8px 12px; border-radius: 4px; display: inline-block; font-weight: bold;">${data.institutionCode}</value>
                    </div>
                </div>
                <div style="background: #e8f5e8; padding: 15px; border-radius: 8px; border: 1px solid #28a745; margin-top: 20px;">
                    <p style="margin: 0; font-size: 14px; color: #155724;"><strong>✓ CEP Verificado:</strong> Este Comprobante Electrónico de Pago cumple con las regulaciones de Banxico (Banco de México) para transferencias SPEI. Los elementos de seguridad incluidos permiten la validación de autenticidad del documento.</p>
                    <p style="margin: 10px 0 0 0; font-size: 12px; color: #155724;">Conforme a las disposiciones del Sistema de Pagos Electrónicos Interbancarios (SPEI®) y la normativa de la CNBV.</p>
                </div>
            </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p><strong>Este comprobante es válido como prueba de la transferencia SPEI realizada.</strong></p>
            <p>Generado automáticamente por Kustodia el ${formatDate(new Date())}</p>
            ${data.digitalSignature ? `
            <p style="font-size: 12px; color: #6c757d; margin-top: 15px;"><strong>Comprobante Electrónico de Pago (CEP)</strong> - Este documento cumple con las regulaciones del Banco de México para el Sistema de Pagos Electrónicos Interbancarios (SPEI®).</p>
            <p style="font-size: 12px; color: #6c757d;">Los elementos de seguridad incluidos (sello digital, cadena original, certificado) permiten la validación de autenticidad conforme a la normativa de la CNBV.</p>
            <p style="font-size: 12px; color: #6c757d;">Para verificar este CEP: <a href="${this.generateQRCodeData(data)}" style="color: #2e7ef7;">kustodia.com/verify-receipt</a> | Consulta oficial: <a href="https://www.banxico.org.mx/cep/" style="color: #2e7ef7;">banxico.org.mx/cep</a></p>
            ` : ''}
            <p>Para cualquier duda o aclaración, contacta a soporte@kustodia.com</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate PDF from HTML using Puppeteer
   */
  private static async generatePDF(html: string): Promise<Buffer> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      });
      
      return Buffer.from(pdf);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Save receipt to temporary file and return path
   */
  static async saveReceiptToFile(
    data: SPEIReceiptData,
    options: SPEIReceiptOptions = {}
  ): Promise<string> {
    // Ensure temp directory exists
    if (!fs.existsSync(this.TEMP_DIR)) {
      fs.mkdirSync(this.TEMP_DIR, { recursive: true });
    }

    const receipt = await this.generateReceipt(data, options);
    const extension = options.format === 'html' ? 'html' : 'pdf';
    const filename = `spei-receipt-${data.transactionId}-${Date.now()}.${extension}`;
    const filepath = path.join(this.TEMP_DIR, filename);
    
    fs.writeFileSync(filepath, receipt);
    return filepath;
  }

  /**
   * Clean up old receipt files
   */
  static cleanupOldReceipts(maxAgeHours: number = 24): void {
    if (!fs.existsSync(this.TEMP_DIR)) return;

    const files = fs.readdirSync(this.TEMP_DIR);
    const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);

    files.forEach(file => {
      const filepath = path.join(this.TEMP_DIR, file);
      const stats = fs.statSync(filepath);
      
      if (stats.mtime.getTime() < cutoff) {
        fs.unlinkSync(filepath);
        console.log(`[SPEI Receipt] Cleaned up old receipt: ${file}`);
      }
    });
  }
}
