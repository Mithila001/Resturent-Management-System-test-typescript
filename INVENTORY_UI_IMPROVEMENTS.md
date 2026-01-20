# Environment Configuration

# Server Configuration

NODE_ENV=development
PORT=5000

# MongoDB Atlas Connection

# Replace <username>, <password>, and <cluster-url> with your actual values

# Example: mongodb+srv://admin:MyPassword123@cluster0.abc12.mongodb.net/restaurant_db?retryWrites=true&w=majority

MONGO_URI=mongodb+srv://kavishandananjaya2002_db_user:ktOFojRip8GwIeoU@re.clyzehp.mongodb.net/restaurant_db?appName=resto-app

# mongodb://localhost:27017/rms_testfinal?retryWrites=true&w=majority

# JWT Secret Key

# Generate a strong random string for production

# You can use: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

JWT_SECRET=2fc646c95b9ac3ce1426bcda74ff5199e676c47d53e3c124cbc7dbec6346e8ee

# Client URL

CLIENT_URL=http://localhost:5173

# Notes:

# - Never commit this file to version control (already in .gitignore)

# - For special characters in password, use URL encoding:

# @ = %40, # = %23, $ = %24, % = %25

# - For production, use environment variables from your hosting platform
