# Relationship Graph Platform

A dynamic network visualization tool for mapping connections between people, institutions, projects, and methodologies in research and creative practice.

## Overview

This platform visualizes complex relationships within research networks, providing both interactive graph views and organized data tables. Built for the VOICE project to map connections between people, institutions, projects, and methodologies in digital art and technology research.

## Features

- Interactive force-directed graph visualization using D3.js
- Tabular view with organized columns for different entity types
- Real-time search and filtering across all data
- Dynamic data loading from FastAPI backend
- Full CRUD operations via REST API
- Responsive design with mobile support

## Technology Stack

**Backend:**
- FastAPI (Python web framework)
- SQLAlchemy (Database ORM)
- SQLite (Database, easily upgradeable to PostgreSQL)
- Pydantic (Data validation)

**Frontend:**
- React 18
- D3.js (Graph visualization)
- Lucide React (Icons)
- CSS3 with Flexbox layouts

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd VOICE-Platform
```

2. Set up the backend:
```bash
cd backend
pip install -r requirements.txt
python populate_data.py
python run.py
```

3. Set up the frontend:
```bash
cd frontend
npm install
npm start
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Project Structure

```
.
├── backend/
│   ├── models/
│   │   ├── __init__.py
│   │   ├── db.py              # Database models
│   │   └── response.py        # API response schemas
│   ├── run.py                 # Main server application
│   ├── populate_data.py       # Database initialization
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React component
│   │   ├── App.css           # Application styles
│   │   └── index.js          # React entry point
│   ├── public/
│   │   └── index.html
│   └── package.json
└── README.md
```

## API Reference

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/graph-data` | Retrieve all nodes and links |
| GET | `/api/nodes` | Get all nodes with optional type filtering |
| GET | `/api/nodes/{id}` | Get specific node by ID |
| POST | `/api/nodes` | Create new node |
| PUT | `/api/nodes/{id}` | Update existing node |
| DELETE | `/api/nodes/{id}` | Delete node and associated links |
| GET | `/api/search?q={term}` | Search nodes by keyword |

### Example Usage

Create a new person:
```bash
curl -X POST "http://localhost:8000/api/nodes" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "P999",
    "name": "Jane Researcher",
    "type": "People",
    "bio": "Digital humanities researcher",
    "website": "https://example.com"
  }'
```

Search for climate-related content:
```bash
curl "http://localhost:8000/api/search?q=climate"
```

## Data Management

### Adding New Data

1. **Via Web Interface**: Use the interactive frontend to click and add data
2. **Via API Documentation**: Visit `/docs` for interactive API testing
3. **Via Command Line**: Use curl commands with the REST API
4. **Bulk Import**: Modify `populate_data.py` for large datasets

### Data Structure

The platform supports four entity types:

- **People**: Researchers, artists, practitioners
- **Institutions**: Universities, organizations, collectives  
- **Projects**: Research initiatives, artistic works, collaborations
- **Methods**: Methodologies, approaches, frameworks

Each entity can have connections to others with relationship types like "leads", "supports", "applies", "develops".

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
DATABASE_URL=sqlite:///./relationship_graph.db
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
API_HOST=0.0.0.0
API_PORT=8000
```

### Frontend Configuration

Update API endpoint in `src/App.js`:
```javascript
const [apiUrl, setApiUrl] = useState('http://localhost:8000');
```

## Deployment

### Development
Both frontend and backend include hot reload for development.

### Production

**Backend:**
```bash
pip install gunicorn
gunicorn run:app -w 4 -k uvicorn.workers.UvicornWorker
```

**Frontend:**
```bash
npm run build
# Serve build/ directory with nginx or similar
```

**Docker:**
```bash
docker-compose up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push to your fork: `git push origin feature-name`
6. Submit a pull request

### Code Style

- **Python**: Follow PEP 8, use type hints
- **JavaScript**: Use ES6+, functional components with hooks
- **Git**: Use conventional commit messages

## Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/
```

### Frontend Tests  
```bash
cd frontend
npm test
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## Acknowledgments

Developed for the VOICE project, exploring artistic research methodologies and their interconnections across European institutions. Built with support from research communities investigating participatory design, digital humanities, and creative technology practices.

## Support

For questions or issues: Please get in touch with chongbo.ning@brunel.ac.uk

## Roadmap

- [ ] PostgreSQL support for production deployments
- [ ] User authentication and authorization
- [ ] Export functionality (PDF, PNG, SVG)
- [ ] Advanced filtering and grouping options
- [ ] Real-time collaborative editing
- [ ] Integration with external databases and APIs
