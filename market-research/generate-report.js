#!/usr/bin/env node

const fs = require('fs-extra');
const moment = require('moment');

class MarketResearchReporter {
  constructor() {
    this.report = {
      executiveSummary: {},
      keyFindings: {},
      marketOpportunity: {},
      competitiveAnalysis: {},
      recommendations: {},
      appendix: {}
    };
  }

  async loadData() {
    const outputDir = './output';
    
    try {
      const files = await fs.readdir(outputDir);
      
      // Load Reddit data
      const redditFiles = files.filter(file => file.startsWith('reddit_research_') && file.endsWith('.json'));
      const latestRedditFile = redditFiles.sort().reverse()[0];
      this.redditData = await fs.readJson(`${outputDir}/${latestRedditFile}`);
      
      // Load sentiment analysis
      const sentimentFiles = files.filter(file => file.startsWith('sentiment_analysis_') && file.endsWith('.json'));
      const latestSentimentFile = sentimentFiles.sort().reverse()[0];
      this.sentimentData = await fs.readJson(`${outputDir}/${latestSentimentFile}`);
      
      return true;
    } catch (error) {
      console.error('❌ Error loading data files:', error.message);
      return false;
    }
  }

  generateExecutiveSummary() {
    const totalPosts = this.redditData.summary.totalPosts;
    const totalComments = this.redditData.summary.totalComments;
    const fraudMentions = this.sentimentData.summary.fraudSentiment.mentions;
    const escrowMentions = this.sentimentData.summary.escrowSentiment.mentions;
    
    this.report.executiveSummary = {
      dataPoints: {
        totalPostsAnalyzed: totalPosts,
        totalCommentsAnalyzed: totalComments,
        subredditsMonitored: Object.keys(this.redditData.summary.subredditStats).length,
        fraudDiscussions: fraudMentions,
        escrowMentions: escrowMentions
      },
      keyInsights: [
        `Analyzed ${totalPosts} Reddit posts across ${Object.keys(this.redditData.summary.subredditStats).length} subreddits`,
        `Found ${fraudMentions} fraud-related discussions vs only ${escrowMentions} escrow mentions`,
        `${Math.round((fraudMentions/escrowMentions)*100)}x more fraud complaints than escrow awareness`,
        `Average fraud sentiment: ${this.sentimentData.summary.fraudSentiment.averageScore.toFixed(2)} (highly negative)`,
        `Average escrow sentiment: ${this.sentimentData.summary.escrowSentiment.averageScore.toFixed(2)} (positive)`
      ],
      marketValidation: fraudMentions > escrowMentions * 2 ? 'STRONG' : 'MODERATE'
    };
  }

  generateKeyFindings() {
    // Top subreddits by fraud discussions
    const subredditStats = Object.entries(this.redditData.summary.subredditStats)
      .sort(([,a], [,b]) => b.posts - a.posts);
    
    // Most common keywords
    const keywordStats = Object.entries(this.redditData.summary.keywordStats)
      .sort(([,a], [,b]) => b - a);
    
    // Pain points analysis
    const allPainPoints = this.sentimentData.posts.flatMap(post => post.pain_points);
    const painPointCounts = allPainPoints.reduce((counts, point) => {
      counts[point] = (counts[point] || 0) + 1;
      return counts;
    }, {});
    
    this.report.keyFindings = {
      topSubreddits: subredditStats.slice(0, 5).map(([name, stats]) => ({
        subreddit: name,
        posts: stats.posts,
        comments: stats.comments,
        engagementRate: Math.round((stats.comments / stats.posts) * 100) / 100
      })),
      
      topKeywords: keywordStats.slice(0, 10).map(([keyword, count]) => ({
        keyword,
        mentions: count,
        percentage: Math.round((count / this.redditData.summary.totalPosts) * 10000) / 100
      })),
      
      topPainPoints: Object.entries(painPointCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 8)
        .map(([painPoint, count]) => ({
          painPoint: painPoint.replace(/_/g, ' '),
          mentions: count,
          percentage: Math.round((count / this.sentimentData.summary.totalAnalyzed) * 10000) / 100
        })),
      
      sentimentBreakdown: {
        positive: this.sentimentData.summary.sentimentDistribution.positive,
        neutral: this.sentimentData.summary.sentimentDistribution.neutral,
        negative: this.sentimentData.summary.sentimentDistribution.negative,
        averageScore: this.sentimentData.summary.averageSentiment
      }
    };
  }

