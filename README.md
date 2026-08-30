# 🎯 Portfolio Application - Complete Documentation

A full-stack portfolio application built with **React** (frontend) and **Flask + Python** (backend) with MySQL database for storing profile, CV, certificates, and gallery photos.

## ✨ Features

- 📸 **Profile Management** - Add profile picture, bio, and professional details
- 📚 **CV/Experience Tracking** - Manage education, work experience, and skills
- 🏆 **Certificates** - Upload and display certificates with images
- 📷 **Photo Gallery** - Store and showcase graduation and event photos
- 💾 **Data Persistence** - All data stored in MySQL database
- 🎨 **Beautiful UI** - Responsive design with gradient themes
- 🔒 **File Upload** - Secure file handling with validation
- 🚀 **RESTful API** - Complete Flask backend with standardized responses

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI framework
- **Axios** - HTTP client for API calls
- **CSS3** - Styling with responsive design
- **JavaScript (ES6+)** - Programming language

### Backend

- **Python 3.8+** - Programming language
- **Flask 2.3** - Web framework
- **Flask-CORS** - Cross-Origin Resource Sharing
- **MySQL 5.7+** - Database
- **mysql-connector-python** - MySQL driver

## 📁 Project Structure

```
my-portifolio/
├── src/
│   ├── backend/                   # Flask Python backend
│   │   ├── port.py                # Main Flask application
│   │   ├── requirements.txt       # Python dependencies
│   │   ├── .env.example           # Example env file
│   │   └── README.md              # Backend readme
│   ├── components/                # React components
│   │   ├── Profile.jsx            # Profile component
│   │   ├── CV.jsx                 # CV management
│   │   ├── Certificates.jsx       # Certificate upload
│   │   ├── Gallery.jsx            # Photo gallery
│   │   ├── AssetPreview.jsx       # Image/PDF preview
│   │   └── LoadingSpinner.jsx     # Loading indicator
│   ├── styles/                    # Component styles
│   ├── App.js                     # Main app component
│   ├── App.css                    # Global styles
│   ├── api.js                     # Axios instance & helpers
│   └── index.js                   # React entry point
├── public/                        # Static files
├── package.json                   # Frontend dependencies
└── README.md                      # Project readme
```

## 🚀 Quick Start

### Prerequisites

