
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

### i have kept my mongodb connection in env example file in backend folder pls check:)


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
=======
🧠 SynapseMind

Capture. Organize. Reflect. — Your Second Brain, Powered by AI.

🚀 Overview

SynapseMind is an AI-powered memory and idea management platform that lets users save, organize, and rediscover anything — text, images, URLs, or screenshots — seamlessly across devices.
Built with React.js, Express.js, and MongoDB, it uses Claude AI APIs to analyze and auto-categorize saved content into a connected knowledge graph.

The goal: to make your thoughts and inspirations searchable, visual, and connected — forever.

🌟 Key Features
1. AI-Powered Categorization

Upload any URL, image, or note, and SynapseMind automatically detects the content type (article, product, quote, to-do, etc.) using Claude API.
It extracts relevant metadata like title, author, price, date, and source, then stores it beautifully in your dashboard.

2. Memory Graph View

Every saved idea connects to others — forming an interactive node-based memory graph.
Visualize your brain’s thought network and explore how your ideas evolve over time.

3. Smart Login & Category Preference

On login, users select preferred categories (e.g., tech, art, startups).
The system tailors the dashboard and suggestions accordingly.

4. Thread Creation for Similar Ideas

If multiple similar ideas or URLs are saved, SynapseMind automatically groups them into threads — saving you from clutter.

5. Weekly Reflection Page

Get a beautiful, AI-written summary of your week — what you saved, explored, and learned — in your “Reflection” dashboard.

6. DreamSync (Capture from Anywhere)

Add spontaneous ideas or even “sleep notes” directly from your phone using the Connect via QR feature.
Scan your unique QR code to link your phone and upload from any device without logging in again.

7. Time Capsule Brain

“Lock” your favorite ideas for the future.
Example: Remind me of this quote 1 year later when I graduate.
The AI stores these in a time capsule and notifies you on your chosen date.

8. Duplicate & Similar Content Detection

If you save the same content multiple times, SynapseMind alerts you — or merges them intelligently.

9. Visual Timeline & Heatmap

Your dashboard displays a Pinterest-style grid view — organized by date, topic, or platform.
A heatmap shows your activity pattern: when you save most and what inspires you.

10. Reminders for Each Item

Set reminders for each note or saved link — perfect for tasks, projects, or study material.

🔗 Chrome Extension Integration

SynapseMind Chrome Extension makes saving effortless.
Just select text or right-click any content, then choose:

“Copy to SynapseMind”

Your selected content (URL, snippet, or paragraph) is instantly saved and categorized in your dashboard — without even opening the website.

📱 Connect Phone Feature

Generate a unique QR code from your dashboard.

Scan it with your mobile to link your phone to your account.

Upload images, links, or screenshots directly from your mobile.

All uploads are synced in real-time to your web dashboard.

⚙️ Tech Stack
Category	Tools / Frameworks
Frontend	React.js, TailwindCSS, Framer Motion
Backend	Node.js, Express.js
Database	MongoDB Atlas
AI	Claude API (for analysis, metadata extraction, categorization)
Auth	JWT / Google OAuth
Extensions	Chrome Extension SDK
QR / Sync	qrcode, socket.io
Deployment	Vercel (Frontend), Render / Railway (Backend)


images:
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/a9981c07-a900-4458-8abd-a32452629313" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/aa871467-1a9f-4e08-9e04-484596489510" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/87ab1380-b1fe-4e22-9599-fa7e94f4671d" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/9532e6f8-0546-4129-a6c6-ea486ad6675f" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/444656ca-eb3c-444f-a65f-bbe25853ce26" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/48d88687-93e3-4ee4-8859-1b8bbebca5c8" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/e8631078-4503-44e0-91b4-ef3c00d2fca9" />




<img width="536" height="325" alt="image" src="https://github.com/user-attachments/assets/48962588-ebed-48f6-bd96-08f6f9a9c36c" />
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/4f8afbf7-a251-4b8f-adf7-e57bc6d836f8" />










