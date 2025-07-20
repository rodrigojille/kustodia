#!/usr/bin/env node

const fs = require('fs-extra');
const Sentiment = require('sentiment');
const moment = require('moment');

class SentimentAnalyzer {
  constructor() {
    this.sentiment = new Sentiment();
    this.analysis = {
      posts: [],
      summary: {
        totalAnalyzed: 0,
        averageSentiment: 0,
        sentimentDistribution: {
          positive: 0,
          neutral: 0,
          negative: 0
        },
        escrowSentiment: {
          mentions: 0,
          averageScore: 0,
          posts: []
        },
        fraudSentiment: {
          mentions: 0,
          averageScore: 0,
          posts: []
        },
        analysisDate: moment().format('YYYY-MM-DD HH:mm:ss')
      }
    };
  }

  async loadRedditData(filePath) {
    try {
      const data = await fs.readJson(filePath);
      return data.posts || [];
    } catch (error) {
      console.error('❌ Error loading Reddit data:', error.message);
      return [];
    }
  }

  analyzeSentiment(text) {
    const result = this.sentiment.analyze(text);
    
    let category = 'neutral';
    if (result.score > 1) category = 'positive';
    else if (result.score < -1) category = 'negative';
    
    return {
      score: result.score,
      comparative: result.comparative,
      category: category,
      positive: result.positive,
      negative: result.negative,
      tokens: result.tokens
    };
  }

  async analyzeAllPosts(posts) {
    console.log(`🧠 Analyzing sentiment for ${posts.length} posts...`);
    
    for (const post of posts) {
      const fullText = `${post.title} ${post.selftext || ''}`;
      const sentimentResult = this.analyzeSentiment(fullText);
      
      const analyzedPost = {
        ...post,
        sentiment: sentimentResult,
        text_length: fullText.length,
        is_escrow_related: this.isEscrowRelated(fullText),
        is_fraud_related: this.isFraudRelated(fullText),
        pain_points: this.extractPainPoints(fullText),
        solutions_mentioned: this.extractSolutions(fullText)
      };
      
      this.analysis.posts.push(analyzedPost);
      
      // Update summary statistics
      this.updateSummaryStats(analyzedPost);
    }
    
    this.analysis.summary.totalAnalyzed = this.analysis.posts.length;
    this.calculateAverages();
    
    console.log(`✅ Sentiment analysis completed for ${this.analysis.summary.totalAnalyzed} posts`);
  }

  isEscrowRelated(text) {
    const escrowKeywords = [
      'escrow', 'secure payment', 'payment protection', 'safe transaction',
      'third party', 'middleman', 'hold money', 'payment guarantee'
    ];
    
    const lowerText = text.toLowerCase();
    return escrowKeywords.some(keyword => lowerText.includes(keyword));
  }

  isFraudRelated(text) {
    const fraudKeywords = [
      'scam', 'fraud', 'stolen', 'chargeback', 'fake payment',
      'scammed', 'ripped off', 'lost money', 'payment dispute'
    ];
    
    const lowerText = text.toLowerCase();
    return fraudKeywords.some(keyword => lowerText.includes(keyword));
  }

