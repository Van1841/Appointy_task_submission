# SynapseMind - AI-Powered Second Brain

A full-stack web application that helps you save, organize, and retrieve all kinds of information using AI. Built with React, Node.js, MongoDB, and Claude AI.

## Features

### Core Functionality
- **Multi-Format Upload**: Save URLs, images, PDFs, text notes, and dream entries
- **AI-Powered Categorization**: Automatic content analysis and categorization using Claude AI
- **Semantic Search**: Natural language search to find content by meaning, not just keywords
- **Dashboard**: Pinterest-style grid view of all saved items
- **Memory Graph**: Visual network showing connections between saved content
- **Weekly Reflection**: AI-generated insights about your knowledge journey
- **Timeline View**: Activity heatmap and chronological view of saves
- **Thread Creation**: Automatic grouping of similar content
- **Time Capsule**: Lock content until a future date
- **Reminders**: Set reminders on saved items
- **Duplicate Detection**: AI alerts when similar content is saved

### Design
- Dark coder theme with neon blue/purple accents
- Responsive design (desktop & mobile)
- Glassmorphism UI effects
- Smooth animations and transitions

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB (via Mongoose)
- JWT Authentication
- Claude AI API (Anthropic)
- Multer (file uploads)
- Cheerio (web scraping)
- pdf-parse (PDF extraction)
- node-cron (scheduled tasks)

### Frontend
- React 18
- Vite
- React Router
- Tailwind CSS
- React Flow (graph visualization)
- Axios
- React Hot Toast
- React Dropzone
- date-fns

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (free tier works)
- Claude API key from Anthropic

### Step 1: Clone or Navigate to Project
```bash
cd "C:\Users\vansh\Favorites\Appointy Task Round"
```

### Step 2: Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file in backend folder:
```bash
cp .env.example .env
```

4. Edit `.env` file with your credentials:
```env
PORT=5000
NODE_ENV=development

# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/synapsemind

# JWT Secret (use a random string)
JWT_SECRET=your_super_secret_random_string_here

# Claude API Key
CLAUDE_API_KEY=sk-ant-your-claude-api-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

5. Start the backend server:
```bash
npm start
```

Backend will run on http://localhost:5000

### Step 3: Frontend Setup

1. Open a new terminal and navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

### Step 4: Access the Application

Open your browser and go to: http://localhost:5173

## Usage Guide

### First Time Setup
1. Create an account on the signup page
2. Select your categories of interest
3. You're ready to start saving!

### Uploading Content

#### Save a URL
1. Go to Upload page
2. Select "URL" type
3. Paste any web link
4. AI will automatically extract title, content, and metadata
5. Auto-categorization happens in the background

#### Upload a File
1. Select "File" type
2. Drag and drop or click to upload image/PDF
3. AI will extract text from PDFs
4. Auto-categorization applied

#### Create a Note
1. Select "Note" type
2. Write your content
3. Optionally add a title
4. AI analyzes and categorizes

#### Save a Dream
1. Select "Dream" type
2. Describe your dream or thought
3. Tagged under "Dream Notes"

### Using Time Capsule
1. While uploading, check "Enable Time Capsule"
2. Set a future unlock date
3. Add an optional message to your future self
4. Content will be locked until that date

### Searching
1. Go to Search page
2. Type natural language queries like:
   - "Show me that article about tokenization I saved last month"
   - "Reel on butterflies"
   - "My saved products"
3. AI performs semantic search for relevant results

### Weekly Reflection
1. Go to Reflection page
2. Click "Generate This Week"
3. AI analyzes your saves and provides:
   - Summary of the week
   - Category breakdown
   - Top topics
   - Patterns observed
   - Personalized recommendations
   - Growth areas

### Memory Graph
- Visualizes your knowledge as interconnected nodes
- Categories appear as central hubs
- Saved items connect to categories
- Similar items link together (shown by threads)
- Interactive - drag to explore

### Threads
- AI automatically detects similar content
- Creates collections called "threads"
- View all threads in the Threads page
- Shows similarity percentage

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)

### Uploads
- `POST /api/uploads` - Create upload (URL/note/dream)
- `POST /api/uploads/file` - Upload file
- `GET /api/uploads` - Get all uploads (protected)
- `GET /api/uploads/:id` - Get single upload
- `PUT /api/uploads/:id` - Update upload
- `DELETE /api/uploads/:id` - Delete upload
- `GET /api/uploads/timeline` - Get timeline data

### Search
- `GET /api/search?query=...` - Semantic search
- `GET /api/search/suggestions` - Get search suggestions

### Threads
- `GET /api/threads` - Get all threads
- `POST /api/threads` - Create thread manually
- `GET /api/threads/:id` - Get single thread
- `PUT /api/threads/:id` - Update thread
- `DELETE /api/threads/:id` - Delete thread
- `POST /api/threads/:id/add` - Add upload to thread

### Reflections
- `GET /api/reflections` - Get all reflections
- `GET /api/reflections/latest` - Get latest reflection
- `POST /api/reflections/generate` - Generate new reflection

### Reminders
- `GET /api/reminders` - Get all reminders
- `POST /api/reminders` - Create reminder
- `GET /api/reminders/:id` - Get single reminder
- `PUT /api/reminders/:id` - Update reminder
- `DELETE /api/reminders/:id` - Delete reminder

## MongoDB Setup

### Get MongoDB Atlas Connection String

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database password
7. Replace `myFirstDatabase` with `synapsemind`
8. Paste in your `.env` file

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/synapsemind?retryWrites=true&w=majority
```

## Claude API Key

1. Go to https://console.anthropic.com/
2. Create an account
3. Go to API Keys section
4. Create a new API key
5. Copy and paste in your `.env` file

**Note**: AI features require Claude API. If not set, the app will still work but with limited AI functionality.

## Folder Structure

```
synapsemind/
├── backend/
│   ├── controllers/       # Route handlers
│   ├── middleware/        # Auth & upload middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── utils/            # Helper functions (AI, extraction)
│   ├── uploads/          # Uploaded files storage
│   ├── .env              # Environment variables
│   ├── server.js         # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── context/      # React context (Auth)
│   │   ├── pages/        # Page components
│   │   ├── utils/        # API utilities
│   │   ├── App.jsx       # Main app component
│   │   ├── main.jsx      # Entry point
│   │   └── index.css     # Global styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
└── README.md
```

## Troubleshooting

### Backend won't start
- Check if MongoDB connection string is correct
- Ensure port 5000 is not in use
- Verify all environment variables are set

### Frontend won't start
- Try deleting `node_modules` and running `npm install` again
- Check if port 5173 is available
- Clear browser cache

### AI features not working
- Verify Claude API key is correct
- Check API key has credits/quota
- Look at backend console for API errors

### File uploads failing
- Check `backend/uploads` folder exists
- Verify file size is under 10MB
- Ensure multer is configured correctly

## Future Enhancements

- Chrome extension for quick saves
- Voice input for dreams/notes
- Email notifications for reminders
- Export data to various formats
- Collaborative boards
- Mobile app (React Native)
- OCR for images
- Video content extraction

## License

MIT License - Feel free to use for personal or commercial projects

## Support

For issues or questions:
- Check the troubleshooting section
- Review API documentation
- Check backend console logs for errors

---

Built with Claude AI
© 2024 SynapseMind
