import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../authenticateJWT';
import { requireAdminRole } from '../../middleware/requireAdminRole';
import AppDataSource from '../../ormconfig';
import { PaymentEvent } from '../../entity/PaymentEvent';
import * as fs from 'fs';
import * as path from 'path';

const router = Router();

// System logs endpoint - combines database events and file logs
router.get('/logs', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const logLevel = req.query.level as string; // 'error', 'warn', 'info', 'debug'

    console.log(`[ADMIN] Fetching system logs: limit=${limit}, level=${logLevel}`);

    // Fetch database events (payment events)
    let query = AppDataSource.getRepository(PaymentEvent)
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.payment', 'payment')
      .orderBy('event.created_at', 'DESC')
      .limit(limit);

    if (startDate) {
      query = query.andWhere('event.created_at >= :startDate', { startDate: new Date(startDate) });
    }
    if (endDate) {
      query = query.andWhere('event.created_at <= :endDate', { endDate: new Date(endDate) });
    }

    const dbEvents = await query.getMany();

    // Try to read application log files (if they exist)
    const logDir = path.join(__dirname, '../../../logs');
    let fileLogs: any[] = [];
    
    try {
      if (fs.existsSync(logDir)) {
        const logFiles = fs.readdirSync(logDir).filter(f => f.endsWith('.log'));
        
        for (const logFile of logFiles.slice(0, 3)) { // Read up to 3 recent log files
          const logPath = path.join(logDir, logFile);
          const content = fs.readFileSync(logPath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          
          // Parse log lines (assuming JSON format or structured logs)
          for (const line of lines.slice(-20)) { // Last 20 lines per file
            try {
              if (line.trim().startsWith('{')) {
                const logEntry = JSON.parse(line);
                fileLogs.push({
                  timestamp: new Date(logEntry.timestamp || Date.now()),
                  level: logEntry.level || 'info',
                  message: logEntry.message || line,
                  source: 'file',
                  filename: logFile,
                  rawLine: line
                });
              } else {
                // Plain text log parsing
                const match = line.match(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
                const timestamp = match ? new Date(match[1]) : new Date();
                
                fileLogs.push({
                  timestamp,
                  level: getLogLevelFromLine(line),
                  message: line,
                  source: 'file',
                  filename: logFile,
                  rawLine: line
                });
              }
            } catch (parseError) {
              // Skip unparseable lines
            }
          }
        }
      }
    } catch (fileError: any) {
      console.log('[ADMIN] No file logs found or unable to read:', fileError.message);
    }

    // Combine and format all logs
    const combinedLogs = [
      // Database events
      ...dbEvents.map(event => {
        const payment = event.payment;
        let detailedMessage = event.description || event.type;
        
        if (payment) {
          const paymentDetails = [
            `Payment ID: ${payment.id}`,
            `Amount: $${payment.amount} ${payment.currency}`,
            `Status: ${payment.status}`,
            `Recipient: ${payment.recipient_email}`,
            ...(payment.reference ? [`Reference: ${payment.reference}`] : [])
          ];
          detailedMessage += ` | ${paymentDetails.join(' | ')}`;
        }

        const formattedDate = event.created_at.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Mexico_City'
        });

        return {
          id: event.id,
          timestamp: event.created_at,
          formattedTimestamp: formattedDate,
          level: getLogLevel(event.type),
          status: getEventStatus(event.type),
          type: event.type,
          message: detailedMessage,
          source: 'database',
          paymentId: payment?.id,
          paymentAmount: payment?.amount,
          paymentCurrency: payment?.currency,
          paymentStatus: payment?.status,
          recipientEmail: payment?.recipient_email,
          payerEmail: payment?.payer_email,
          reference: payment?.reference
        };
      }),
      
      // File logs
      ...fileLogs.map(log => ({
        id: `file_${Date.now()}_${Math.random()}`,
        timestamp: log.timestamp,
        formattedTimestamp: log.timestamp.toLocaleString('es-MX', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZone: 'America/Mexico_City'
        }),
        level: log.level,
        status: log.level === 'error' ? 'error' : 'info',
        type: 'system',
        message: log.message,
        source: 'file',
        filename: log.filename,
        rawLine: log.rawLine
      }))
    ];

    // Sort by timestamp (newest first)
    combinedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Filter by log level if specified
    const filteredLogs = logLevel && logLevel !== 'all' 
      ? combinedLogs.filter(log => log.level === logLevel)
      : combinedLogs;

    // Apply limit
    const limitedLogs = filteredLogs.slice(0, limit);

    console.log(`[ADMIN] Returning ${limitedLogs.length} logs (${dbEvents.length} from DB, ${fileLogs.length} from files)`);

    res.json({ 
      logs: limitedLogs,
      totalLogs: combinedLogs.length,
      dbEvents: dbEvents.length,
      fileLogs: fileLogs.length,
      environment: 'local',
      source: 'mixed'
    });

  } catch (error) {
    console.error('Error getting system logs:', error);
    res.status(500).json({ error: 'Failed to get system logs' });
  }
});

// Helper functions
function getEventStatus(eventType: string): 'success' | 'error' | 'warning' | 'info' {
  if (eventType.includes('failed') || eventType.includes('error')) return 'error';
  if (eventType.includes('completed') || eventType.includes('success')) return 'success';
  if (eventType.includes('pending') || eventType.includes('processing')) return 'warning';
  return 'info';
}

function getLogLevel(eventType: string): 'error' | 'warn' | 'info' | 'debug' {
  if (eventType.includes('failed') || eventType.includes('error')) return 'error';
  if (eventType.includes('pending') || eventType.includes('warning')) return 'warn';
  return 'info';
}

function getLogLevelFromLine(line: string): 'error' | 'warn' | 'info' | 'debug' {
  const lowerLine = line.toLowerCase();
  if (lowerLine.includes('error') || lowerLine.includes('fail') || lowerLine.includes('exception')) {
    return 'error';
  }
  if (lowerLine.includes('warn') || lowerLine.includes('warning')) {
    return 'warn';
  }
  if (lowerLine.includes('debug') || lowerLine.includes('trace')) {
    return 'debug';
  }
  return 'info';
}

export default router;