  generateMarketOpportunity() {
    const fraudPosts = this.sentimentData.posts.filter(post => post.is_fraud_related);
    const escrowAwarePosts = fraudPosts.filter(post => 
      post.solutions_mentioned.includes('escrow_service') || 
      post.solutions_mentioned.includes('third_party')
    );
    
    const highEngagementFraud = fraudPosts.filter(post => 
      post.score > 20 || post.num_comments > 10
    );
    
    this.report.marketOpportunity = {
      totalFraudDiscussions: fraudPosts.length,
      escrowAwareDiscussions: escrowAwarePosts.length,
      unawareDiscussions: fraudPosts.length - escrowAwarePosts.length,
      opportunityGap: Math.round(((fraudPosts.length - escrowAwarePosts.length) / fraudPosts.length) * 100),
      
      highEngagementOpportunities: highEngagementFraud.length,
      averageFraudSentiment: this.sentimentData.summary.fraudSentiment.averageScore,
      averageEscrowSentiment: this.sentimentData.summary.escrowSentiment.averageScore,
      
      targetSubreddits: this.report.keyFindings.topSubreddits
        .filter(sub => sub.posts > 5)
        .map(sub => sub.subreddit),
      
      marketSize: {
        primaryMarket: fraudPosts.length,
        secondaryMarket: this.redditData.summary.totalPosts,
        penetrationOpportunity: Math.round((fraudPosts.length / this.redditData.summary.totalPosts) * 100)
      }
    };
  }

  generateCompetitiveAnalysis() {
    // Analyze mentions of competing services (Mexican market focus)
    const competitors = {
      // Mexican payment services
      'mercadopago': { mentions: 0, sentiment: [] },
      'mercado pago': { mentions: 0, sentiment: [] },
      'oxxo': { mentions: 0, sentiment: [] },
      'bancomer': { mentions: 0, sentiment: [] },
      'banorte': { mentions: 0, sentiment: [] },
      'santander': { mentions: 0, sentiment: [] },
      'spei': { mentions: 0, sentiment: [] },
      'clip': { mentions: 0, sentiment: [] },
      'conekta': { mentions: 0, sentiment: [] },
      // International services used in Mexico
      'paypal': { mentions: 0, sentiment: [] },
      'western union': { mentions: 0, sentiment: [] },
      'moneygram': { mentions: 0, sentiment: [] },
      // Escrow services
      'escrow.com': { mentions: 0, sentiment: [] },
      'escrow': { mentions: 0, sentiment: [] },
      'custodia': { mentions: 0, sentiment: [] },
      'fideicomiso': { mentions: 0, sentiment: [] }
    };
    
    this.sentimentData.posts.forEach(post => {
      const text = `${post.title} ${post.selftext || ''}`.toLowerCase();
      
      Object.keys(competitors).forEach(competitor => {
        if (text.includes(competitor)) {
          competitors[competitor].mentions++;
          competitors[competitor].sentiment.push(post.sentiment.score);
        }
      });
    });
    
    // Calculate average sentiment for each competitor
    Object.keys(competitors).forEach(competitor => {
      const sentiments = competitors[competitor].sentiment;
      competitors[competitor].averageSentiment = sentiments.length > 0 
        ? sentiments.reduce((sum, score) => sum + score, 0) / sentiments.length 
        : 0;
    });
    
    this.report.competitiveAnalysis = {
      competitors: Object.entries(competitors)
        .filter(([, data]) => data.mentions > 0)
        .sort(([, a], [, b]) => b.mentions - a.mentions)
        .map(([name, data]) => ({
          name,
          mentions: data.mentions,
          averageSentiment: Math.round(data.averageSentiment * 100) / 100,
          sentimentCategory: data.averageSentiment > 1 ? 'positive' : 
                           data.averageSentiment < -1 ? 'negative' : 'neutral'
        })),
      
      gapAnalysis: {
        escrowServiceGap: competitors.escrow.mentions < (fraudPosts.length * 0.1),
        traditionalPaymentFrustration: 
          (competitors.paypal.averageSentiment + competitors.venmo.averageSentiment) / 2 < 0
      }
    };
  }

