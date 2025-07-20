# 🚀 Kustodia Market Research Tool

Reddit scraper and sentiment analyzer to validate Kustodia's escrow service value proposition by analyzing payment fraud discussions.

## 🎯 Purpose

This tool helps validate Kustodia's market opportunity by:
- Scraping Reddit for payment fraud discussions
- Analyzing sentiment around fraud vs escrow services
- Identifying target subreddits and pain points
- Generating actionable market insights

## 📋 What It Analyzes

### Target Subreddits
- r/scams, r/personalfinance, r/entrepreneur
- r/ecommerce, r/cryptocurrency, r/paypal
- r/venmo, r/cashapp, r/legaladvice
- r/smallbusiness, r/freelance, r/beermoney

### Key Metrics
- Payment fraud complaint frequency
- Escrow service awareness gaps
- User sentiment about payment security
- Pain points Kustodia can solve
- Competitive landscape analysis

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Market Research
```bash
# Step 1: Scrape Reddit data
npm start

# Step 2: Analyze sentiment
npm run analyze

# Step 3: Generate comprehensive report
npm run report
```

### 3. View Results
- Open `output/kustodia_market_report_[timestamp].html` in your browser
- Review JSON data in `output/` folder

## 📊 Expected Output

### Console Insights
- Real-time scraping progress
- Quick market validation summary
- Top opportunities identified
- Sentiment analysis breakdown

### Generated Files
- **HTML Report**: Beautiful market research dashboard
- **JSON Data**: Raw data for further analysis
- **CSV Export**: Posts data for spreadsheet analysis

## 🎯 Key Insights You'll Get

### Market Validation
- Fraud complaint volume vs escrow awareness
- Opportunity gap percentage
- Market validation strength (STRONG/MODERATE)

### Target Identification
- Best subreddits to engage with
- High-opportunity posts to comment on
- Pain points to address in marketing

### Competitive Intelligence
- How users feel about PayPal, Venmo, etc.
- Gaps in current payment solutions
- Escrow service sentiment analysis

## 🔧 Configuration

### Environment Variables (Optional)
Copy `.env.example` to `.env` and customize:

```bash
# Reddit API (for higher rate limits)
REDDIT_CLIENT_ID=your_client_id
REDDIT_CLIENT_SECRET=your_client_secret

# Analysis settings
MAX_POSTS_PER_SUBREDDIT=100
SENTIMENT_THRESHOLD=0.1
```

### Custom Keywords
Edit `reddit-scraper.js` to modify:
- Target subreddits
- Search keywords
- Pain point patterns

## 📈 Using the Results

### Immediate Actions
1. **Target Top Subreddits**: Focus on communities with highest fraud discussions
2. **Address Pain Points**: Create content for most common user problems
3. **Engage Strategically**: Comment helpfully on high-engagement fraud posts

### Content Strategy
- Create fraud prevention educational content
- Address specific pain points identified
- Share escrow success stories in relevant discussions

### Marketing Opportunities
- Subreddits with low escrow awareness but high fraud complaints
- Posts with negative sentiment about traditional payment methods
- Users actively seeking payment security solutions

## 🔄 Running Regularly

### Weekly Analysis
```bash
# Quick weekly scan
npm start && npm run analyze
```

### Monthly Deep Dive
```bash
# Full analysis with report
npm start && npm run analyze && npm run report
```

## 📊 Sample Results Preview

**Expected findings:**
- 🔥 High fraud complaint volume (validation!)
- 📉 Low escrow service awareness (opportunity!)
- 🎯 Clear pain points to address
- 📍 Specific subreddits to target
- 💬 Actual user language to use in marketing

## 🚨 Rate Limiting & Ethics

- Built-in delays to respect Reddit's API limits
- No spam or promotional posting
- Educational engagement approach only
- Respects Reddit's terms of service

## 🆘 Troubleshooting

### Common Issues
- **"No posts found"**: Try increasing MAX_POSTS_PER_SUBREDDIT
- **Rate limiting**: Script includes automatic delays
- **Missing dependencies**: Run `npm install` first

### Getting Better Results
- Run during peak Reddit hours (evening PST)
- Adjust keywords for your specific market
- Focus on subreddits most relevant to your users

---

**Ready to validate Kustodia's market opportunity? Run `npm start` to begin!** 🚀