  extractPainPoints(text) {
    const painIndicators = [
      { pattern: /lost.*money/gi, category: 'financial_loss' },
      { pattern: /can't.*trust/gi, category: 'trust_issues' },
      { pattern: /no.*protection/gi, category: 'lack_protection' },
      { pattern: /buyer.*protection/gi, category: 'buyer_protection' },
      { pattern: /seller.*protection/gi, category: 'seller_protection' },
      { pattern: /dispute.*resolution/gi, category: 'dispute_resolution' },
      { pattern: /refund.*problem/gi, category: 'refund_issues' },
      { pattern: /payment.*problem/gi, category: 'payment_issues' }
    ];
    
    const foundPainPoints = [];
    painIndicators.forEach(indicator => {
      if (indicator.pattern.test(text)) {
        foundPainPoints.push(indicator.category);
      }
    });
    
    return foundPainPoints;
  }

  extractSolutions(text) {
    const solutionIndicators = [
      { pattern: /use.*escrow/gi, category: 'escrow_service' },
      { pattern: /payment.*protection/gi, category: 'payment_protection' },
      { pattern: /secure.*payment/gi, category: 'secure_payment' },
      { pattern: /third.*party/gi, category: 'third_party' },
      { pattern: /insurance/gi, category: 'insurance' },
      { pattern: /guarantee/gi, category: 'guarantee' }
    ];
    
    const foundSolutions = [];
    solutionIndicators.forEach(indicator => {
      if (indicator.pattern.test(text)) {
        foundSolutions.push(indicator.category);
      }
    });
    
    return foundSolutions;
  }

  updateSummaryStats(post) {
    // Sentiment distribution
    this.analysis.summary.sentimentDistribution[post.sentiment.category]++;
    
    // Escrow-related analysis
    if (post.is_escrow_related) {
      this.analysis.summary.escrowSentiment.mentions++;
      this.analysis.summary.escrowSentiment.posts.push({
        title: post.title,
        sentiment_score: post.sentiment.score,
        subreddit: post.subreddit,
        url: post.url
      });
    }
    
    // Fraud-related analysis
    if (post.is_fraud_related) {
      this.analysis.summary.fraudSentiment.mentions++;
      this.analysis.summary.fraudSentiment.posts.push({
        title: post.title,
        sentiment_score: post.sentiment.score,
        subreddit: post.subreddit,
        url: post.url
      });
    }
  }

  calculateAverages() {
    const totalScore = this.analysis.posts.reduce((sum, post) => sum + post.sentiment.score, 0);
    this.analysis.summary.averageSentiment = totalScore / this.analysis.posts.length;
    
    // Calculate escrow sentiment average
    if (this.analysis.summary.escrowSentiment.mentions > 0) {
      const escrowTotal = this.analysis.summary.escrowSentiment.posts
        .reduce((sum, post) => sum + post.sentiment_score, 0);
      this.analysis.summary.escrowSentiment.averageScore = escrowTotal / this.analysis.summary.escrowSentiment.mentions;
    }
    
    // Calculate fraud sentiment average
    if (this.analysis.summary.fraudSentiment.mentions > 0) {
      const fraudTotal = this.analysis.summary.fraudSentiment.posts
        .reduce((sum, post) => sum + post.sentiment_score, 0);
      this.analysis.summary.fraudSentiment.averageScore = fraudTotal / this.analysis.summary.fraudSentiment.mentions;
    }
  }

  async saveAnalysis() {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const outputDir = './output';
    
    await fs.ensureDir(outputDir);
    
    const analysisFile = `${outputDir}/sentiment_analysis_${timestamp}.json`;
    await fs.writeJson(analysisFile, this.analysis, { spaces: 2 });
    
    console.log(`💾 Sentiment analysis saved: ${analysisFile}`);
    return analysisFile;
  }

  generateInsightsReport() {
    console.log('\n📊 SENTIMENT ANALYSIS INSIGHTS FOR KUSTODIA');
    console.log('=' * 55);
    
    // Overall sentiment distribution
    console.log('\n🎭 Overall Sentiment Distribution:');
    const { positive, neutral, negative } = this.analysis.summary.sentimentDistribution;
    console.log(`  😊 Positive: ${positive} (${Math.round((positive/this.analysis.summary.totalAnalyzed)*100)}%)`);
    console.log(`  😐 Neutral:  ${neutral} (${Math.round((neutral/this.analysis.summary.totalAnalyzed)*100)}%)`);
    console.log(`  😠 Negative: ${negative} (${Math.round((negative/this.analysis.summary.totalAnalyzed)*100)}%)`);
    
    // Escrow vs Fraud sentiment comparison
    console.log('\n🛡️ ESCROW vs 🚨 FRAUD Sentiment Comparison:');
    console.log(`  Escrow mentions: ${this.analysis.summary.escrowSentiment.mentions}`);
    console.log(`  Escrow avg sentiment: ${this.analysis.summary.escrowSentiment.averageScore.toFixed(2)}`);
    console.log(`  Fraud mentions: ${this.analysis.summary.fraudSentiment.mentions}`);
    console.log(`  Fraud avg sentiment: ${this.analysis.summary.fraudSentiment.averageScore.toFixed(2)}`);
    
    // Pain points analysis
    console.log('\n💔 Most Common Pain Points:');
    const allPainPoints = this.analysis.posts.flatMap(post => post.pain_points);
    const painPointCounts = allPainPoints.reduce((counts, point) => {
      counts[point] = (counts[point] || 0) + 1;
      return counts;
    }, {});
    
    Object.entries(painPointCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .forEach(([painPoint, count], index) => {
        console.log(`  ${index + 1}. ${painPoint.replace(/_/g, ' ')}: ${count} mentions`);
      });

    // Solution gaps
    console.log('\n💡 Solution Gaps (Kustodia Opportunities):');
    const fraudPosts = this.analysis.posts.filter(post => post.is_fraud_related);
    const fraudWithoutEscrowSolution = fraudPosts.filter(post => 
      !post.solutions_mentioned.includes('escrow_service') && 
      !post.solutions_mentioned.includes('third_party')
    );
    
    console.log(`  Total fraud discussions: ${fraudPosts.length}`);
    console.log(`  Discussions without escrow solutions: ${fraudWithoutEscrowSolution.length}`);
    console.log(`  Opportunity gap: ${Math.round((fraudWithoutEscrowSolution.length/fraudPosts.length)*100)}%`);
    
    // Top negative sentiment posts (biggest opportunities)
    console.log('\n🎯 Biggest Opportunities (Most Negative Fraud Posts):');
    const negativeOportunities = this.analysis.posts
      .filter(post => post.is_fraud_related && post.sentiment.score < -2)
      .sort((a, b) => a.sentiment.score - b.sentiment.score)
      .slice(0, 3);
    
    negativeOportunities.forEach((post, index) => {
      console.log(`  ${index + 1}. [Score: ${post.sentiment.score}] ${post.title.substring(0, 60)}...`);
      console.log(`      r/${post.subreddit} | ${post.url}`);
    });

    // Kustodia value proposition validation
    console.log('\n🚀 KUSTODIA VALUE PROPOSITION VALIDATION:');
    
    if (this.analysis.summary.fraudSentiment.averageScore < -1) {
      console.log(`✅ STRONG VALIDATION: Fraud discussions are highly negative (${this.analysis.summary.fraudSentiment.averageScore.toFixed(2)})`);
    }
    
    if (this.analysis.summary.escrowSentiment.averageScore > 0) {
      console.log(`✅ POSITIVE SIGNAL: Escrow discussions have positive sentiment (${this.analysis.summary.escrowSentiment.averageScore.toFixed(2)})`);
    }
    
    const opportunityRatio = fraudWithoutEscrowSolution.length / fraudPosts.length;
    if (opportunityRatio > 0.7) {
      console.log(`✅ HUGE OPPORTUNITY: ${Math.round(opportunityRatio*100)}% of fraud discussions don't mention escrow solutions!`);
    }
    
    console.log('\n📈 RECOMMENDED ACTIONS:');
    console.log('  1. Target subreddits with highest fraud sentiment');
    console.log('  2. Create content addressing top pain points');
    console.log('  3. Engage in fraud discussions with escrow education');
    console.log('  4. Build messaging around trust and payment protection');
  }
}

// Main execution
async function main() {
  const analyzer = new SentimentAnalyzer();
  
  // Look for the latest Reddit data file
  const outputDir = './output';
  try {
    const files = await fs.readdir(outputDir);
    const redditFiles = files.filter(file => file.startsWith('reddit_research_') && file.endsWith('.json'));
    
    if (redditFiles.length === 0) {
      console.error('❌ No Reddit data files found. Please run reddit-scraper.js first.');
      process.exit(1);
    }
    
    // Use the most recent file
    const latestFile = redditFiles.sort().reverse()[0];
    const filePath = `${outputDir}/${latestFile}`;
    
    console.log(`📖 Loading Reddit data from: ${filePath}`);
    const posts = await analyzer.loadRedditData(filePath);
    
    if (posts.length === 0) {
      console.error('❌ No posts found in the data file.');
      process.exit(1);
    }
    
    await analyzer.analyzeAllPosts(posts);
    await analyzer.saveAnalysis();
    analyzer.generateInsightsReport();
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = SentimentAnalyzer;