  generateRecommendations() {
    const topSubreddits = this.report.keyFindings.topSubreddits.slice(0, 3);
    const topPainPoints = this.report.keyFindings.topPainPoints.slice(0, 3);
    
    this.report.recommendations = {
      immediate: [
        `Target r/${topSubreddits[0].subreddit} first - highest fraud discussion volume (${topSubreddits[0].posts} posts)`,
        `Address "${topPainPoints[0].painPoint}" pain point - mentioned in ${topPainPoints[0].percentage}% of discussions`,
        `Create educational content about escrow benefits - ${this.report.marketOpportunity.opportunityGap}% gap in escrow awareness`,
        `Engage in high-sentiment fraud posts with helpful escrow education`
      ],
      
      shortTerm: [
        'Develop Reddit community engagement strategy for top 5 subreddits',
        'Create content addressing top 3 pain points identified',
        'Build referral program targeting fraud victims in these communities',
        'Monitor sentiment trends and adjust messaging accordingly'
      ],
      
      longTerm: [
        'Establish thought leadership in payment security discussions',
        'Partner with subreddit moderators for AMA sessions',
        'Develop case studies from Reddit fraud stories (anonymized)',
        'Build automated monitoring for new fraud discussions and opportunities'
      ],
      
      contentStrategy: [
        `Focus messaging on "${topPainPoints[0].painPoint}" and "${topPainPoints[1].painPoint}"`,
        'Create fraud prevention guides targeting Reddit communities',
        'Develop escrow education content for beginners',
        'Share success stories and testimonials in relevant discussions'
      ],
      
      marketingChannels: {
        primary: topSubreddits.map(sub => `r/${sub.subreddit}`),
        secondary: this.report.marketOpportunity.targetSubreddits.slice(3),
        engagementApproach: 'Educational and helpful, not promotional'
      }
    };
  }

