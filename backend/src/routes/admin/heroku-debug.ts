import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../../authenticateJWT';
import { requireAdminRole } from '../../middleware/requireAdminRole';
import axios from 'axios';

const router = Router();

// Debug endpoint to test Heroku API connectivity
router.get('/test-heroku-api', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const herokuApiToken = process.env.HEROKU_API_TOKEN;
    const herokuAppName = process.env.HEROKU_APP_NAME;

    console.log('[HEROKU DEBUG] Environment variables check:', {
      hasToken: !!herokuApiToken,
      tokenPrefix: herokuApiToken ? herokuApiToken.substring(0, 10) + '...' : 'none',
      appName: herokuAppName,
      nodeEnv: process.env.NODE_ENV
    });

    if (!herokuApiToken) {
      res.json({
        success: false,
        error: 'HEROKU_API_TOKEN not found',
        envVars: {
          HEROKU_API_TOKEN: 'missing',
          HEROKU_APP_NAME: herokuAppName || 'missing'
        }
      });
      return;
    }

    if (!herokuAppName) {
      res.json({
        success: false,
        error: 'HEROKU_APP_NAME not found',
        envVars: {
          HEROKU_API_TOKEN: 'present',
          HEROKU_APP_NAME: 'missing'
        }
      });
      return;
    }

    // Test 1: Check if we can reach Heroku API
    console.log('[HEROKU DEBUG] Testing basic Heroku API connectivity...');
    
    try {
      const appsResponse = await axios.get('https://api.heroku.com/apps', {
        headers: {
          'Authorization': `Bearer ${herokuApiToken}`,
          'Accept': 'application/vnd.heroku+json; version=3'
        },
        timeout: 10000
      });
      
      console.log('[HEROKU DEBUG] Apps API call successful, found', appsResponse.data.length, 'apps');
      
      // Check if our specific app exists
      const ourApp = appsResponse.data.find((app: any) => app.name === herokuAppName);
      
      if (!ourApp) {
        res.json({
          success: false,
          error: `App '${herokuAppName}' not found in your Heroku account`,
          availableApps: appsResponse.data.map((app: any) => app.name),
          suggestion: 'Check if HEROKU_APP_NAME is correct'
        });
        return;
      }

      console.log('[HEROKU DEBUG] Found our app:', ourApp.name);

    } catch (apiError: any) {
      console.error('[HEROKU DEBUG] Apps API call failed:', apiError.response?.data || apiError.message);
      
      res.json({
        success: false,
        error: 'Failed to connect to Heroku API',
        details: {
          status: apiError.response?.status,
          statusText: apiError.response?.statusText,
          data: apiError.response?.data,
          message: apiError.message
        },
        suggestion: 'Check if HEROKU_API_TOKEN is valid and has correct permissions'
      });
      return;
    }

    // Test 2: Try to create a log session
    console.log('[HEROKU DEBUG] Testing log session creation...');
    
    try {
      const sessionResponse = await axios.post(
        `https://api.heroku.com/apps/${herokuAppName}/log-sessions`,
        {
          lines: 10,
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

      console.log('[HEROKU DEBUG] Log session created successfully');
      
      const logUrl = sessionResponse.data.logplex_url;
      
      // Test 3: Try to fetch actual logs
      console.log('[HEROKU DEBUG] Testing log fetching from logplex...');
      
      try {
        const logsResponse = await axios.get(logUrl, {
          timeout: 15000,
          responseType: 'text'
        });

        const logLines = logsResponse.data.split('\n').filter((line: string) => line.trim()).slice(0, 5);
        
        console.log('[HEROKU DEBUG] Successfully fetched logs, sample:', logLines);

        res.json({
          success: true,
          message: 'Heroku API integration working correctly!',
          tests: {
            apiConnectivity: 'passed',
            appExists: 'passed',
            logSessionCreation: 'passed',
            logFetching: 'passed'
          },
          sampleLogs: logLines,
          logUrl: logUrl.substring(0, 50) + '...'
        });

      } catch (logError: any) {
        console.error('[HEROKU DEBUG] Log fetching failed:', logError.message);
        
        res.json({
          success: false,
          error: 'Failed to fetch logs from logplex',
          tests: {
            apiConnectivity: 'passed',
            appExists: 'passed',
            logSessionCreation: 'passed',
            logFetching: 'failed'
          },
          details: logError.message,
          logUrl: logUrl
        });
      }

    } catch (sessionError: any) {
      console.error('[HEROKU DEBUG] Log session creation failed:', sessionError.response?.data || sessionError.message);
      
      res.json({
        success: false,
        error: 'Failed to create log session',
        tests: {
          apiConnectivity: 'passed',
          appExists: 'passed',
          logSessionCreation: 'failed',
          logFetching: 'not_tested'
        },
        details: {
          status: sessionError.response?.status,
          data: sessionError.response?.data,
          message: sessionError.message
        }
      });
    }

  } catch (error: any) {
    console.error('[HEROKU DEBUG] Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'Unexpected error during Heroku API test',
      message: error.message
    });
  }
});

