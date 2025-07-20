#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs-extra');
const moment = require('moment');

class FrenchRecruitmentScraper {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.userAgent = 'FrenchRecruitmentResearch/1.0';
    this.results = { posts: [], summary: {} };
    
    // Comprehensive French recruitment keywords (French + English)
    this.keywords = [
      // French recruitment terms - General
      'recrutement', 'embauche', 'candidature', 'entretien', 'interview',
      'recherche emploi', 'cherche travail', 'offre emploi', 'annonce emploi',
      'poste vacant', 'job hunting', 'job search', 'hiring',
      
      // French recruitment terms - HR/Manager perspective
      'recruter', 'recruteur', 'chasseur de tête', 'headhunter',
      'cabinet recrutement', 'agence emploi', 'rh france', 'ressources humaines',
      'talent acquisition', 'sourcing candidats', 'assessment center',
      'process recrutement', 'grille entretien', 'evaluation candidat',
      
      // French recruitment terms - Candidate perspective
      'candidat france', 'postulant', 'demandeur emploi', 'job seeker',
      'cv français', 'lettre motivation', 'cover letter france',
      'entretien téléphonique', 'entretien visio', 'video interview',
      'test technique', 'exercice recrutement', 'mise en situation',
      
      // Tech-specific recruitment in France
      'développeur france', 'dev job france', 'tech job paris',
      'startup paris', 'scaleup france', 'tech company france',
      'fullstack developer', 'frontend backend', 'data scientist',
      'product manager', 'ux designer', 'devops engineer',
      'javascript developer', 'python developer', 'react developer',
      
      // French interview process
      'entretien rh', 'premier entretien', 'entretien technique',
      'entretien manager', 'final interview', 'last round',
      'questions entretien', 'réponses entretien', 'préparer entretien',
      'behavioral interview', 'soft skills', 'hard skills',
      'culture fit', 'team fit', 'personnalité candidat',
      
      // Recruitment challenges/pain points
      'galère recrutement', 'difficile recruter', 'pénurie candidats',
      'talent shortage', 'compétition candidats', 'guerre talents',
      'candidat fantôme', 'ghosting recruteur', 'no show entretien',
      'attentes candidat', 'négociation salaire', 'salary negotiation',
      'marché emploi', 'job market france', 'tech market',
      
      // Remote work / COVID impact
      'télétravail', 'remote work france', 'travail distance',
      'full remote', 'hybrid work', 'bureau flexible',
      'covid recrutement', 'post pandemic hiring', 'new normal',
      
      // French job boards/platforms
      'indeed france', 'linkedin france', 'apec', 'pole emploi',
      'welcome to jungle', 'jobteaser', 'hellowork', 'regionsjob',
      'monster france', 'cadremploi', 'leboncoin emploi',
      
      // Company culture in France
      'culture entreprise', 'valeurs company', 'ambiance travail',
      'team building', 'onboarding france', 'integration equipe',
      'management style', 'hierarchy france', 'work life balance',
      
      // French employment law/contracts
      'contrat travail', 'cdi cdd', 'période essai', 'trial period',
      'convention collective', 'droit travail', 'labor law france',
      'rupture contrat', 'licenciement', 'démission',
      'préavis', 'indemnités', 'unemployment benefits',
      
      // Specific French cities
      'emploi paris', 'job lyon', 'travail marseille', 'bordeaux tech',
      'toulouse startup', 'lille job', 'nantes emploi', 'nice tech',
      'montpellier dev', 'strasbourg job', 'grenoble tech',
      
      // Salary/Compensation in France
      'salaire france', 'rémunération', 'package salarial',
      'salary expectation', 'négocier salaire', 'augmentation',
      'bonus france', 'avantages sociaux', 'benefits package',
      'mutuelle', 'ticket restaurant', 'transport',
      
      // Industry-specific
      'fintech france', 'startup france', 'scale up',
      'big tech france', 'consulting france', 'banque it',
      'assurance tech', 'retail tech', 'healthtech france'
    ];
    