  async generateHTMLReport() {
    const timestamp = moment().format('YYYY-MM-DD HH:mm:ss');
    
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kustodia Market Research Report - Reddit Analysis</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px; }
        .section { background: white; padding: 25px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .metric { display: inline-block; margin: 10px 15px; padding: 15px; background: #f8f9fa; border-radius: 5px; text-align: center; }
        .metric-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .metric-label { font-size: 12px; color: #666; text-transform: uppercase; }
        .insight { background: #e8f4fd; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; }
        .opportunity { background: #f0f9e8; border-left: 4px solid #28a745; padding: 15px; margin: 15px 0; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        table { width: 100%; border-collapse: collapse; margin: 15px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: 600; }
        .progress-bar { background: #e9ecef; border-radius: 10px; height: 20px; overflow: hidden; margin: 5px 0; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, #28a745, #20c997); transition: width 0.3s ease; }
        .sentiment-positive { color: #28a745; font-weight: bold; }
        .sentiment-negative { color: #dc3545; font-weight: bold; }
        .sentiment-neutral { color: #6c757d; font-weight: bold; }
        h1, h2, h3 { color: #333; }
        h2 { border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🚀 Kustodia Market Research Report</h1>
        <p>Reddit Analysis for Payment Fraud & Escrow Services</p>
        <p>Generated: ${timestamp}</p>
    </div>

    <div class="section">
        <h2>📊 Executive Summary</h2>
        <div class="insight">
            <strong>Market Validation: ${this.report.executiveSummary.marketValidation}</strong> - 
            Strong opportunity identified for Kustodia's escrow services in payment fraud prevention.
        </div>
        
        <div style="text-align: center;">
            <div class="metric">
                <div class="metric-value">${this.report.executiveSummary.dataPoints.totalPostsAnalyzed}</div>
                <div class="metric-label">Posts Analyzed</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.report.executiveSummary.dataPoints.subredditsMonitored}</div>
                <div class="metric-label">Subreddits</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.report.executiveSummary.dataPoints.fraudDiscussions}</div>
                <div class="metric-label">Fraud Discussions</div>
            </div>
            <div class="metric">
                <div class="metric-value">${this.report.executiveSummary.dataPoints.escrowMentions}</div>
                <div class="metric-label">Escrow Mentions</div>
            </div>
        </div>

        <h3>Key Insights:</h3>
        <ul>
            ${this.report.executiveSummary.keyInsights.map(insight => `<li>${insight}</li>`).join('')}
        </ul>
    </div>

    <div class="section">
        <h2>🎯 Market Opportunity</h2>
        
        <div class="opportunity">
            <strong>Huge Opportunity Identified:</strong> ${this.report.marketOpportunity.opportunityGap}% of fraud discussions 
            show no awareness of escrow solutions!
        </div>

        <table>
            <thead>
                <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>Opportunity</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Total Fraud Discussions</td>
                    <td>${this.report.marketOpportunity.totalFraudDiscussions}</td>
                    <td>Primary target market</td>
                </tr>
                <tr>
                    <td>Escrow-Aware Discussions</td>
                    <td>${this.report.marketOpportunity.escrowAwareDiscussions}</td>
                    <td>Current market education</td>
                </tr>
                <tr>
                    <td>Education Gap</td>
                    <td class="highlight">${this.report.marketOpportunity.unawareDiscussions}</td>
                    <td>Direct opportunity for Kustodia</td>
                </tr>
                <tr>
                    <td>High-Engagement Posts</td>
                    <td>${this.report.marketOpportunity.highEngagementOpportunities}</td>
                    <td>Priority engagement targets</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>🔍 Key Findings</h2>
        
        <h3>Top Subreddits (by fraud discussion volume):</h3>
        <table>
            <thead>
                <tr>
                    <th>Subreddit</th>
                    <th>Posts</th>
                    <th>Comments</th>
                    <th>Engagement Rate</th>
                </tr>
            </thead>
            <tbody>
                ${this.report.keyFindings.topSubreddits.map(sub => `
                    <tr>
                        <td>r/${sub.subreddit}</td>
                        <td>${sub.posts}</td>
                        <td>${sub.comments}</td>
                        <td>${sub.engagementRate}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <h3>Top Pain Points (Kustodia can solve):</h3>
        <div>
            ${this.report.keyFindings.topPainPoints.map(pain => `
                <div style="margin: 10px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <span><strong>${pain.painPoint}</strong></span>
                        <span>${pain.mentions} mentions (${pain.percentage}%)</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${pain.percentage * 2}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>

        <h3>Sentiment Analysis:</h3>
        <div style="text-align: center;">
            <div class="metric">
                <div class="metric-value sentiment-negative">${this.report.keyFindings.sentimentBreakdown.negative}</div>
                <div class="metric-label">Negative Posts</div>
            </div>
            <div class="metric">
                <div class="metric-value sentiment-neutral">${this.report.keyFindings.sentimentBreakdown.neutral}</div>
                <div class="metric-label">Neutral Posts</div>
            </div>
            <div class="metric">
                <div class="metric-value sentiment-positive">${this.report.keyFindings.sentimentBreakdown.positive}</div>
                <div class="metric-label">Positive Posts</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>🏆 Competitive Analysis</h2>
        
        <table>
            <thead>
                <tr>
                    <th>Service</th>
                    <th>Mentions</th>
                    <th>Avg Sentiment</th>
                    <th>Category</th>
                </tr>
            </thead>
            <tbody>
                ${this.report.competitiveAnalysis.competitors.map(comp => `
                    <tr>
                        <td>${comp.name}</td>
                        <td>${comp.mentions}</td>
                        <td class="sentiment-${comp.sentimentCategory}">${comp.averageSentiment}</td>
                        <td><span class="sentiment-${comp.sentimentCategory}">${comp.sentimentCategory}</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="section">
        <h2>💡 Strategic Recommendations</h2>
        
        <h3>🚀 Immediate Actions:</h3>
        <ul>
            ${this.report.recommendations.immediate.map(rec => `<li>${rec}</li>`).join('')}
        </ul>

        <h3>📈 Short-term Strategy:</h3>
        <ul>
            ${this.report.recommendations.shortTerm.map(rec => `<li>${rec}</li>`).join('')}
        </ul>

        <h3>🎯 Content Strategy:</h3>
        <ul>
            ${this.report.recommendations.contentStrategy.map(rec => `<li>${rec}</li>`).join('')}
        </ul>

        <div class="opportunity">
            <strong>Primary Target:</strong> Focus on r/${this.report.recommendations.marketingChannels.primary[0]} 
            with educational content about escrow benefits and fraud prevention.
        </div>
    </div>

    <div class="footer">
        <p>Report generated by Kustodia Market Research Tool</p>
        <p>Data source: Reddit API | Analysis: Sentiment Analysis + Market Research</p>
    </div>
</body>
</html>`;

    const timestamp_file = moment().format('YYYY-MM-DD_HH-mm-ss');
    const reportFile = `./output/kustodia_market_report_${timestamp_file}.html`;
    await fs.writeFile(reportFile, html);
    
    return reportFile;
  }

  async generateJSONReport() {
    const timestamp = moment().format('YYYY-MM-DD_HH-mm-ss');
    const reportFile = `./output/kustodia_market_report_${timestamp}.json`;
    
    const fullReport = {
      metadata: {
        generatedAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        dataSource: 'Reddit API',
        analysisType: 'Payment Fraud Market Research',
        targetCompany: 'Kustodia'
      },
      ...this.report
    };
    
    await fs.writeJson(reportFile, fullReport, { spaces: 2 });
    return reportFile;
  }

  async generateReport() {
    console.log('📋 Generating comprehensive market research report...');
    
    // Generate all report sections
    this.generateExecutiveSummary();
    this.generateKeyFindings();
    this.generateMarketOpportunity();
    this.generateCompetitiveAnalysis();
    this.generateRecommendations();
    
    // Save reports in multiple formats
    const htmlFile = await this.generateHTMLReport();
    const jsonFile = await this.generateJSONReport();
    
    console.log(`\n📊 Market Research Report Generated!`);
    console.log(`🌐 HTML Report: ${htmlFile}`);
    console.log(`📄 JSON Report: ${jsonFile}`);
    
    console.log(`\n🎯 KEY TAKEAWAY FOR KUSTODIA:`);
    console.log(`   Market Validation: ${this.report.executiveSummary.marketValidation}`);
    console.log(`   Opportunity Gap: ${this.report.marketOpportunity.opportunityGap}%`);
    console.log(`   Primary Target: r/${this.report.recommendations.marketingChannels.primary[0]}`);
    
    return { htmlFile, jsonFile };
  }
}

// Main execution
async function main() {
  const reporter = new MarketResearchReporter();
  
  const dataLoaded = await reporter.loadData();
  if (!dataLoaded) {
    console.error('❌ Unable to load required data files. Please run reddit-scraper.js and sentiment-analyzer.js first.');
    process.exit(1);
  }
  
  try {
    await reporter.generateReport();
  } catch (error) {
    console.error('❌ Report generation failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MarketResearchReporter;