- **Node.js 14+** - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/)
- **MySQL 5.7+** - [Download](https://dev.mysql.com/downloads/mysql/)

### 5-Minute Setup

#### 1. Create MySQL Database

```bash
mysql -u root -p
CREATE DATABASE portfolio;
EXIT;
```

#### 2. Setup Backend

```bash
cd src/backend
cp .env.example .env
# Edit .env with your MySQL credentials
pip install -r requirements.txt
python port.py
```

#### 3. Setup Frontend (New Terminal)

```bash
npm install
npm start
```

Visit `http://localhost:3000` and start using your portfolio! 🎉

## 📖 Detailed Setup

### Frontend Setup

`npm install` then `npm start` launches the app at `http://localhost:3000`.

### Backend Setup

See [src/backend/README.md](./src/backend/README.md) for the full Flask + MySQL setup.

## 📡 API Endpoints

### Base URL

```
http://localhost:5000/api
```

### Profile

- `GET /api/profile` - Get profile information
- `POST /api/profile` - Create/update profile (with image upload)

### CV Entries

- `GET /api/cv-entries` - Get all CV entries
- `GET /api/cv-entries?section_type=education` - Filter by type
- `POST /api/cv-entries` - Create CV entry
- `PUT /api/cv-entries/<id>` - Update CV entry
- `DELETE /api/cv-entries/<id>` - Delete CV entry

### Certificates

- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Upload certificate (with image)
- `DELETE /api/certificates/<id>` - Delete certificate

### Gallery

- `GET /api/gallery` - Get all gallery photos
- `POST /api/gallery` - Upload photo (with image)
- `PUT /api/gallery/<id>` - Update photo caption
- `DELETE /api/gallery/<id>` - Delete photo

### Utilities

- `GET /api/health` - Server health check
- `GET /uploads/<filename>` - Serve uploaded files

The backend implementation and response format are documented in [src/backend/README.md](./src/backend/README.md).

## 🔧 Configuration

### Frontend Configuration

Update `src/App.js` to change backend URL if needed:

```javascript
// Current (default)
const API_URL = "http://localhost:5000";

// For different server
const API_URL = "http://your-server:5000";
```

### Backend Configuration

Create `src/backend/.env`:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=portfolio
FLASK_ENV=development
FLASK_DEBUG=True
```

## 📚 Database Schema

### profile

```sql
- id (INT, PRIMARY KEY)
- name (VARCHAR 100, NOT NULL)
- title (VARCHAR 255, NOT NULL)
- bio (TEXT)
- profile_image (VARCHAR 255)
```

### cv_entries

```sql
- id (INT, PRIMARY KEY)
- section_type (ENUM: education, experience, skill)
- title (VARCHAR 255, NOT NULL)
- organization (VARCHAR 255)
- duration (VARCHAR 100)
- description (TEXT)
```

### certificates

```sql
- id (INT, PRIMARY KEY)
- title (VARCHAR 255, NOT NULL)
- issuer (VARCHAR 255)
- image_url (VARCHAR 255, NOT NULL)
```

### gallery_photos

```sql
- id (INT, PRIMARY KEY)
- caption (VARCHAR 255)
- image_url (VARCHAR 255, NOT NULL)
```

## 💾 File Upload

### Supported Formats

- **Images:** PNG, JPG, JPEG, GIF, WebP
- **Max Size:** 50MB

### Upload Locations

- Profile pictures: `src/backend/uploads/profile/`
- Certificates: `src/backend/uploads/certificates/`
- Gallery photos: `src/backend/uploads/gallery/`

Files are automatically named with timestamps to prevent conflicts.

## 🎨 Customization

### Colors & Themes

Edit CSS files in `src/styles/`:

**Profile Theme (Purple)**

```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

**Certificates Theme (Pink)**

```css
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

**Gallery Theme (Turquoise)**

```css
background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
```

### Font & Spacing

Edit `src/index.css` for global styling changes.

## 🔍 Testing

### Test Backend API

```bash
# Health check
curl http://localhost:5000/api/health

# Get profile
curl http://localhost:5000/api/profile

# Create CV entry
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

### Test Frontend Components

1. Navigate to each tab (Profile, CV, Certificates, Gallery)
2. Test adding/editing/deleting entries
3. Test file uploads
4. Verify data persists in database

## 🐛 Troubleshooting

### Backend Won't Start

```bash
# Check Python version
python --version

# Check MySQL is running
mysql -u root -p

# Reinstall dependencies
pip install --upgrade -r requirements.txt
```

### Database Connection Failed

```bash
# Windows - Start MySQL
net start MySQL80

# Linux/Mac
sudo service mysql start

# Verify connection
mysql -u root -p -e "SELECT 1;"
```

### Images Not Displaying

1. Ensure `src/backend/uploads/` directory exists
2. Check Flask server is running
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check console for error messages

### CORS Errors

- Ensure backend is running on port 5000
- Verify frontend can reach `http://localhost:5000/api/health`
- Check Flask has CORS enabled

## 📦 Dependencies

### Frontend

```
react: ^19.2.8
axios: ^1.6.0
react-dom: ^19.2.8
react-scripts: 5.0.1
```

### Backend

```
flask: 2.3.3
flask-cors: 4.0.0
mysql-connector-python: 8.0.33
python-dotenv: 1.0.0
Werkzeug: 2.3.7
```

## 🚢 Deployment

### Hosting Frontend

- **Vercel** - Recommended for React
- **Netlify**
- **GitHub Pages**

### Hosting Backend

- **Heroku** - Easy deployment
- **AWS** - EC2, RDS
- **DigitalOcean** - Droplets
- **Railway** - Simple deployment

### Hosting Database

- **AWS RDS** - Managed MySQL
- **DigitalOcean** - Managed Databases
- **Cloud SQL** (Google Cloud)
- **Azure Database** for MySQL

For backend deployment details, see [src/backend/README.md](./src/backend/README.md).

## 📝 Environment Variables

### Frontend

No special environment variables needed (uses direct URLs).

### Backend

See [src/backend/.env.example](./src/backend/.env.example) for all variables.

```
DB_HOST       - MySQL server address
DB_USER       - MySQL username
DB_PASSWORD   - MySQL password
DB_NAME       - Database name
FLASK_ENV     - 'development' or 'production'
FLASK_DEBUG   - True/False
```

## 🔐 Security Recommendations

- ✅ Always use HTTPS in production
- ✅ Validate file uploads properly
- ✅ Use strong database passwords
- ✅ Keep `.env` file private (.gitignore)
- ✅ Update dependencies regularly
- ✅ Enable database backups
- ✅ Use environment-specific configs

## 📞 Support

### Debugging

1. Check error messages in console
2. Verify database connectivity
3. Check API responses in Network tab
4. Review backend logs

### Documentation

- [React Documentation](https://react.dev)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [Axios Documentation](https://axios-http.com/)

## 📄 File Descriptions

| File               | Purpose                                |
| ------------------ | -------------------------------------- |
| `port.py`          | Flask backend - handles all API routes |
| `Profile.jsx`      | Profile management component           |
| `CV.jsx`           | CV/Experience management               |
| `Certificates.jsx` | Certificate upload & display           |
| `Gallery.jsx`      | Photo gallery component                |
| `App.js`           | Main app component with routing        |
| `requirements.txt` | Python dependencies                    |
| `package.json`     | Node.js dependencies                   |

## 🎓 Learning Resources

- [React Tutorial](https://react.dev/learn)
- [Flask Mega-Tutorial](https://blog.miguelgrinberg.com/post/the-flask-mega-tutorial-part-i-hello-world)
- [MySQL for Beginners](https://dev.mysql.com/doc/mysql-getting-started/en/)
- [RESTful API Design](https://restfulapi.net/)

## 📄 License

This project is open source and available for personal and commercial use.

## 💡 Tips for Success

✅ Start with the Quick Start section
✅ Follow the setup guides carefully
✅ Test each component before moving to next
✅ Keep database backups regular
✅ Monitor uploaded file sizes
✅ Use version control (Git)
✅ Test all features locally before deployment

## 🎯 Next Steps

1. ✅ Complete frontend setup (`npm install && npm start`)
2. ✅ Complete backend setup ([src/backend/README.md](./src/backend/README.md))
3. ✅ Test all API endpoints
4. ✅ Add your personal information
5. ✅ Customize colors and styling
6. ✅ Deploy to production

---

**Happy Coding! Your portfolio is ready to shine! 🚀**

For backend setup and API details, see [src/backend/README.md](./src/backend/README.md)
