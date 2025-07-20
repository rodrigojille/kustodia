#!/usr/bin/env node

const axios = require('axios');
const fs = require('fs-extra');
const moment = require('moment');
require('dotenv').config();

class RedditScraper {
  constructor() {
    this.baseURL = 'https://www.reddit.com';
    this.userAgent = process.env.REDDIT_USER_AGENT || 'KustodiaMarketResearch/1.0';
    this.maxPostsPerSubreddit = parseInt(process.env.MAX_POSTS_PER_SUBREDDIT) || 25; // Reduced for rate limiting
    this.skipComments = true; // Skip comments to avoid rate limiting
    
    // Target subreddits for Spanish payment fraud research (Mexican market)
    // Reduced list to avoid rate limiting
    this.targetSubreddits = [
      // Primary Mexican communities
      'mexico',
      'Mujico', 
      'DerechoMexicano',
      // Spanish-speaking
      'es',
      'argentina',
      'colombia',
      // Mixed communities with Spanish content
      'scams',
      'personalfinance'
    ];

    // Search keywords for payment fraud and escrow (Spanish + English)
    this.paymentFraudKeywords = [
      // Spanish keywords - FRAUD
      'fraude', 'fraudes', 'estafa', 'estafas', 'timo', 'timos',
      'me estafaron', 'me robaron', 'dinero perdido', 'perdí dinero',
      'pago falso', 'transferencia falsa', 'no me pagaron',
      
      // Spanish keywords - PAYMENTS
      'pago seguro', 'transferencia segura', 'protección pago',
      'disputa pago', 'reembolso', 'chargeback', 'contracargo',
      'mercadopago', 'mercado pago', 'oxxo', 'spei', 'clabe',
      
      // Spanish keywords - TRUST/SECURITY
      'no confío', 'desconfianza', 'seguridad pago', 'pago confiable',
      'intermediario', 'tercero confiable', 'garantía pago',
      
      // Spanish keywords - ESCROW
      'depósito garantía', 'custodia', 'fideicomiso', 'intermediario pago',
      'pago custodiado', 'servicio custodia', 'tercero seguro',
      
      // English keywords (for mixed communities)
      'payment fraud', 'scammed', 'escrow', 'stolen money',
      'fake payment', 'paypal scam', 'payment dispute',
      'secure payment', 'safe transaction', 'payment protection'
    ];

    this.results = {
      posts: [],
      comments: [],
      summary: {
        totalPosts: 0,
        totalComments: 0,
        subredditStats: {},
        keywordStats: {},
        scrapingDate: moment().format('YYYY-MM-DD HH:mm:ss')
      }
    };
  }

