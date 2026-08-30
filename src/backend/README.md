# 🐍 Portfolio Backend - Flask API

Complete Python/Flask backend for the portfolio application.

## Quick Overview

- **Framework**: Flask 2.3
- **Language**: Python 3.8+
- **Database**: MySQL 5.7+
- **Port**: 5000 (default)
- **Status**: Production-ready

## 📁 Project Structure

```
src/backend/
├── port.py                 # Main Flask application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment template
├── README.md              # This file
└── uploads/               # Auto-created on first upload
    ├── profile/           # Profile pictures
    ├── certificates/      # Certificate images
    └── gallery/           # Gallery photos
```

## 🚀 Getting Started

### Quick Start (3 steps)

1. **Setup environment:**

   ```bash
   cd src/backend
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run server:**
   ```bash
   python port.py
   ```

Visit `http://localhost:5000/api/health` to verify it's working.

## 📦 Dependencies

```
Flask==2.3.3              # Web framework
Flask-CORS==4.0.0         # Cross-Origin Resource Sharing
mysql-connector-python==8.0.33  # MySQL database driver
python-dotenv==1.0.0      # Environment variable management
Werkzeug==2.3.7           # WSGI utilities for file handling
```

## 🔧 Configuration

### Environment Variables (.env)

``` 
# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=portfolio

# Flask
FLASK_ENV=development
FLASK_DEBUG=True

# File Upload (optional)
MAX_UPLOAD_SIZE=50
ALLOWED_EXTENSIONS=png,jpg,jpeg,gif,webp

# Admin security - required for every write request (POST/PUT/DELETE).
ADMIN_TOKEN=change-me-to-a-long-random-secret

# Cloudinary image storage (uploads are served from here in production).
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 🔐 Admin Security

All mutating endpoints (`POST`, `PUT`, `DELETE`) require the `X-Admin-Token`
header to match `ADMIN_TOKEN`. Requests without it receive `401 Unauthorized`,
so the data cannot be changed by direct API calls even though the public site
hides the management buttons.

- Generate a secret: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Set it in `.env` (`ADMIN_TOKEN=...`) and on your hosting platform.
- The frontend sends it automatically after you sign in at `/admin`.
- The frontend verifies a token before unlocking by calling
  `POST /api/admin/login` with `{ "token": "..." }`.

### Port Configuration

Default port: `5000`

To change port, edit `port.py`:

```python
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)  # Changed to 5001
```

Then update frontend API URL in `src/App.js`:

```javascript
const API_URL = "http://localhost:5001";
```

## 📡 API Endpoints

All endpoints are under `/api` prefix.

### Profile Management

```
GET    /api/profile           # Get user profile (public)
POST   /api/profile           # Create/update profile (admin token required)
```

### CV Entries

```
GET    /api/cv-entries                    # Get all entries (public)
GET    /api/cv-entries?section_type=education  # Filter (public)
POST   /api/cv-entries                    # Create entry (admin token required)
PUT    /api/cv-entries/<id>               # Update entry (admin token required)
DELETE /api/cv-entries/<id>               # Delete entry (admin token required)
```

### Certificates

```
GET    /api/certificates      # Get all certificates (public)
POST   /api/certificates      # Upload certificate (admin token required)
DELETE /api/certificates/<id> # Delete certificate (admin token required)
```

### Gallery

```
GET    /api/gallery           # Get all photos (public)
POST   /api/gallery           # Upload photo (admin token required)
PUT    /api/gallery/<id>      # Update caption (admin token required)
DELETE /api/gallery/<id>      # Delete photo (admin token required)
```

### Utilities

```
GET    /api/health            # Health check (public)
POST   /api/admin/login       # Validate admin token (public)
GET    /uploads/<filename>    # Serve uploaded files (public)
```

All endpoints return a standardized JSON response (`{ status, message, data? }`).

## 💾 Database

### Auto-Created Tables

The application automatically creates these tables on first run:

1. **profile** - User profile information
2. **cv_entries** - Education, experience, and skills
3. **certificates** - Certificates with images
4. **gallery_photos** - Photo gallery with captions

### Database Schema

```sql
-- Profile
CREATE TABLE profile (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  bio TEXT,
  profile_image VARCHAR(255)
);

-- CV Entries
CREATE TABLE cv_entries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_type ENUM('education', 'experience', 'skill') NOT NULL,
  title VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  duration VARCHAR(100),
  description TEXT
);

-- Certificates
CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  image_url VARCHAR(255) NOT NULL
);

-- Gallery Photos
CREATE TABLE gallery_photos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caption VARCHAR(255),
  image_url VARCHAR(255) NOT NULL
);
```

## 📤 File Upload

### Supported Formats

- PNG (.png)
- JPEG (.jpg, .jpeg)
- GIF (.gif)
- WebP (.webp)

### Upload Handling

- Files automatically timestamped to prevent conflicts
- Organized by type (profile, certificates, gallery)
- Stored at: `src/backend/uploads/<type>/<filename>`
- Accessible at: `http://localhost:5000/uploads/<type>/<filename>`

### Form Field Names

- Profile image: `profile_image`
- Certificates: `image`
- Gallery: `image`

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "success",
  "message": "Server and database are healthy"
}
```

### Create Entry (curl example)

```bash
curl -X POST http://localhost:5000/api/cv-entries \
  -H "Content-Type: application/json" \
  -d '{
    "section_type": "education",
    "title": "Bachelor Degree",
    "organization": "University",
    "duration": "2020-2024",
    "description": "Computer Science"
  }'
```

### Upload File (curl example)

```bash
curl -X POST http://localhost:5000/api/certificates \
  -F "title=AWS Architect" \
  -F "issuer=Amazon" \
  -F "image=@certificate.jpg"
