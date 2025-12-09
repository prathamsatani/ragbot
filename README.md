# 🤖 RAGBot - Electronics Recommendation System

A sophisticated RAG (Retrieval-Augmented Generation) based chatbot built with Next.js that provides intelligent document analysis and electronics recommendations. The application leverages advanced AI models and vector databases to deliver accurate, context-aware responses.

[![Next.js](https://img.shields.io/badge/Next.js-15.1.4-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-green?style=flat)](https://langchain.com/)

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [Project Structure](#-project-structure)
- [Usage](#-usage)
- [Admin Dashboard](#-admin-dashboard)
- [API Endpoints](#-api-endpoints)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### Core Functionality
- **RAG-Based Chat Interface**: Intelligent conversational AI powered by Retrieval-Augmented Generation
- **Document Analysis**: Support for multiple file formats (CSV, TXT, PDF)
- **Vector Database Integration**: ChromaDB for efficient similarity search and retrieval
- **Context-Aware Responses**: Maintains conversation history for coherent multi-turn dialogues
- **Electronics Recommendations**: Specialized in providing detailed electronics product recommendations

### User Interface
- **Modern Chat UI**: Clean, responsive interface with real-time message updates
- **Markdown Support**: Rich text formatting with support for tables, code blocks, and lists
- **Message Timestamps**: Hover-based timestamp display for all messages
- **Loading States**: Animated loading indicators for better UX
- **Mobile Responsive**: Fully responsive design that works on all devices

### Admin Features
- **Admin Dashboard**: Comprehensive control panel for system management
- **User Management**: Add, edit, and manage system users
- **Chatbot Configuration**: Customize system and retriever prompts
- **File Upload**: Ingest documents into the vector database
- **Analytics**: Monitor system usage and performance
- **Activity Logs**: Track API calls and system events

### Security & Authentication
- **NextAuth Integration**: Secure authentication system
- **Protected Routes**: Role-based access control for admin areas
- **Password Hashing**: Secure password storage with bcrypt

## 🛠️ Tech Stack

### Frontend
- **Next.js 15.1.4**: React framework with App Router
- **React 19**: Latest React features and improvements
- **TypeScript**: Type-safe development
- **TailwindCSS**: Utility-first CSS framework
- **Radix UI**: Accessible component primitives
- **Framer Motion**: Smooth animations and transitions
- **Tabler Icons**: Comprehensive icon set

### Backend & AI
- **LangChain**: Framework for developing LLM-powered applications
- **Google Generative AI**: Gemini models for embeddings and chat
- **ChromaDB**: Vector database for document storage and retrieval
- **MongoDB**: Database for user and system data
- **Firebase**: Additional backend services

### Developer Tools
- **ESLint**: Code linting and quality checks
- **PostCSS**: CSS processing
- **Turbopack**: Next-generation bundler for fast development

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 20.x or higher
- **npm**: Version 10.x or higher (comes with Node.js)
- **ChromaDB**: Running instance for vector storage
- **MongoDB**: Database instance for application data

You'll also need API keys for:
- Google Gemini AI API key
- MongoDB connection string
- Firebase configuration (if using Firebase features)

## 🚀 Installation

1. **Clone the repository**
```bash
git clone https://github.com/prathamsatani/ragbot.git
cd ragbot
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up ChromaDB** (if not already running)
```bash
# Using Docker (recommended)
docker pull chromadb/chroma
docker run -p 8000:8000 chromadb/chroma

# Or install locally
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

## ⚙️ Configuration

1. **Create environment file**

Create a `.env.local` file in the root directory with the following variables:

```env
# Google Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# ChromaDB Configuration
CHROMA_URL=http://localhost:8000
COLLECTION_NAME=my_collection

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Firebase Configuration (if using Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
```

2. **Generate NextAuth Secret**
```bash
openssl rand -base64 32
```

3. **Configure MongoDB**

Ensure your MongoDB instance is running and accessible. The connection string should follow this format:
```
mongodb://username:password@host:port/database
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The application will start on [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
# Build the application
npm run build

# Start the production server
npm start
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
ragbot/
├── src/
│   ├── app/
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── chat/         # Chat API
│   │   │   ├── chatbot/      # Chatbot management
│   │   │   └── logging/      # Logging endpoints
│   │   ├── internal/         # Protected admin routes
│   │   │   └── admin/        # Admin dashboard
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Main chat interface
│   ├── components/
│   │   ├── admin/            # Admin-specific components
│   │   ├── ui/               # Reusable UI components
│   │   ├── login-form.tsx    # Login component
│   │   └── my-textarea.tsx   # Enhanced textarea
│   ├── lib/                  # Utility libraries
│   ├── middleware/
│   │   ├── auth/             # Authentication middleware
│   │   └── logging/          # Logging utilities
│   ├── models/               # Data models
│   ├── utils/
│   │   ├── chatbot.ts        # Chatbot logic
│   │   └── vector-store.ts   # Vector database operations
│   └── actions/              # Server actions
├── public/                   # Static assets
├── chroma_data/             # ChromaDB persistence
├── components.json          # Shadcn UI config
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Project dependencies
```

## 💡 Usage

### Using the Chat Interface

1. **Start a Conversation**
   - Open the application in your browser
   - Type your question in the textarea at the bottom
   - Press Enter or click the send button

2. **Get Electronics Recommendations**
   ```
   Example queries:
   - "I need a TV for gaming under $1000"
   - "Compare the top 5 monitors for professional work"
   - "Recommend budget-friendly headphones with noise cancellation"
   ```

3. **Document Analysis**
   - Upload documents through the admin dashboard
   - Ask questions about the uploaded content
   - Get contextual answers based on your documents

### Markdown Support

The chatbot supports rich formatting in responses:
- **Bold text** for emphasis
- Bullet points and numbered lists
- Code blocks with syntax highlighting
- Tables for product comparisons
- Blockquotes for important notes

## 🔐 Admin Dashboard

Access the admin dashboard at `/internal/admin/login`

### Features

1. **User Management** (`/internal/admin/manage-users`)
   - View all system users
   - Add new users
   - Modify user permissions

2. **Chatbot Configuration** (`/internal/admin/edit-chatbot`)
   - Customize system prompts
   - Configure retriever settings
   - Manage multiple chatbot instances

3. **Analytics** (`/internal/admin/analytics`)
   - View usage statistics
   - Monitor system performance
   - Track user engagement

4. **Activity Logs** (`/internal/admin/logs`)
   - API call history
   - Error tracking
   - User activity monitoring

## 🔌 API Endpoints

### Chat API
```
POST /api/chat
Body: { messages: Message[] }
Response: { text: string }
```

### Authentication
```
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/session
```

### Chatbot Management
```
GET /api/chatbot/settings
POST /api/chatbot/settings
PUT /api/chatbot/settings/:id
DELETE /api/chatbot/settings/:id
```

### File Upload
```
POST /api/chatbot/upload
Body: FormData with file
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is open source and available for use. Please check with the repository owner for specific licensing terms.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [LangChain](https://langchain.com/) - Building applications with LLMs
- [ChromaDB](https://www.trychroma.com/) - Vector database for AI applications
- [Google Gemini](https://deepmind.google/technologies/gemini/) - AI model provider
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Shadcn UI](https://ui.shadcn.com/) - Beautiful component library

## 📧 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

---

**Built with ❤️ using Next.js and AI**
