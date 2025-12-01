# SkunkSquad Networking Backend - Deployment Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb skunksquad_networking

# Run schema
psql -d skunksquad_networking -f db/schema.sql
```

### 3. Configure Environment
```bash
# Copy the production template
cp .env.production .env

# CRITICAL: Edit .env and update:
# - JWT_SECRET (generate a secure random string)
# - DB_PASSWORD (your PostgreSQL password)
# - CORS_ORIGIN (add your production domain)

# Generate secure JWT secret:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Seed Sample Data (Optional)
```bash
npm run seed
```

### 5. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## 🔧 SkunkSquad Configuration

The backend is **pre-configured** for SkunkSquad:

✅ **Contract**: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`  
✅ **Network**: Ethereum Mainnet (Chain ID: 1)  
✅ **RPC**: Public nodes + Infura backup  
✅ **Port**: 3001 (payment server uses 3002)  

**No changes needed** unless you want to customize!

## 📝 Environment Variables Checklist

- [ ] `JWT_SECRET` - Generated secure random string (**CRITICAL**)
- [ ] `DB_PASSWORD` - Your PostgreSQL password
- [ ] `CORS_ORIGIN` - Your production domain(s)
- [ ] `PORT` - Keep as 3001 (default)
- [ ] Contract settings - **Already configured**, leave as-is

## 🌐 Production Deployment

### Option 1: Deploy to Railway

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add PostgreSQL addon in Railway dashboard
4. Set environment variables in Railway dashboard

### Option 2: Deploy to Heroku

1. Create Heroku app:
```bash
heroku create skunksquad-networking
```

2. Add PostgreSQL:
```bash
heroku addons:create heroku-postgresql:mini
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set CORS_ORIGIN=https://skunksquadnft.com
# ... add other vars
```

4. Deploy:
```bash
git push heroku main
```

### Option 3: VPS (DigitalOcean, AWS, etc.)

1. SSH into your server
2. Install Node.js and PostgreSQL
3. Clone repo and setup
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start networking-server.js --name skunksquad-api
pm2 startup
pm2 save
```

5. Setup Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name api.skunksquadnft.com;

    location /networking/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

- [ ] Strong JWT_SECRET (64+ random characters)
- [ ] Secure database password
- [ ] CORS configured with actual domains only
- [ ] HTTPS enabled in production
- [ ] Database firewall rules configured
- [ ] Rate limiting enabled (already configured)
- [ ] Environment variables secured (not in git)

## 📊 Database Maintenance

### Backup
```bash
pg_dump skunksquad_networking > backup.sql
```

### Restore
```bash
psql skunksquad_networking < backup.sql
```

### Clean old sessions
```sql
DELETE FROM member_sessions WHERE expires_at < NOW();
```

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{"status":"ok","timestamp":"2025-11-30T..."}
```

### Test Authentication
```bash
curl -X POST http://localhost:3001/api/auth/wallet \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x..."}'
```

## 🐛 Troubleshooting

### Port 3001 already in use
```bash
# Find process
lsof -i :3001

# Kill process
kill -9 <PID>
```

### Database connection error
- Check PostgreSQL is running
- Verify DB credentials in .env
- Ensure database exists

### NFT verification failing
- Check RPC endpoint is accessible
- Verify contract address is correct
- Test with a wallet that owns SkunkSquad NFTs

## 📈 Monitoring

Monitor these metrics in production:
- API response times
- Database connection pool
- Memory usage
- Error rates
- Active sessions

## 🔄 Updates

To update the backend:
```bash
git pull
npm install
pm2 restart skunksquad-api
```

## 🆘 Support

For issues or questions:
- Check logs: `pm2 logs skunksquad-api`
- Review error messages
- Check database connectivity
- Verify environment variables

## ✅ Post-Deployment

After deploying:
1. Test authentication with a real wallet
2. Verify NFT ownership checking works
3. Test member directory and search
4. Check connection requests work
5. Monitor logs for errors
6. Setup automated backups
7. Configure monitoring/alerts

---

**Server Status**: Running on port **3001**  
**Payment Server**: Running on port **3002** (separate)  
**Contract**: `0xAa5C50099bEb130c8988324A0F6Ebf65979f10EF`  
**Network**: Ethereum Mainnet
