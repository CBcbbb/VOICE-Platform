from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional

from models.db import SessionLocal

from backend.models import (
    Node,
    NodeBase,
    NodeCreate,
    LinkCreate,
    Link,
    GraphData,
    LinkResponse,
    NodeResponse
)

# FastAPI app
app = FastAPI(title="Relationship Graph API")

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# API Endpoints

@app.get("/")
def read_root():
    return {"message": "Relationship Graph API"}

@app.get("/api/graph-data", response_model=GraphData)
def get_graph_data(db: Session = Depends(get_db)):
    """Get all nodes and links for the graph"""
    nodes = db.query(Node).all()
    links = db.query(Link).all()

    return GraphData(
        nodes=[NodeResponse.from_orm(node) for node in nodes],
        links=[LinkResponse.from_orm(link) for link in links]
    )

@app.get("/api/nodes", response_model=List[NodeResponse])
def get_nodes(node_type: Optional[str] = None, db: Session = Depends(get_db)):
    """Get all nodes, optionally filtered by type"""
    query = db.query(Node)
    if node_type:
        query = query.filter(Node.type == node_type)
    nodes = query.all()
    return [NodeResponse.from_orm(node) for node in nodes]

@app.get("/api/nodes/{node_id}", response_model=NodeResponse)
def get_node(node_id: str, db: Session = Depends(get_db)):
    """Get a specific node by ID"""
    node = db.query(Node).filter(Node.id == node_id).first()
    if not node:
        raise HTTPException(status_code=404, detail="Node not found")
    return NodeResponse.from_orm(node)

@app.post("/api/nodes", response_model=NodeResponse)
def create_node(node: NodeCreate, db: Session = Depends(get_db)):
    """Create a new node"""
    # Check if node already exists
    existing = db.query(Node).filter(Node.id == node.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Node with this ID already exists")

    db_node = Node(**node.dict())
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return NodeResponse.from_orm(db_node)

@app.put("/api/nodes/{node_id}", response_model=NodeResponse)
def update_node(node_id: str, node: NodeBase, db: Session = Depends(get_db)):
    """Update an existing node"""
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")

    for field, value in node.dict(exclude_unset=True).items():
        setattr(db_node, field, value)

    db.commit()
    db.refresh(db_node)
    return NodeResponse.from_orm(db_node)

@app.delete("/api/nodes/{node_id}")
def delete_node(node_id: str, db: Session = Depends(get_db)):
    """Delete a node and all its links"""
    db_node = db.query(Node).filter(Node.id == node_id).first()
    if not db_node:
        raise HTTPException(status_code=404, detail="Node not found")

    # Delete all links connected to this node
    db.query(Link).filter(
        (Link.source_id == node_id) | (Link.target_id == node_id)
    ).delete()

    db.delete(db_node)
    db.commit()
    return {"message": "Node deleted successfully"}

@app.get("/api/links", response_model=List[LinkResponse])
def get_links(db: Session = Depends(get_db)):
    """Get all links"""
    links = db.query(Link).all()
    return [LinkResponse.from_orm(link) for link in links]

@app.post("/api/links", response_model=LinkResponse)
def create_link(link: LinkCreate, db: Session = Depends(get_db)):
    """Create a new link"""
    # Verify that both nodes exist
    source_exists = db.query(Node).filter(Node.id == link.source_id).first()
    target_exists = db.query(Node).filter(Node.id == link.target_id).first()

    if not source_exists or not target_exists:
        raise HTTPException(status_code=400, detail="Source or target node does not exist")

    db_link = Link(**link.dict())
    db.add(db_link)
    db.commit()
    db.refresh(db_link)
    return LinkResponse.from_orm(db_link)

@app.delete("/api/links/{link_id}")
def delete_link(link_id: str, db: Session = Depends(get_db)):
    """Delete a link"""
    db_link = db.query(Link).filter(Link.id == link_id).first()
    if not db_link:
        raise HTTPException(status_code=404, detail="Link not found")

    db.delete(db_link)
    db.commit()
    return {"message": "Link deleted successfully"}

@app.get("/api/search")
def search_nodes(q: str, db: Session = Depends(get_db)):
    """Search nodes by name, bio, or description"""
    search_term = f"%{q}%"
    nodes = db.query(Node).filter(
        (Node.name.ilike(search_term)) |
        (Node.bio.ilike(search_term)) |
        (Node.description.ilike(search_term)) |
        (Node.methods.ilike(search_term))
    ).all()

    return [NodeResponse.from_orm(node) for node in nodes]

@app.post("/api/initialise-data")
def initialize_data(db: Session = Depends(get_db)):
    """Initialise database with your current hardcoded data"""
    # This is where you'd put your current data to populate the database
    return {"message": "Data initialisation endpoint ready"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)