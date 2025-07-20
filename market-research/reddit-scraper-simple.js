#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs-extra');
const moment = require('moment');

class SimpleRedditScraper {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.userAgent = 'KustodiaMarketResearch/1.0 (Simple)';
    this.results = { posts: [], summary: {} };
    
    // Comprehensive Mexican fraud scenarios
    this.keywords = [
      // General fraud terms
      'fraude', 'estafa', 'estafas', 'me estafaron', 'me robaron',
      'timo', 'timos', 'me timaron', 'perdí dinero', 'dinero perdido',
      
      // SPEI & Banking fraud (Mexican-specific)
      'spei falso', 'spei clonado', 'transferencia falsa', 'clabe clonada',
      'banco pirata', 'cuenta clonada', 'phishing bancario', 'tarjeta clonada',
      'banca en línea hack', 'otp robado', 'sms falso banco',
      
      // Payment method fraud
      'pago falso', 'no me pagaron', 'no me cumplieron', 'me quedaron mal',
      'pagué y no', 'di el anticipo', 'adelanto y no', 'depósito y no',
      'mercadopago estafa', 'paypal bloqueado', 'oxxo pay falso',
      'bit falso', 'clip estafa', 'kueski estafa',
      
      // Service contract fraud
      'freelance estafa', 'trabajo remoto estafa', 'proyecto no pagado',
      'diseño web estafa', 'programador estafa', 'consultoría fraude',
      'marketing digital estafa', 'redes sociales trabajo',
      'contrato falso', 'servicios profesionales',
      
      // Online marketplace fraud
      'marketplace estafa', 'facebook marketplace', 'mercadolibre estafa',
      'venta por facebook', 'compra por internet', 'tienda en línea falsa',
      'amazon mexico estafa', 'segundamano estafa', 'olx fraude',
      
      // Real estate fraud
      'estafa inmobiliaria', 'bienes raíces estafa', 'renta falsa',
      'casa que no existe', 'departamento falso', 'inmobiliaria fraude',
      'airbnb estafa', 'booking falso', 'depósito apartamento',
      
      // Car sales fraud
      'auto usado estafa', 'carro falso', 'venta de auto fraude',
      'compra venta autos', 'seminuevo estafa', 'agencia automotriz',
      'kavak estafa', 'vroom estafa', 'auto seminuevo',
      
      // Investment & crypto fraud
      'inversion falsa', 'broker estafa', 'forex falso', 'bitcoin estafa',
      'cripto fraude', 'trading estafa', 'multinivel', 'esquema ponzi',
      
      // Employment fraud
      'trabajo falso', 'oferta empleo estafa', 'reclutador falso',
      'home office estafa', 'trabajo desde casa fraude',
      
      // Payment security (what we offer)
      'pago seguro', 'cómo pagar seguro', 'intermediario pago',
      'tercero confiable', 'custodia dinero', 'garantía pago',
      'escrow', 'fideicomiso', 'depósito garantía'
    ];
    