```

See the project [README](../README.md) for more examples.

## 🐛 Troubleshooting

### Common Issues

**"ModuleNotFoundError: No module named 'flask'"**

```bash
pip install -r requirements.txt
```

**"Cannot connect to MySQL server"**

```bash
# Windows
net start MySQL80

# macOS
brew services start mysql

# Linux
sudo service mysql start
```

**"Database portfolio not found"**

```sql
CREATE DATABASE portfolio;
```

**"Address already in use"**

- Change port in `port.py` (see Configuration)
- Or kill process: `lsof -i :5000` (macOS/Linux)

**"CORS error in frontend"**

- Verify backend is on port 5000
- Verify frontend is on port 3000
- Frontend should see CORS headers in response

### Enable Debug Mode

Edit `port.py`:

```python
if __name__ == '__main__':
    app.run(debug=True)  # Enables auto-reload and detailed errors
```

## 🚀 Running the Server

### Development Mode

```bash
python port.py
```

Server runs on `http://localhost:5000` with auto-reload on file changes.

### Production Mode

1. Update `.env`:

   ```
   FLASK_ENV=production
   FLASK_DEBUG=False
   ```

2. Install production server:

   ```bash
   pip install gunicorn
   ```

3. Run with Gunicorn:
   ```bash
   gunicorn -w 4 -b 0.0.0.0:5000 port:app
   ```

## 📊 Response Format

### Success Response

```json
{
  "status": "success",
  "message": "Operation completed",
  "data": {
    /* endpoint-specific data */
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error description"
}
```

## 🔐 Security Considerations

### Development

- CORS enabled for localhost
- Debug mode active
- Database passwords can be simple

### Production Checklist

- [ ] Disable debug mode (`FLASK_DEBUG=False`)
- [ ] Use strong database passwords
- [ ] Enable HTTPS/SSL
- [ ] Restrict CORS to trusted domains
- [ ] Validate file uploads
- [ ] Use environment variables for secrets
- [ ] Set up regular backups
- [ ] Use gunicorn or similar production server
- [ ] Rate limiting implementation
- [ ] File upload scanning

## 📈 Performance Tips

- Connection pooling (mysql-connector-python handles this)
- Query optimization in database
- Cache frequently accessed data
- Compress images before storing
- Use CDN for static files in production
- Monitor database query performance

## 🔄 Database Maintenance

### Backup Database

```bash
mysqldump -u root -p portfolio > backup.sql
```

### Restore Database

```bash
mysql -u root -p portfolio < backup.sql
```

### Clear All Data

```sql
USE portfolio;
DELETE FROM profile;
DELETE FROM cv_entries;
DELETE FROM certificates;
DELETE FROM gallery_photos;
```

### Reset Database

```sql
DROP DATABASE portfolio;
CREATE DATABASE portfolio;
```

## 📚 Project Lifecycle

### Initial Setup (First Run)

1. Python installed
2. Dependencies: `pip install -r requirements.txt`
3. Environment: Create `.env` file
4. Database: Create `portfolio` database
5. Run: `python port.py`
6. Tables auto-created on first request

### Daily Usage

```bash
python port.py
```

Keep terminal open. Ctrl+C to stop.

### Maintenance

- Monitor disk space for uploads
- Check database size: `SELECT SUM(data_length + index_length) FROM information_schema.tables WHERE table_schema='portfolio';`
- Backup regularly
- Update dependencies: `pip install --upgrade -r requirements.txt`

## 🔗 Integration with Frontend

The React frontend connects to this backend:

1. **API URL**: `http://localhost:5000`
2. **Port**: Must match (default 5000)
3. **CORS**: Enabled for development
4. **File Uploads**: Send FormData with `image` field

Frontend components automatically:

- Parse response structure: `response.data.data`
- Construct image URLs: `http://localhost:5000${imageUrl}`
- Handle errors gracefully

## 📖 Documentation

- **Project README**: [../README.md](../README.md)

## 🤝 Support

### Debugging

1. Check terminal output for errors
2. Verify database connection
3. Test API with curl/Postman
4. Check browser Network tab for requests
5. Review error response messages

### Useful Commands

```bash
# Check Python version
python --version

# Check installed packages
pip list

# Freeze current environment
pip freeze > requirements.txt

# Virtual environment activation
source venv/bin/activate      # macOS/Linux
venv\Scripts\activate          # Windows

# Run with different port
PORT=5001 python port.py
```

## 🎯 Checklist for First Run

- [ ] Python 3.8+ installed
- [ ] MySQL installed and running
- [ ] Created portfolio database
- [ ] Copied `.env.example` to `.env`
- [ ] Updated `.env` with your MySQL credentials
- [ ] Installed dependencies: `pip install -r requirements.txt`
- [ ] Started server: `python port.py`
- [ ] Verified health check: `curl http://localhost:5000/api/health`
- [ ] Tables auto-created in database
- [ ] Can connect from frontend

## 📞 Quick Reference

| Task            | Command                                                        |
| --------------- | -------------------------------------------------------------- |
| Start server    | `python port.py`                                               |
| Test connection | `curl http://localhost:5000/api/health`                        |
| Start MySQL     | `net start MySQL80` (Win) or `brew services start mysql` (Mac) |
| Create database | `mysql -u root -p -e "CREATE DATABASE portfolio;"`             |
| Install deps    | `pip install -r requirements.txt`                              |
| Update deps     | `pip install --upgrade -r requirements.txt`                    |
| View env vars   | `cat .env`                                                     |

## 🎉 You're All Set!

Your Flask backend is ready to serve the React frontend.

**Next steps:**

1. ✅ Backend running on localhost:5000
2. ✅ Frontend running on localhost:3000
3. ✅ Start using your portfolio!

For issues, see the Troubleshooting section above.

---

**Happy coding! 🚀**