// Fixed logs endpoint with better error handling
router.get('/logs-fixed', authenticateJWT, requireAdminRole, async (req: Request, res: Response): Promise<void> => {
  try {
    const { lines = 100, level = 'all' } = req.query;
    
    const herokuApiToken = process.env.HEROKU_API_TOKEN;
    const herokuAppName = process.env.HEROKU_APP_NAME;

    console.log('[HEROKU LOGS] Starting log fetch with enhanced error handling');

    if (!herokuApiToken || !herokuAppName) {
      res.json({
        logs: [],
        totalLines: 0,
        error: 'Heroku configuration missing',
        details: {
          hasToken: !!herokuApiToken,
          hasAppName: !!herokuAppName
        }
      });
      return;
    }

    // Create log session with better error handling
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
        timeout: 15000 // Increased timeout
      }
    );

    const logUrl = sessionResponse.data.logplex_url;
    console.log('[HEROKU LOGS] Got logplex URL, fetching logs...');

    // Fetch logs with retry logic
    let logsResponse;
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        logsResponse = await axios.get(logUrl, {
          timeout: 20000, // Increased timeout
          responseType: 'text'
        });
        break; // Success, exit retry loop
      } catch (logError: any) {
        retryCount++;
        console.log(`[HEROKU LOGS] Retry ${retryCount}/${maxRetries} after error:`, logError.message);
        
        if (retryCount >= maxRetries) {
          throw logError; // Re-throw after max retries
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    if (!logsResponse) {
      throw new Error('Failed to fetch logs after retries');
    }

    const rawLogs = logsResponse.data;
    const logLines = rawLogs.split('\n').filter((line: string) => line.trim());
    
    console.log(`[HEROKU LOGS] Successfully fetched ${logLines.length} log lines`);

    // Parse and format logs
    const formattedLogs = logLines.map((line: string, index: number) => {
      const match = line.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+\+\d{2}:\d{2})\s+(\w+)\[([^\]]+)\]:\s*(.*)$/);
      
      if (match) {
        const [, timestamp, source, dyno, message] = match;
        return {
          id: `log-${index}`,
          timestamp: new Date(timestamp),
          formattedTimestamp: new Date(timestamp).toLocaleString('es-MX', {
            timeZone: 'America/Mexico_City'
          }),
          source,
          dyno,
          message: message.trim(),
          level: getLogLevel(message),
          rawLine: line
        };
      } else {
        return {
          id: `log-${index}`,
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

    // Filter by level if specified
    const filteredLogs = level && level !== 'all' 
      ? formattedLogs.filter((log: any) => log.level === level)
      : formattedLogs;

    res.json({
      logs: filteredLogs,
      totalLines: logLines.length,
      filteredLines: filteredLogs.length,
      appName: herokuAppName,
      timestamp: new Date().toISOString(),
      success: true
    });

  } catch (error: any) {
    console.error('[HEROKU LOGS] Error:', error.response?.data || error.message);
    
    res.status(500).json({
      logs: [],
      totalLines: 0,
      error: 'Failed to fetch Heroku logs',
      details: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      },
      timestamp: new Date().toISOString(),
      success: false
    });
  }
});

function getLogLevel(message: string): 'error' | 'warn' | 'info' | 'debug' {
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

export default router;