  async delay(ms = 3000) { 
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async makeRequest(url, retries = 3) {
    try {
      await this.delay(); 
      const response = await axios.get(url, {
        headers: { 'User-Agent': this.userAgent },
        timeout: 15000 
      });
      return response.data;
    } catch (error) {
      if (retries > 0 && (error.code === 'ECONNRESET' || error.response?.status === 429)) {
        const waitTime = (4 - retries) * 10000 + 5000; 
        console.log(`Rate limited or connection error. Retrying in ${waitTime/1000} seconds... (${retries} retries left)`);
        await this.delay(waitTime);
        return this.makeRequest(url, retries - 1);
      }
      throw error;
    }
  }

  async searchSubreddit(subreddit, keywords) {
    console.log(`🔍 Scraping r/${subreddit} for payment fraud discussions...`);
    
    const subredditPosts = [];
    const subredditComments = [];

    try {
      // Search by keyword in the subreddit
      for (const keyword of keywords) {
        const searchURL = `${this.baseURL}/r/${subreddit}/search.json?q=${encodeURIComponent(keyword)}&restrict_sr=1&sort=relevance&limit=25`;
        
        try {
          const data = await this.makeRequest(searchURL);
          
          if (data.data && data.data.children) {
            for (const post of data.data.children) {
              const postData = post.data;
              
              const postInfo = {
                id: postData.id,
                title: postData.title,
                selftext: postData.selftext,
                subreddit: postData.subreddit,
                author: postData.author,
                score: postData.score,
                upvote_ratio: postData.upvote_ratio,
                num_comments: postData.num_comments,
                created_utc: postData.created_utc,
                created_date: moment.unix(postData.created_utc).format('YYYY-MM-DD HH:mm:ss'),
                url: `https://reddit.com${postData.permalink}`,
                keyword_matched: keyword,
                full_link: `https://reddit.com/r/${subreddit}/comments/${postData.id}`
              };

              subredditPosts.push(postInfo);

              // Fetch top comments for high-engagement posts
              if (postData.num_comments > 5 && postData.score > 10) {
                await this.delay(1000); // Rate limiting
                const comments = await this.fetchPostComments(postData.permalink);
                subredditComments.push(...comments);
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️  Error searching "${keyword}" in r/${subreddit}:`, error.message);
        }

        // Rate limiting between searches
        await this.delay(2000);
      }

      // Also get hot posts from the subreddit
      const hotURL = `${this.baseURL}/r/${subreddit}/hot.json?limit=50`;
      try {
        const hotData = await this.makeRequest(hotURL);
        
        if (hotData.data && hotData.data.children) {
          for (const post of hotData.data.children) {
            const postData = post.data;
            
            // Check if post title or content contains our keywords
            const postText = `${postData.title} ${postData.selftext}`.toLowerCase();
            const matchedKeyword = this.paymentFraudKeywords.find(keyword => 
              postText.includes(keyword.toLowerCase())
            );

            if (matchedKeyword) {
              const postInfo = {
                id: postData.id,
                title: postData.title,
                selftext: postData.selftext,
                subreddit: postData.subreddit,
                author: postData.author,
                score: postData.score,
                upvote_ratio: postData.upvote_ratio,
                num_comments: postData.num_comments,
                created_utc: postData.created_utc,
                created_date: moment.unix(postData.created_utc).format('YYYY-MM-DD HH:mm:ss'),
                url: `https://reddit.com${postData.permalink}`,
                keyword_matched: matchedKeyword,
                full_link: `https://reddit.com/r/${subreddit}/comments/${postData.id}`,
                source: 'hot_posts'
              };

              subredditPosts.push(postInfo);
            }
          }
        }
      } catch (error) {
        console.warn(`⚠️  Error fetching hot posts from r/${subreddit}:`, error.message);
      }

    } catch (error) {
      console.error(`❌ Error scraping r/${subreddit}:`, error.message);
    }

    console.log(`✅ Found ${subredditPosts.length} posts and ${subredditComments.length} comments in r/${subreddit}`);
    
    return {
      posts: subredditPosts,
      comments: subredditComments
    };
  }

  async fetchPostComments(permalink) {
    try {
      const commentsURL = `${this.baseURL}${permalink}.json`;
      const data = await this.makeRequest(commentsURL);
      
      const comments = [];
      
      if (data && data.length > 1 && data[1].data && data[1].data.children) {
        for (const comment of data[1].data.children) {
          if (comment.data && comment.data.body && comment.data.body !== '[deleted]') {
            comments.push({
              id: comment.data.id,
              body: comment.data.body,
              author: comment.data.author,
              score: comment.data.score,
              created_utc: comment.data.created_utc,
              created_date: moment.unix(comment.data.created_utc).format('YYYY-MM-DD HH:mm:ss'),
              parent_post: permalink
            });
          }
        }
      }
      
      return comments;
    } catch (error) {
      console.warn(`⚠️  Error fetching comments for ${permalink}:`, error.message);
      return [];
    }
  }

  async scrapeAllSubreddits() {
    console.log('🚀 Starting Reddit market research scraping for Kustodia...\n');
    
    for (const subreddit of this.targetSubreddits) {
      try {
        const subredditData = await this.searchSubreddit(subreddit, this.paymentFraudKeywords);
        
        this.results.posts.push(...subredditData.posts);
        this.results.comments.push(...subredditData.comments);
        
        // Update statistics
        this.results.summary.subredditStats[subreddit] = {
          posts: subredditData.posts.length,
          comments: subredditData.comments.length
        };

        // Rate limiting between subreddits
        await this.delay(3000);
        
      } catch (error) {
        console.error(`❌ Failed to scrape r/${subreddit}:`, error.message);
      }
    }

    // Update final statistics
    this.results.summary.totalPosts = this.results.posts.length;
    this.results.summary.totalComments = this.results.comments.length;
    
    // Keyword statistics
    for (const post of this.results.posts) {
      const keyword = post.keyword_matched;
      if (keyword) {
        this.results.summary.keywordStats[keyword] = (this.results.summary.keywordStats[keyword] || 0) + 1;
      }
    }

    console.log(`\n🎉 Scraping completed!`);
    console.log(`📊 Total Posts: ${this.results.summary.totalPosts}`);
    console.log(`💬 Total Comments: ${this.results.summary.totalComments}`);
  }

  async saveResults() {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const outputDir = './output';
    
    await fs.ensureDir(outputDir);

    // Save raw data as JSON
    const jsonFile = `${outputDir}/reddit_research_${timestamp}.json`;
    await fs.writeJson(jsonFile, this.results, { spaces: 2 });
    
    // Save posts as CSV for easy analysis
    const csvFile = `${outputDir}/reddit_posts_${timestamp}.csv`;
    const csvContent = this.results.posts.map(post => ({
      date: post.created_date,
      subreddit: post.subreddit,
      title: post.title,
      content: post.selftext?.substring(0, 500) + '...',
      author: post.author,
      score: post.score,
      comments: post.num_comments,
      keyword: post.keyword_matched,
      url: post.url
    }));

    const csvHeader = 'Date,Subreddit,Title,Content,Author,Score,Comments,Keyword,URL\n';
    const csvRows = csvContent.map(row => 
      `"${row.date}","${row.subreddit}","${row.title?.replace(/"/g, '""')}","${row.content?.replace(/"/g, '""')}","${row.author}",${row.score},${row.comments},"${row.keyword}","${row.url}"`
    ).join('\n');
    
    await fs.writeFile(csvFile, csvHeader + csvRows);

    console.log(`\n💾 Results saved:`);
    console.log(`📄 JSON: ${jsonFile}`);
    console.log(`📊 CSV: ${csvFile}`);

    return { jsonFile, csvFile };
  }

  async generateQuickReport() {
    console.log('\n📈 QUICK MARKET RESEARCH INSIGHTS FOR KUSTODIA');
    console.log('=' * 50);
    
    // Top subreddits by activity
    console.log('\n🏆 Top Subreddits (by posts found):');
    const sortedSubreddits = Object.entries(this.results.summary.subredditStats)
      .sort(([,a], [,b]) => b.posts - a.posts)
      .slice(0, 5);
    
    sortedSubreddits.forEach(([subreddit, stats], index) => {
      console.log(`  ${index + 1}. r/${subreddit}: ${stats.posts} posts, ${stats.comments} comments`);
    });

    // Most mentioned keywords
    console.log('\n🔑 Most Common Payment Fraud Keywords:');
    const sortedKeywords = Object.entries(this.results.summary.keywordStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10);
    
    sortedKeywords.forEach(([keyword, count], index) => {
      console.log(`  ${index + 1}. "${keyword}": ${count} mentions`);
    });

    // High-engagement posts (validation opportunities)
    console.log('\n🔥 High-Engagement Posts (Kustodia Opportunities):');
    const highEngagementPosts = this.results.posts
      .filter(post => post.score > 50 || post.num_comments > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    
    highEngagementPosts.forEach((post, index) => {
      console.log(`  ${index + 1}. [${post.score}⬆️ ${post.num_comments}💬] ${post.title.substring(0, 80)}...`);
      console.log(`      r/${post.subreddit} | ${post.created_date}`);
      console.log(`      ${post.url}\n`);
    });

    console.log('\n💡 KUSTODIA VALUE PROPOSITION VALIDATION:');
    
    // Count escrow mentions
    const escrowMentions = this.results.posts.filter(post => 
      post.title.toLowerCase().includes('escrow') || 
      post.selftext?.toLowerCase().includes('escrow')
    ).length;
    
    // Count fraud complaints
    const fraudComplaints = this.results.posts.filter(post =>
      post.keyword_matched?.includes('scam') || 
      post.keyword_matched?.includes('fraud')
    ).length;

    console.log(`🛡️  Escrow mentions found: ${escrowMentions}`);
    console.log(`⚠️  Fraud complaints found: ${fraudComplaints}`);
    console.log(`📊 Fraud-to-Escrow ratio: ${fraudComplaints}:${escrowMentions} (${Math.round((fraudComplaints/escrowMentions)*100)}% more fraud than escrow discussions)`);
    
    if (fraudComplaints > escrowMentions * 2) {
      console.log(`✅ STRONG MARKET VALIDATION: High fraud complaints vs low escrow awareness = Big opportunity!`);
    } else {
      console.log(`⚡ MODERATE VALIDATION: Some opportunity, but market may be more aware of escrow solutions.`);
    }
  }
}

// Main execution
async function main() {
  const scraper = new RedditScraper();
  
  try {
    await scraper.scrapeAllSubreddits();
    await scraper.saveResults();
    await scraper.generateQuickReport();
    
    console.log('\n🎯 Market research complete! Use this data to:');
    console.log('   1. Identify specific pain points to address in Kustodia marketing');
    console.log('   2. Find subreddits where you can engage with potential users');
    console.log('   3. Craft messaging that resonates with real user problems');
    console.log('   4. Validate your escrow service value proposition');
    
  } catch (error) {
    console.error('❌ Scraping failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = RedditScraper;
