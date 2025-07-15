import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../authenticateJWT';
import { requireAdminRole } from '../../middleware/requireAdminRole';
import axios from 'axios';
import AppDataSource from '../../ormconfig';
import { PaymentEvent } from '../../entity/PaymentEvent';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const router = Router();

// Unified logs endpoint that handles both production (Heroku) and local environments
router.get('/logs', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      lines = 100, 
      level = 'all',
      environment = 'auto',
      source,
      dyno
    } = req.query;

    console.log(`[ADMIN] Fetching logs: environment=${environment}, lines=${lines}, level=${level}`);

    // Determine environment
    const isProduction = environment === 'production' || 
      (environment === 'auto' && (process.env.NODE_ENV === 'production' || process.env.HEROKU_APP_NAME));

    if (isProduction) {
      // Production: Fetch Heroku logs
      await fetchHerokuLogs(req, res);
    } else {
      // Local: Fetch system logs
      await fetchSystemLogs(req, res);
    }

  } catch (error: any) {
    console.error('Error in unified logs endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch logs',
      message: error.message
    });
  }
});

// Heroku logs fetching logic
async function fetchHerokuLogs(req: Request, res: Response): Promise<void> {
  const { 
    lines = 100, 
    level = 'all',
    source,
    dyno
  } = req.query;

  const herokuApiToken = process.env.HEROKU_API_TOKEN;
  const herokuAppName = process.env.HEROKU_APP_NAME || 'kustodia-backend';

  if (!herokuApiToken) {
    res.json({ 
      logs: [],
      totalLines: 0,
      filteredLines: 0,
      environment: 'production',
      message: 'Heroku API token not configured. To enable live log monitoring, set HEROKU_API_TOKEN environment variable.',
      configurationRequired: true
    });
    return;
  }

  console.log('[ADMIN] Fetching Heroku logs for app:', herokuAppName);

  try {
    // Get log session from Heroku Platform API
    const sessionResponse = await axios.post(
      `https://api.heroku.com/apps/${herokuAppName}/log-sessions`,
      {
        lines: parseInt(String(lines)),
        tail: false
      },
      {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    const logUrl = sessionResponse.data.logplex_url;
    console.log('[ADMIN] Got log session URL from Heroku');

    // Fetch actual logs from logplex URL
    const logsResponse = await axios.get(logUrl, {
      timeout: 15000,
      responseType: 'text'
    });

    const rawLogs = logsResponse.data;
    
    // Parse and format logs
    const logLines = rawLogs.split('\n').filter((line: string) => line.trim());
    const formattedLogs = logLines.map((line: string) => {
      // Parse Heroku log format: timestamp source[dyno]: message
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2})\s+(\w+)\[([^\]]+)\]:\s*(.*)$/);
      
      if (match) {
        const [, timestamp, source, dyno, message] = match;
        return {
          timestamp: new Date(timestamp),
          formattedTimestamp: new Date(timestamp).toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Mexico_City'
          }),
          source,
          dyno,
          message: message.trim(),
          level: getLogLevelFromMessage(message),
          rawLine: line
        };
      } else {
        return {
          timestamp: new Date(),
          formattedTimestamp: new Date().toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City'
          }),
          source: 'unknown',
          dyno: 'unknown',
          message: line,
          level: 'info' as const,
          rawLine: line
        };
      }
    });

    // Apply filters
    let filteredLogs = formattedLogs;
    
    if (level && level !== 'all') {
      filteredLogs = filteredLogs.filter((log: any) => log.level === level);
    }
    
    if (source) {
      filteredLogs = filteredLogs.filter((log: any) => log.source.includes(String(source)));
    }
    
    if (dyno) {
      filteredLogs = filteredLogs.filter((log: any) => log.dyno.includes(String(dyno)));
    }

    res.json({
      logs: filteredLogs,
      totalLines: logLines.length,
      filteredLines: filteredLogs.length,
      environment: 'production',
      appName: herokuAppName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching Heroku logs:', error);
    
    if (error.response) {
      res.status(error.response.status || 500).json({
        error: 'Heroku API error',
        message: error.response.data?.message || error.message,
        environment: 'production'
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(504).json({
        error: 'Request timeout',
        message: 'Heroku logs request timed out',
        environment: 'production'
      });
    } else {
      res.status(500).json({
        error: 'Failed to fetch production logs',
        message: error.message,
        environment: 'production'
      });
    }
  }
}

// System logs fetching logic (local environment)
async function fetchSystemLogs(req: Request, res: Response): Promise<void> {
  const limit = parseInt(String(req.query.lines)) || 50;
  const logLevel = req.query.level as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  console.log(`[ADMIN] Fetching system logs: limit=${limit}, level=${logLevel}`);

  try {
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
        
        for (const logFile of logFiles.slice(0, 3)) {
          const logPath = path.join(logDir, logFile);
          const content = fs.readFileSync(logPath, 'utf8');
          const lines = content.split('\n').filter(line => line.trim());
          
          for (const line of lines.slice(-20)) {
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

        return {
          id: event.id,
          timestamp: event.created_at,
          formattedTimestamp: event.created_at.toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            timeZone: 'America/Mexico_City'
          }),
          level: getSystemLogLevel(event.type),
          message: detailedMessage,
          source: 'database',
          dyno: 'local',
          rawLine: `${event.created_at.toISOString()} database[${event.type}]: ${detailedMessage}`
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
        message: log.message,
        source: log.source,
        dyno: 'local',
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

    console.log(`[ADMIN] Returning ${limitedLogs.length} system logs`);

    res.json({ 
      logs: limitedLogs,
      totalLines: combinedLogs.length,
      filteredLines: filteredLogs.length,
      environment: 'local',
      source: 'mixed'
    });

  } catch (error) {
    console.error('Error getting system logs:', error);
    throw error;
  }
}

// Helper functions
function getLogLevelFromMessage(message: string): 'error' | 'warn' | 'info' | 'debug' {
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('error') || lowerMessage.includes('fail') || lowerMessage.includes('exception')) {
    return 'error';
  }
  if (lowerMessage.includes('warn') || lowerMessage.includes('warning')) {
    return 'warn';
  }
  if (lowerMessage.includes('debug') || lowerMessage.includes('trace')) {
    return 'debug';
  }
  return 'info';
}

function getSystemLogLevel(eventType: string): 'error' | 'warn' | 'info' | 'debug' {
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

// Unified dynos endpoint that handles both production (Heroku) and local environments
router.get('/dynos', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const environment = req.query.environment || 'auto';
    
    console.log(`[ADMIN] Fetching dynos: environment=${environment}`);

    // Determine environment
    const isProduction = environment === 'production' || 
      (environment === 'auto' && (process.env.NODE_ENV === 'production' || process.env.HEROKU_APP_NAME));

    if (isProduction) {
      // Production: Fetch Heroku dynos
      await fetchHerokuDynos(req, res);
    } else {
      // Local: Return mock/local dynos info
      res.json({
        dynos: [
          {
            id: 'local-web-1',
            name: 'web.1',
            type: 'web',
            size: 'local',
            state: 'up',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            command: 'npm start'
          }
        ],
        environment: 'local',
        appName: 'kustodia-local',
        timestamp: new Date().toISOString()
      });
    }

  } catch (error: any) {
    console.error('Error in unified dynos endpoint:', error);
    res.status(500).json({
      error: 'Failed to fetch dynos',
      message: error.message
    });
  }
});

// Heroku dynos fetching logic
async function fetchHerokuDynos(req: Request, res: Response): Promise<void> {
  const herokuApiToken = process.env.HEROKU_API_TOKEN;
  const herokuAppName = process.env.HEROKU_APP_NAME || 'kustodia-backend';

  if (!herokuApiToken) {
    res.json({ 
      dynos: [],
      environment: 'production',
      message: 'Heroku API token not configured. To enable dyno monitoring, set HEROKU_API_TOKEN environment variable.',
      configurationRequired: true
    });
    return;
  }

  try {
    const response = await axios.get(
      `https://api.heroku.com/apps/${herokuAppName}/dynos`,
      {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        timeout: 10000
      }
    );

    const dynos = response.data.map((dyno: any) => ({
      id: dyno.id,
      name: dyno.name,
      type: dyno.type,
      size: dyno.size,
      state: dyno.state,
      created_at: dyno.created_at,
      updated_at: dyno.updated_at,
      command: dyno.command
    }));

    res.json({
      dynos,
      environment: 'production',
      appName: herokuAppName,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error fetching Heroku dynos:', error);
    res.status(error.response?.status || 500).json({
      error: 'Failed to fetch production dynos',
      message: error.message,
      environment: 'production'
    });
  }
}

export default router;