    // French and France-related subreddits
    this.subreddits = [
      'france', 'french', 'paris', 'lyon', 'jobs', 'cscareerquestions',
      'recruitinghell', 'antiwork', 'europe', 'cscareerquestionseu',
      'programming', 'webdev', 'javascript', 'python', 'reactjs',
      'startups', 'entrepreneur', 'remotework', 'digitalnomad',
      'humanresources', 'recruiting', 'careerguidance', 'findapath',
      'itcareerquestions', 'sysadmin', 'devops', 'datascience'
    ];
  }

  async delay(ms = 5000) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, retries = 2) {
    try {
      await this.delay();
      const response = await axios.get(url, {
        headers: { 'User-Agent': 'French Recruitment Research Bot 1.0 (Contact: research@example.com)' },
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

  categorizeRecruitment(text) {
    const categories = {
      'tech_recruitment': [
        'développeur', 'developer', 'programmer', 'frontend', 'backend', 'fullstack',
        'javascript', 'python', 'react', 'node', 'data scientist', 'devops',
        'product manager', 'tech lead', 'architect', 'ux designer', 'ui designer'
      ],
      'interview_process': [
        'entretien', 'interview', 'questions', 'préparation', 'test technique',
        'coding challenge', 'behavioral', 'soft skills', 'culture fit',
        'first round', 'final round', 'assessment', 'evaluation'
      ],
      'hr_challenges': [
        'difficile recruter', 'pénurie', 'shortage', 'talent war', 'guerre talents',
        'candidat fantôme', 'ghosting', 'no show', 'turnover', 'retention',
        'compétition', 'marché tendu', 'tight market'
      ],
      'candidate_experience': [
        'candidat', 'postulant', 'job seeker', 'recherche emploi', 'galère',
        'frustrated', 'disappointed', 'experience', 'feedback', 'rejet',
        'rejection', 'ghosted', 'ignored'
      ],
      'remote_work': [
        'télétravail', 'remote', 'distance', 'home office', 'hybrid',
        'flexible', 'covid', 'pandemic', 'new normal', 'distributed'
      ],
      'salary_negotiation': [
        'salaire', 'salary', 'rémunération', 'package', 'négociation',
        'negotiation', 'augmentation', 'raise', 'benefits', 'avantages'
      ],
      'french_market': [
        'france', 'français', 'paris', 'lyon', 'marseille', 'toulouse',
        'bordeaux', 'lille', 'nantes', 'montpellier', 'strasbourg'
      ]
    };

    const detected = [];
    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (lowerText.includes(keyword.toLowerCase())) {
          detected.push(category);
          break;
        }
      }
    }
    
    return detected.length > 0 ? detected[0] : 'general_recruitment';
  }

  analyzeRecruitmentIntent(text, title = '') {
    const combinedText = `${title} ${text}`.toLowerCase();
    
    // Analyze different recruitment perspectives and intents
    const intents = {
      // HR/Manager perspective
      hiring_struggle: /difficile recruter|pénurie|shortage|hard to find|can't find|struggle to hire|talent war/i,
      process_optimization: /améliorer process|optimize|streamline|efficiency|better way to|how to recruit/i,
      candidate_evaluation: /évaluer candidat|assess|evaluation|interview questions|how to judge|screening/i,
      
      // Candidate perspective
      job_hunting: /recherche emploi|job search|looking for|hunting|applying|postule/i,
      interview_prep: /préparer entretien|interview prep|questions|practice|tips|advice/i,
      career_advice: /conseil carrière|career advice|guidance|next step|transition/i,
      salary_concern: /salaire|salary|pay|rémunération|compensation|negotiat/i,
      
      // Market analysis
      market_insight: /marché emploi|job market|trend|évolution|future|prediction/i,
      company_review: /avis entreprise|company review|culture|working at|experience at/i,
      
      // Pain points
      frustration: /frustré|frustrated|disappointed|déçu|galère|nightmare|terrible/i,
      ghosting_complaint: /ghosting|no response|pas de réponse|ignored|silence/i,
      process_criticism: /process trop long|too long|complicated|waste of time|ridiculous/i
    };

    const behavioral_indicators = {
      solution_seeking: /comment|how to|tips|advice|help|besoin aide|guidance|recommend/i,
      sharing_experience: /mon expérience|my experience|témoignage|story|happened to me/i,
      warning_others: /attention|warning|éviter|avoid|red flag|be careful/i,
      asking_opinion: /avis|opinion|what do you think|qu'est-ce que vous pensez|thoughts/i,
      venting: /rant|frustrated|fed up|en avoir marre|ça suffit|terrible/i
    };

    // Determine primary intent
    let primaryIntent = 'general_discussion';
    let confidence = 0;
    
    for (const [intent, pattern] of Object.entries(intents)) {
      const matches = (combinedText.match(pattern) || []).length;
      if (matches > confidence) {
        confidence = matches;
        primaryIntent = intent;
      }
    }

    // Determine behavioral type
    let behaviorType = 'passive';
    let behaviorConfidence = 0;
    
    for (const [behavior, pattern] of Object.entries(behavioral_indicators)) {
      const matches = (combinedText.match(pattern) || []).length;
      if (matches > behaviorConfidence) {
        behaviorConfidence = matches;
        behaviorType = behavior;
      }
    }

    // Extract role/perspective
    const perspective = this.extractPerspective(combinedText);
    
    return {
      primary_intent: primaryIntent,
      behavior_type: behaviorType,
      perspective: perspective,
      confidence: confidence,
      solution_seeking: /comment|how to|tips|advice|help|recommend/i.test(combinedText),
      sharing_experience: /expérience|experience|témoignage|story|happened/i.test(combinedText),
      warning_others: /attention|warning|éviter|avoid|red flag/i.test(combinedText),
      market_analysis: /marché|market|trend|évolution|future/i.test(combinedText),
      salary_focused: /salaire|salary|pay|rémunération|compensation/i.test(combinedText)
    };
  }

  extractPerspective(text) {
    const hrIndicators = /recruteur|recruiter|rh|hr|manager|hiring|embauche|cabinet/i;
    const candidateIndicators = /candidat|postulant|job seeker|recherche emploi|looking for/i;
    const techIndicators = /développeur|developer|programmer|engineer|tech|dev/i;
    
    if (hrIndicators.test(text)) return 'hr_recruiter';
    if (candidateIndicators.test(text) && techIndicators.test(text)) return 'tech_candidate';
    if (candidateIndicators.test(text)) return 'candidate';
    if (techIndicators.test(text)) return 'tech_professional';
    
    return 'general';
  }

  extractRecruitmentDetails(text) {
    const details = {
      experience_level: null,
      location: null,
      remote_preference: null,
      salary_range: null,
      company_size: null,
      industry: null
    };

    // Experience level extraction
    const expPatterns = {
      'junior': /junior|débutant|entry level|0-2 ans|fresh grad|new grad/i,
      'mid': /intermédiaire|mid level|2-5 ans|experienced|confirmé/i,
      'senior': /senior|expert|lead|principal|5\+ ans|\+5 years/i
    };

    for (const [level, pattern] of Object.entries(expPatterns)) {
      if (pattern.test(text)) {
        details.experience_level = level;
        break;
      }
    }

    // Location extraction (French cities)
    const locationPatterns = [
      'paris', 'lyon', 'marseille', 'toulouse', 'bordeaux', 'lille',
      'nantes', 'strasbourg', 'montpellier', 'nice', 'grenoble', 'rennes'
    ];

    for (const city of locationPatterns) {
      if (text.toLowerCase().includes(city)) {
        details.location = city;
        break;
      }
    }

    // Remote work preference
    if (/remote|télétravail|distance|home office/i.test(text)) {
      details.remote_preference = 'remote_friendly';
    }

    // Industry detection
    const industries = {
      'fintech': /fintech|finance|bank|trading|payment/i,
      'startup': /startup|scale.?up|early stage/i,
      'consulting': /consulting|conseil|accenture|deloitte/i,
      'ecommerce': /e.?commerce|retail|marketplace/i,
      'gaming': /gaming|jeux|game/i,
      'healthtech': /health|santé|medical/i
    };

    for (const [industry, pattern] of Object.entries(industries)) {
      if (pattern.test(text)) {
        details.industry = industry;
        break;
      }
    }

    return details;
  }

  async scrapeSubreddit(subreddit) {
    console.log(`\n🔍 Searching r/${subreddit} for French recruitment discussions...`);
    
    let allPosts = [];
    
    // Search each keyword in the subreddit
    for (const keyword of this.keywords) {
      try {
        console.log(`   Searching: "${keyword}"`);
        
        // Use Reddit search API for better results
        const searchUrl = `${this.baseURL}/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=relevance&limit=25`;
        const data = await this.makeRequest(searchUrl);
        
        if (data?.data?.children) {
          for (const post of data.data.children) {
            const postData = post.data;
            
            // Check if post is relevant to recruitment
            const title = postData.title || '';
            const text = postData.selftext || '';
            const combinedText = `${title} ${text}`.toLowerCase();
            
            // Basic relevance filter
            const recruitmentTerms = [
              'recruit', 'hire', 'job', 'emploi', 'travail', 'interview', 'entretien',
              'candidat', 'cv', 'resume', 'salary', 'salaire', 'developer', 'développeur'
            ];
            
            const isRelevant = recruitmentTerms.some(term => 
              combinedText.includes(term.toLowerCase())
            );
            
            if (isRelevant && postData.score >= 2) {
              const category = this.categorizeRecruitment(combinedText);
              const intent = this.analyzeRecruitmentIntent(text, title);
              const details = this.extractRecruitmentDetails(combinedText);
              
              allPosts.push({
                id: postData.id,
                title: title,
                text: text,
                score: postData.score,
                num_comments: postData.num_comments,
                created_utc: postData.created_utc,
                subreddit: subreddit,
                url: `https://reddit.com${postData.permalink}`,
                keyword: keyword,
                category: category,
                intent: intent,
                details: details,
                engagement: postData.score + postData.num_comments
              });
            }
          }
        }
        
        await this.delay(2000); // Respectful delay
        
      } catch (error) {
        console.log(`   ⚠️ Failed to search "${keyword}": ${error.message}`);
        await this.delay(3000);
      }
    }
    
    // Remove duplicates based on post ID
    const uniquePosts = allPosts.filter((post, index, self) => 
      self.findIndex(p => p.id === post.id) === index
    );
    
    console.log(`   ✅ Found ${uniquePosts.length} relevant recruitment posts`);
    return uniquePosts;
  }

  async runAnalysis() {
    console.log('🇫🇷 FRENCH RECRUITMENT MARKET RESEARCH - STARTING ANALYSIS\n');
    console.log('📊 Analyzing French tech recruitment, interviews, and hiring challenges...\n');
    
    for (const subreddit of this.subreddits) {
      try {
        const posts = await this.scrapeSubreddit(subreddit);
        this.results.posts.push(...posts);
      } catch (error) {
        console.log(`❌ Failed to scrape r/${subreddit}: ${error.message}`);
      }
    }
    
    console.log(`\n✅ Analysis complete! Found ${this.results.posts.length} total posts`);
    
    this.generateSummary();
    await this.saveResults();
    this.showInsights();
  }

  generateSummary() {
    const posts = this.results.posts;
    
    this.results.summary = {
      total_posts: posts.length,
      total_engagement: posts.reduce((sum, p) => sum + p.engagement, 0),
      avg_engagement: posts.length > 0 ? (posts.reduce((sum, p) => sum + p.engagement, 0) / posts.length).toFixed(1) : 0,
      categories: {},
      intents: {},
      perspectives: {},
      high_engagement_posts: posts.filter(p => p.engagement >= 20).length,
      generated_at: new Date().toISOString()
    };

    // Category distribution
    posts.forEach(post => {
      this.results.summary.categories[post.category] = 
        (this.results.summary.categories[post.category] || 0) + 1;
    });

    // Intent distribution  
    posts.forEach(post => {
      const intent = post.intent?.primary_intent || 'unknown';
      this.results.summary.intents[intent] = 
        (this.results.summary.intents[intent] || 0) + 1;
    });

    // Perspective distribution
    posts.forEach(post => {
      const perspective = post.intent?.perspective || 'unknown';
      this.results.summary.perspectives[perspective] = 
        (this.results.summary.perspectives[perspective] || 0) + 1;
    });
  }

  async saveResults() {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm');
    const filename = `french-recruitment-analysis-${timestamp}.json`;
    const filepath = `./output/${filename}`;
    
    await fs.ensureDir('./output');
    await fs.writeJSON(filepath, this.results, { spaces: 2 });
    
    console.log(`\n💾 Results saved to: ${filepath}`);
  }

  showInsights() {
    const posts = this.results.posts;
    const summary = this.results.summary;
    
    console.log(`\n🇫🇷 FRENCH RECRUITMENT MARKET ANALYSIS RESULTS`);
    console.log(`===============================================`);
    
    console.log(`\n📊 OVERVIEW:`);
    console.log(`   📋 Total recruitment discussions: ${summary.total_posts}`);
    console.log(`   👥 Total engagement: ${summary.total_engagement}`);
    console.log(`   📈 Average engagement per post: ${summary.avg_engagement}`);
    console.log(`   🔥 High-engagement posts (20+): ${summary.high_engagement_posts}`);
    
    // Top categories
    console.log(`\n🎯 RECRUITMENT CATEGORIES:`);
    Object.entries(summary.categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .forEach(([category, count]) => {
        const percentage = ((count / posts.length) * 100).toFixed(1);
        const emoji = {
          'tech_recruitment': '👨‍💻',
          'interview_process': '🎤',
          'hr_challenges': '😓',
          'candidate_experience': '🙋‍♂️',
          'remote_work': '🏠',
          'salary_negotiation': '💰',
          'french_market': '🇫🇷',
          'general_recruitment': '📋'
        }[category] || '📌';
        
        console.log(`   ${emoji} ${category.replace(/_/g, ' ')}: ${count} posts (${percentage}%)`);
      });

    // Top intents
    console.log(`\n🎯 USER INTENTS:`);
    Object.entries(summary.intents)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .forEach(([intent, count]) => {
        const percentage = ((count / posts.length) * 100).toFixed(1);
        const emoji = {
          'hiring_struggle': '😰',
          'job_hunting': '🔍',
          'interview_prep': '📚',
          'career_advice': '🎯',
          'salary_concern': '💰',
          'market_insight': '📊',
          'frustration': '😤',
          'process_optimization': '⚡'
        }[intent] || '❓';
        
        console.log(`   ${emoji} ${intent.replace(/_/g, ' ')}: ${count} posts (${percentage}%)`);
      });

    // Perspectives
    console.log(`\n👥 PERSPECTIVES:`);
    Object.entries(summary.perspectives)
      .sort(([,a], [,b]) => b - a)
      .forEach(([perspective, count]) => {
        const percentage = ((count / posts.length) * 100).toFixed(1);
        const emoji = {
          'hr_recruiter': '👔',
          'tech_candidate': '👨‍💻',
          'candidate': '🙋‍♂️',
          'tech_professional': '⚡',
          'general': '👤'
        }[perspective] || '❓';
        
        console.log(`   ${emoji} ${perspective.replace(/_/g, ' ')}: ${count} posts (${percentage}%)`);
      });

    // Business opportunities
    const techPosts = posts.filter(p => p.category === 'tech_recruitment');
    const hrChallenges = posts.filter(p => p.category === 'hr_challenges');
    const solutionSeekers = posts.filter(p => p.intent?.solution_seeking);
    const interviewFocused = posts.filter(p => p.category === 'interview_process');
    
    console.log(`\n🚀 BUSINESS OPPORTUNITIES:`);
    console.log(`   👨‍💻 Tech recruitment posts: ${techPosts.length} - ${((techPosts.length/posts.length)*100).toFixed(1)}%`);
    console.log(`   😓 HR challenges: ${hrChallenges.length} - ${((hrChallenges.length/posts.length)*100).toFixed(1)}%`);
    console.log(`   🤝 Solution seekers: ${solutionSeekers.length} - ${((solutionSeekers.length/posts.length)*100).toFixed(1)}%`);
    console.log(`   🎤 Interview-focused: ${interviewFocused.length} - ${((interviewFocused.length/posts.length)*100).toFixed(1)}%`);

    // Top high-engagement posts
    console.log(`\n🔥 HIGH-ENGAGEMENT OPPORTUNITIES:`);
    const topPosts = posts
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 5);
      
    topPosts.forEach((post, i) => {
      console.log(`   ${i+1}. r/${post.subreddit} - ${post.engagement} engagement`);
      console.log(`      "${post.title.substring(0, 80)}..."`);
      console.log(`      Category: ${post.category} | Intent: ${post.intent?.primary_intent || 'unknown'}`);
      console.log(`      ${post.url}\n`);
    });

    console.log(`\n💡 STRATEGIC RECOMMENDATIONS:`);
    console.log(`   🎯 Focus on tech recruitment pain points (${techPosts.length} discussions)`);
    console.log(`   📚 Create interview preparation tools/content`);
    console.log(`   🤖 Build solutions for HR automation/efficiency`);
    console.log(`   🇫🇷 Target French tech market specifically`);
    console.log(`   🏠 Address remote work recruitment challenges`);
    console.log(`   💰 Provide salary benchmarking tools`);
    
    if (solutionSeekers.length > 0) {
      console.log(`\n🎯 IMMEDIATE OPPORTUNITIES:`);
      console.log(`   📊 ${solutionSeekers.length} users actively seeking recruitment solutions`);
      console.log(`   💼 ${hrChallenges.length} HR professionals discussing challenges`);
      console.log(`   🎤 ${interviewFocused.length} discussions about interview processes`);
      console.log(`\n   → Ready for targeted B2B and B2C recruitment solutions!`);
    }
  }
}

// Run the analysis
async function main() {
  const scraper = new FrenchRecruitmentScraper();
  try {
    await scraper.runAnalysis();
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

if (require.main === module) {
  main();
}

module.exports = FrenchRecruitmentScraper;