    // Expanded Mexican subreddits
    this.subreddits = [
      'mexico', 'preguntaleareddit', 'mexicocity', 'guadalajara',
      'monterrey', 'tijuana', 'mexicali', 'cancun', 'merida',
      'es', 'espanol', 'scams', 'legaladvice'
    ];
  }

  async delay(ms = 5000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, retries = 2) {
    try {
      await this.delay();
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'Kustodia Market Research Bot 1.0 (Contact: support@kustodia.mx)' },
        timeout: 10000
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 429) {
        console.log('⏱️ Rate limited, waiting 10 seconds...');
        await this.delay(10000);
        return this.makeRequest(url);
      }
      throw error;
    }
  }

  categorizeFraud(text) {
    const categories = {
      'spei_banking': ['spei', 'transferencia bancaria', 'clabe', 'banca en linea', 'banco', 'cuenta bancaria', 'tarjeta clonada', 'phishing bancario'],
      'service_contracts': ['freelance', 'proyecto', 'trabajo remoto', 'diseño web', 'programador', 'consultor', 'marketing digital', 'servicios profesionales', 'contrato trabajo'],
      'real_estate': ['inmobiliaria', 'bienes raices', 'casa', 'departamento', 'renta', 'venta casa', 'anticipo renta', 'airbnb', 'booking'],
      'automotive': ['auto', 'coche', 'carro', 'vehiculo', 'moto', 'motocicleta', 'venta auto', 'usado', 'kavak', 'seminuevo'],
      'online_marketplace': ['mercadolibre', 'facebook marketplace', 'olx', 'segundamano', 'compra venta online', 'amazon mexico', 'tienda online'],
      'employment': ['trabajo falso', 'oferta empleo', 'reclutador', 'home office', 'trabajo desde casa', 'sueldo', 'nomina', 'empresa'],
      'payment_platforms': ['mercadopago', 'paypal', 'oxxo pay', 'bit', 'clip', 'kueski', 'transferencia', 'deposito'],
      'investment_crypto': ['inversion', 'broker', 'forex', 'bitcoin', 'cripto', 'trading', 'multinivel', 'esquema ponzi'],
      'romance_scams': ['amor', 'pareja', 'novio', 'novia', 'dating', 'tinder', 'match', 'citas online'],
      'general_fraud': ['estafa', 'fraude', 'robo', 'engano', 'timaron', 'estafador', 'me robaron']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()))) {
        return category;
      }
    }
    
    return 'other';
  }

  // New method to analyze qualitative user intent and behavior
  analyzeUserIntent(text, title = '') {
    const fullText = `${title} ${text}`.toLowerCase();
    const intent = {
      type: 'venting', // default
      confidence: 0,
      indicators: [],
      solution_seeking: false,
      sharing_prevention: false,
      warning_others: false,
      discussing_solutions: false
    };

    // Venting/Complaining indicators
    const ventingPatterns = [
      'me paso', 'me estafaron', 'me robaron', 'perdí', 'me quitaron',
      'estoy enojado', 'estoy furioso', 'que coraje', 'que asco',
      'no puedo creer', 'estoy harto', 'ya no confío', 'odio cuando',
      'me siento estúpido', 'que tonto fui', 'jamás creí'
    ];

    // Solution-seeking indicators  
    const solutionSeekingPatterns = [
      'qué puedo hacer', 'cómo puedo', 'necesito ayuda', 'alguien sabe',
      'qué me recomiendan', 'hay alguna forma', 'conocen algún',
      'me pueden ayudar', 'algún consejo', 'qué hago ahora',
      'dónde puedo', 'a quién acudo', 'cómo evitar', 'cómo recuperar'
    ];

    // Prevention sharing indicators
    const preventionSharingPatterns = [
      'nunca hagan', 'no caigan en', 'cuidado con', 'eviten',
      'mi consejo es', 'recomiendo que', 'siempre verifiquen',
      'no confíen en', 'les comparto', 'mi experiencia',
      'para que no les pase', 'tip', 'truco', 'hack'
    ];

    // Warning others indicators
    const warningPatterns = [
      'ojo con', 'tengan cuidado', 'no usen', 'este tipo estafa',
      'alerta', 'reporto', 'denuncia', 'fraude conocido',
      'ya reporté', 'no caigan', 'están estafando'
    ];

    // Solution discussion indicators
    const solutionDiscussionPatterns = [
      'yo uso', 'funciona bien', 'recomiendo', 'es seguro',
      'mejor opción', 'alternativa', 'solución', 'plataforma confiable',
      'método seguro', 'así lo hago', 'siempre funciona'
    ];

    // Legal/regulatory discussion
    const legalPatterns = [
      'profeco', 'condusef', 'demanda', 'denuncia', 'legal',
      'abogado', 'ministerio público', 'autoridades', 'ley',
      'derechos', 'regulación', 'normativa'
    ];

    // Count matches for each category
    let ventingScore = 0;
    let solutionSeekingScore = 0;
    let preventionScore = 0;
    let warningScore = 0;
    let solutionDiscussionScore = 0;
    let legalScore = 0;

    // Score venting patterns
    ventingPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        ventingScore++;
        intent.indicators.push(`venting: ${pattern}`);
      }
    });

    // Score solution-seeking patterns
    solutionSeekingPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        solutionSeekingScore++;
        intent.solution_seeking = true;
        intent.indicators.push(`seeking: ${pattern}`);
      }
    });

    // Score prevention sharing patterns
    preventionSharingPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        preventionScore++;
        intent.sharing_prevention = true;
        intent.indicators.push(`prevention: ${pattern}`);
      }
    });

    // Score warning patterns
    warningPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        warningScore++;
        intent.warning_others = true;
        intent.indicators.push(`warning: ${pattern}`);
      }
    });

    // Score solution discussion patterns
    solutionDiscussionPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        solutionDiscussionScore++;
        intent.discussing_solutions = true;
        intent.indicators.push(`solution: ${pattern}`);
      }
    });

    // Score legal patterns
    legalPatterns.forEach(pattern => {
      if (fullText.includes(pattern)) {
        legalScore++;
        intent.indicators.push(`legal: ${pattern}`);
      }
    });

    // Determine primary intent based on highest score
    const scores = {
      'venting': ventingScore,
      'seeking_solutions': solutionSeekingScore,
      'sharing_prevention': preventionScore,
      'warning_others': warningScore,
      'discussing_solutions': solutionDiscussionScore,
      'legal_discussion': legalScore
    };

    // Find the category with highest score
    const maxScore = Math.max(...Object.values(scores));
    const primaryIntent = Object.keys(scores).find(key => scores[key] === maxScore);
    
    intent.type = primaryIntent;
    intent.confidence = maxScore;
    
    // Special case: if multiple high scores, it's a "mixed" intent
    const highScores = Object.values(scores).filter(score => score > 1);
    if (highScores.length > 1) {
      intent.type = 'mixed_discussion';
    }

    return intent;
  }

  // New method to extract payment details
  extractPaymentDetails(text) {
    const details = {
      amounts: [],
      payment_methods: [],
      fraud_indicators: [],
      timeline: null
    };

    // Extract amounts (pesos)
    const amountRegex = /\$?([0-9,]+)\s*(pesos?|mxn|mx)/gi;
    const amounts = text.match(amountRegex);
    if (amounts) {
      details.amounts = amounts.map(a => a.replace(/[^0-9,]/g, '').replace(',', ''));
    }

    // Extract payment methods
    const paymentMethods = [
      'spei', 'transferencia', 'deposito', 'mercadopago', 'paypal', 'oxxo',
      'efectivo', 'tarjeta', 'debito', 'credito', 'clip', 'bit'
    ];
    
    paymentMethods.forEach(method => {
      if (text.toLowerCase().includes(method)) {
        details.payment_methods.push(method);
      }
    });

    // Extract fraud indicators
    const fraudIndicators = [
      'anticipo', 'adelanto', 'deposito primero', 'paga primero',
      'urgente', 'rapido', 'hoy mismo', 'no preguntes',
      'confianza', 'conocido', 'familiar', 'referencia'
    ];
    
    fraudIndicators.forEach(indicator => {
      if (text.toLowerCase().includes(indicator)) {
        details.fraud_indicators.push(indicator);
      }
    });

    // Extract timeline indicators
    const timelineRegex = /(hace\s+\d+\s+(dias?|semanas?|meses?|años?))/gi;
    const timeline = text.match(timelineRegex);
    if (timeline) {
      details.timeline = timeline[0];
    }

    return details;
  }

  async scrapeSubreddit(subreddit) {
    console.log(`🔍 Analyzing r/${subreddit}...`);
    const posts = [];

    try {
      // Method 1: Search for specific fraud questions (enhanced)
      const fraudQueries = [
        'peor estafa', 'estafa que has sufrido', 'te han estafado',
        'no me pagaron', 'me robaron dinero', 'fraude online',
        'estafas comunes', 'cuidado con', 'evitar estafas',
        // SPEI & Banking specific
        'spei falso', 'transferencia estafa', 'banco fraude',
        // Service contract specific
        'freelance no pago', 'proyecto estafa', 'trabajo remoto fraude',
        // Payment platform specific
        'mercadopago problema', 'paypal bloqueado', 'oxxo pay estafa'
      ];

      for (const query of fraudQueries) {
        const searchURL = `${this.baseURL}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&restrict_sr=1&sort=top&t=year&limit=50`;
        const searchData = await this.makeRequest(searchURL);
        
        if (searchData?.data?.children) {
          for (const post of searchData.data.children) {
            const postData = post.data;
            const text = `${postData.title} ${postData.selftext || ''}`.toLowerCase();
            
            // Check if we already have this post
            if (posts.find(p => p.id === postData.id)) continue;
            
            // Check for keyword matches
            const matchedKeywords = this.keywords.filter(keyword => 
              text.includes(keyword.toLowerCase())
            );

            if (matchedKeywords.length > 0 || 
                text.includes('estafa') || text.includes('fraude') || 
                text.includes('no me pagaron') || text.includes('me robaron')) {
              
              const paymentDetails = this.extractPaymentDetails(text);
              const userIntent = this.analyzeUserIntent(text, postData.title);
              
              posts.push({
                id: postData.id,
                title: postData.title,
                content: postData.selftext || '',
                subreddit: postData.subreddit,
                score: postData.score,
                comments: postData.num_comments,
                created: moment.unix(postData.created_utc).format('YYYY-MM-DD HH:mm:ss'),
                url: `https://reddit.com${postData.permalink}`,
                keywords_matched: matchedKeywords,
                upvote_ratio: postData.upvote_ratio,
                search_query: query,
                fraud_category: this.categorizeFraud(text),
                // Enhanced payment analysis
                amounts_mentioned: paymentDetails.amounts,
                payment_methods: paymentDetails.payment_methods,
                fraud_indicators: paymentDetails.fraud_indicators,
                timeline: paymentDetails.timeline,
                full_text_length: text.length,
                // NEW: Qualitative user intent analysis
                user_intent: userIntent.type,
                intent_confidence: userIntent.confidence,
                intent_indicators: userIntent.indicators,
                solution_seeking: userIntent.solution_seeking,
                sharing_prevention: userIntent.sharing_prevention,
                warning_others: userIntent.warning_others,
                discussing_solutions: userIntent.discussing_solutions
              });
            }
          }
        }
      }

      // Method 2: Get hot posts for additional coverage
      const hotURL = `${this.baseURL}/r/${subreddit}/hot.json?limit=100`;
      const hotData = await this.makeRequest(hotURL);
      
      if (hotData?.data?.children) {
        for (const post of hotData.data.children) {
          const postData = post.data;
          const text = `${postData.title} ${postData.selftext || ''}`.toLowerCase();
          
          // Skip if we already have this post
          if (posts.find(p => p.id === postData.id)) continue;
          
          // Check for keyword matches
          const matchedKeywords = this.keywords.filter(keyword => 
            text.includes(keyword.toLowerCase())
          );

          if (matchedKeywords.length > 0) {
            const paymentDetails = this.extractPaymentDetails(text);
            const userIntent = this.analyzeUserIntent(text, postData.title);
        
            const post = {
              id: postData.id,
              title: postData.title || '',
              content: postData.selftext || '',
              url: postData.url || '',
              score: postData.score || 0,
              comments: postData.num_comments || 0,
              created: postData.created_utc ? new Date(postData.created_utc * 1000) : null,
              subreddit: postData.subreddit || subreddit,
              author: postData.author || 'unknown',
              keywords_matched: matchedKeywords,
              fraud_category: this.categorizeFraud(text),
              search_query: 'hot_posts',
              engagement_score: (postData.score || 0) + (postData.num_comments || 0),
              // Enhanced payment analysis
              amounts_mentioned: paymentDetails.amounts,
              payment_methods: paymentDetails.payment_methods,
              fraud_indicators: paymentDetails.fraud_indicators,
              timeline: paymentDetails.timeline,
              full_text_length: text.length,
              // NEW: Qualitative user intent analysis
              user_intent: userIntent.type,
              intent_confidence: userIntent.confidence,
              intent_indicators: userIntent.indicators,
              solution_seeking: userIntent.solution_seeking,
              sharing_prevention: userIntent.sharing_prevention,
              warning_others: userIntent.warning_others,
              discussing_solutions: userIntent.discussing_solutions
            };

            posts.push(post);
          }
        }
      }

      console.log(`✅ Found ${posts.length} relevant posts in r/${subreddit}`);
      return posts;
      
    } catch (error) {
      console.error(`❌ Error scraping r/${subreddit}:`, error.message);
      return [];
    }
  }

  async runAnalysis() {
    console.log('🚀 Starting focused Reddit analysis for Kustodia...\n');

    for (const subreddit of this.subreddits) {
      const posts = await this.scrapeSubreddit(subreddit);
      this.results.posts = this.results.posts.concat(posts);
      
      // Longer delay between subreddits
      if (this.subreddits.indexOf(subreddit) < this.subreddits.length - 1) {
        console.log('⏱️  Waiting 10 seconds before next subreddit...\n');
        await this.delay(10000);
      }
    }

    this.generateSummary();
    await this.saveResults();
    this.showInsights();
  }

  generateSummary() {
    const posts = this.results.posts;
    
    // Keyword frequency
    const keywordCounts = {};
    posts.forEach(post => {
      post.keywords_matched.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });

    // Subreddit distribution
    const subredditCounts = {};
    posts.forEach(post => {
      subredditCounts[post.subreddit] = (subredditCounts[post.subreddit] || 0) + 1;
    });

    this.results.summary = {
      total_posts: posts.length,
      total_engagement: posts.reduce((sum, p) => sum + p.score + p.comments, 0),
      keyword_frequency: Object.entries(keywordCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10),
      subreddit_distribution: subredditCounts,
      high_engagement_posts: posts.filter(p => p.score > 50 || p.comments > 20).length,
      analysis_date: moment().format('YYYY-MM-DD HH:mm:ss')
    };
  }

  async saveResults() {
    await fs.ensureDir('./output');
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    
    // Save JSON
    const jsonFile = `./output/reddit_simple_${timestamp}.json`;
    await fs.writeJson(jsonFile, this.results, { spaces: 2 });
    
    // Save CSV
    const csvFile = `./output/reddit_simple_${timestamp}.csv`;
    const csvHeader = 'ID,Title,Subreddit,Score,Comments,Keywords,Date,URL\n';
    const csvRows = this.results.posts.map(post => {
      return [
        post.id,
        `"${post.title.replace(/"/g, '""')}"`,
        post.subreddit,
        post.score,
        post.comments,
        `"${post.keywords_matched.join(', ')}"`,
        post.created,
        post.url
      ].join(',');
    });
    
    await fs.writeFile(csvFile, csvHeader + csvRows.join('\n'));
    
    console.log(`\n📊 Results saved:`);
    console.log(`   JSON: ${jsonFile}`);
    console.log(`   CSV: ${csvFile}`);
  }

  showInsights() {
    const { summary } = this.results;
    const posts = this.results.posts;
    
    console.log(`\n🎯 KUSTODIA MARKET INSIGHTS:`);
    console.log(`📈 Payment fraud discussions found: ${summary.total_posts}`);
    console.log(`🔥 Total engagement (upvotes + comments): ${summary.total_engagement}`);
    console.log(`⭐ High-engagement opportunities: ${summary.high_engagement_posts}`);

    // Fraud category analysis
    console.log(`\n📊 FRAUD CATEGORIES ANALYSIS:`);
    const categoryStats = {};
    posts.forEach(post => {
      const category = post.fraud_category || 'other';
      if (!categoryStats[category]) {
        categoryStats[category] = { count: 0, totalScore: 0, totalComments: 0 };
      }
      categoryStats[category].count++;
      categoryStats[category].totalScore += post.score || 0;
      categoryStats[category].totalComments += post.comments || 0;
    });

    const sortedCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b.count - a.count)
      .slice(0, 8);

    sortedCategories.forEach(([category, stats]) => {
      const avgEngagement = ((stats.totalScore + stats.totalComments) / stats.count).toFixed(1);
      const categoryName = {
        'spei_banking': '🏦 SPEI & Banking Fraud',
        'service_contracts': '💻 Service Contract Fraud',
        'real_estate': '🏠 Real Estate Scams',
        'automotive': '🚗 Car Sales Fraud', 
        'online_marketplace': '🛒 Online Marketplace',
        'employment': '💼 Employment Fraud',
        'payment_platforms': '💳 Payment Platform Issues',
        'investment_crypto': '💰 Investment & Crypto Fraud',
        'romance_scams': '💕 Romance Scams',
        'general_fraud': '⚠️ General Fraud'
      }[category] || `📋 ${category.replace('_', ' ').toUpperCase()}`;
      
      console.log(`   ${categoryName}: ${stats.count} posts (avg engagement: ${avgEngagement})`);
    });

    console.log(`\n🔑 Top fraud-related keywords:`);
    const keywordCounts = {};
    posts.forEach(post => {
      post.keywords_matched.forEach(keyword => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    topKeywords.forEach(([keyword, count]) => {
      console.log(`   ${keyword}: ${count} mentions`);
    });

    // Search method effectiveness
    console.log(`\n🔍 SEARCH METHOD EFFECTIVENESS:`);
    const searchMethods = {};
    posts.forEach(post => {
      const method = post.search_query || 'unknown';
      searchMethods[method] = (searchMethods[method] || 0) + 1;
    });
    
    Object.entries(searchMethods)
      .sort(([,a], [,b]) => b - a)
      .forEach(([method, count]) => {
        const percentage = ((count / posts.length) * 100).toFixed(1);
        console.log(`   ${method}: ${count} posts (${percentage}%)`);
      });

    console.log(`\n💡 ESCROW OPPORTUNITY ANALYSIS:`);
    const escrowMentions = posts.filter(p => 
      p.keywords_matched.some(k => ['escrow', 'custodia', 'fideicomiso'].includes(k.toLowerCase()))
    );
    
    console.log(`   Escrow awareness: ${escrowMentions.length}/${posts.length} posts (${((escrowMentions.length/posts.length)*100).toFixed(1)}%)`);
    
    if (escrowMentions.length === 0) {
      console.log(`   🚨 CRITICAL INSIGHT: Zero escrow awareness - massive opportunity!`);
      console.log(`   📋 Recommendation: Educational content and awareness campaigns needed`);
    }

    // High-value opportunity identification
    console.log(`\n🎯 HIGH-VALUE OPPORTUNITIES:`);
    const highValueCategories = ['real_estate', 'automotive', 'employment'];
    const highValuePosts = posts.filter(p => highValueCategories.includes(p.fraud_category));
    console.log(`   High-value transaction fraud: ${highValuePosts.length} posts`);
    
    const mexicanMarketPosts = posts.filter(p => 
      p.subreddit === 'mexico' || p.subreddit === 'Mujico' || p.subreddit.includes('mexico')
    );
    console.log(`   Mexican market specific: ${mexicanMarketPosts.length} posts`);

    // NEW: Qualitative Insights Analysis
    console.log(`\n🧠 QUALITATIVE USER INTENT ANALYSIS:`);
    const intentStats = {};
    const behaviorCounts = {
      solution_seeking: 0,
      sharing_prevention: 0,
      warning_others: 0,
      discussing_solutions: 0
    };

    posts.forEach(post => {
      const intent = post.user_intent || 'unknown';
      intentStats[intent] = (intentStats[intent] || 0) + 1;
      
      if (post.solution_seeking) behaviorCounts.solution_seeking++;
      if (post.sharing_prevention) behaviorCounts.sharing_prevention++;
      if (post.warning_others) behaviorCounts.warning_others++;
      if (post.discussing_solutions) behaviorCounts.discussing_solutions++;
    });

    // Show intent distribution
    Object.entries(intentStats)
      .sort(([,a], [,b]) => b - a)
      .forEach(([intent, count]) => {
        const percentage = ((count / posts.length) * 100).toFixed(1);
        const intentEmoji = {
          'venting': '😤',
          'seeking_solutions': '🤝',
          'sharing_prevention': '💡',
          'warning_others': '⚠️',
          'discussing_solutions': '💬',
          'legal_discussion': '⚖️',
          'mixed_discussion': '🔄'
        }[intent] || '❓';
        
        const intentName = {
          'venting': 'Venting/Complaining',
          'seeking_solutions': 'Seeking Solutions',
          'sharing_prevention': 'Sharing Prevention Tips',
          'warning_others': 'Warning Others',
          'discussing_solutions': 'Discussing Solutions',
          'legal_discussion': 'Legal Discussion',
          'mixed_discussion': 'Mixed Discussion'
        }[intent] || intent;
        
        console.log(`   ${intentEmoji} ${intentName}: ${count} posts (${percentage}%)`);
      });

    console.log(`\n🎯 USER BEHAVIOR INSIGHTS:`);
    console.log(`   🤝 Solution-seeking users: ${behaviorCounts.solution_seeking} posts (${((behaviorCounts.solution_seeking/posts.length)*100).toFixed(1)}%)`);
    console.log(`   💡 Prevention tip sharers: ${behaviorCounts.sharing_prevention} posts (${((behaviorCounts.sharing_prevention/posts.length)*100).toFixed(1)}%)`);
    console.log(`   ⚠️ Warning others: ${behaviorCounts.warning_others} posts (${((behaviorCounts.warning_others/posts.length)*100).toFixed(1)}%)`);
    console.log(`   💬 Solution discussers: ${behaviorCounts.discussing_solutions} posts (${((behaviorCounts.discussing_solutions/posts.length)*100).toFixed(1)}%)`);

    // Strategic insights based on intent
    const solutionSeekers = posts.filter(p => p.solution_seeking);
    const preventionSharers = posts.filter(p => p.sharing_prevention);
    const realEstateSeekers = solutionSeekers.filter(p => p.fraud_category === 'real_estate');
    
    console.log(`\n🔍 STRATEGIC QUALITATIVE INSIGHTS:`);
    console.log(`   🏠 Real estate solution seekers: ${realEstateSeekers.length} posts - HIGH ESCROW OPPORTUNITY`);
    console.log(`   💡 Prevention content creators: ${preventionSharers.length} posts - POTENTIAL PARTNERS`);
    console.log(`   🤝 Total solution seekers: ${solutionSeekers.length} posts - DIRECT MARKETING TARGET`);
    
    if (solutionSeekers.length > 0) {
      console.log(`   📈 Solution-seeking ratio: ${((solutionSeekers.length/posts.length)*100).toFixed(1)}% - Ready for escrow education`);
    }

    console.log(`\n🎲 RECOMMENDED NEXT STEPS:`);
    console.log(`   1. Target solution-seeking users in real estate (${realEstateSeekers.length} identified)`);
    console.log(`   2. Partner with prevention tip sharers (${preventionSharers.length} potential advocates)`);
    console.log(`   3. Create Spanish-language educational content about escrow`);
    console.log(`   4. Focus on high-engagement fraud categories with solution seekers`);
    console.log(`   5. Develop targeted campaigns for users actively seeking fraud prevention`);
  }
}

// Run the analysis
async function main() {
  const scraper = new SimpleRedditScraper();
  try {
    await scraper.runAnalysis();
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = SimpleRedditScraper;
