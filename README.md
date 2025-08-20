# PDF Converter Pro

A professional web-based PDF conversion and manipulation tool built with React, TypeScript, and Node.js.

## Features

- **Merge PDF**: Combine multiple PDF files into one document
- **Split PDF**: Split PDF into multiple files by pages
- **Compress PDF**: Reduce PDF file size while maintaining quality
- **PDF to Image**: Convert PDF pages to high-quality images
- **Image to PDF**: Convert images to PDF documents
- **Office to PDF**: Convert Word, Excel, PowerPoint to PDF
- **Extract Pages**: Extract specific pages from PDF
- **Rearrange Pages**: Reorder and organize PDF pages

## Tech Stack

### Frontend

- React 18 with TypeScript
- Vite for fast development
- Tailwind CSS for styling
- Framer Motion for animations
- React Router for navigation
- React Dropzone for file uploads

### Backend

- Node.js with Express
- Multer for file uploads
- Pino for logging
- Helmet for security
- CORS enabled
- Rate limiting
- File validation

## Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd PDF_converter
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

## Running the System

### Option 1: Using Scripts (Recommended)

**Windows:**

```bash
# Double-click start-system.bat
# Or run in PowerShell:
.\start-system.ps1
```

**Linux/Mac:**

```bash
chmod +x start.sh
./start.sh
```

### Option 2: Manual Start

1. **Start Backend Server**

   ```bash
   cd backend
   npm start
   ```

   Backend will be available at: http://localhost:5000

2. **Start Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will be available at: http://localhost:3000

## API Endpoints

- `GET /api/health` - Health check
- `POST /api/upload` - File upload
- `POST /api/jobs` - Create processing job
- `GET /api/jobs/:jobId` - Get job status
- `GET /api/download/:fileId` - Download processed file

## File Upload Limits

- Maximum file size: 50MB
- Maximum files per upload: 10
- Supported formats: PDF, Images (JPEG, PNG, GIF, WebP), Office documents (DOC, DOCX, XLS, XLSX, PPT, PPTX)

## Development

### Backend Development

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
```

### Frontend Development

```bash
cd frontend
npm run dev  # Vite dev server with hot reload
```

### Building for Production

```bash
cd frontend
npm run build
```

## Project Structure

```
PDF_converter/
├── backend/                 # Node.js backend server
│   ├── server.js           # Main server file
│   ├── package.json        # Backend dependencies
│   └── uploads/            # File upload directory
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # App entry point
│   ├── package.json        # Frontend dependencies
│   └── tailwind.config.js  # Tailwind CSS configuration
├── start-system.bat        # Windows batch file to start system
├── start-system.ps1        # PowerShell script to start system
└── README.md               # This file
```

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting (100 requests per 15 minutes)
- File type validation
- File size limits
- Automatic file cleanup (30 minutes)

## Troubleshooting

### Common Issues

1. **Port already in use**

   - Change ports in `backend/config.env` and `frontend/vite.config.ts`
   - Kill processes using the ports

2. **File upload fails**

   - Check file size (max 50MB)
   - Verify file format is supported
   - Ensure uploads directory exists

3. **CORS errors**

   - Verify FRONTEND_URL in backend config
   - Check that both servers are running

4. **Dependencies not found**
   - Run `npm install` in both backend and frontend directories
   - Clear npm cache: `npm cache clean --force`

### Logs

Backend logs are displayed in the console with colorized output using Pino Pretty.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
