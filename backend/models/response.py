from pydantic import BaseModel
from typing import List, Optional

# Pydantic models for API
class NodeBase(BaseModel):
    name: str
    type: str
    bio: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    connections: Optional[str] = None
    budget: Optional[str] = None
    methods: Optional[str] = None
    involved_institutions: Optional[str] = None
    category: Optional[str] = None
    steps: Optional[str] = None
    challenges: Optional[str] = None
    conditions: Optional[str] = None
    links: Optional[str] = None


class NodeCreate(NodeBase):
    id: str


class NodeResponse(NodeBase):
    id: str

    class Config:
        from_attributes = True


class LinkBase(BaseModel):
    source_id: str
    target_id: str
    relationship_type: str
    strength: float = 1.0


class LinkCreate(LinkBase):
    id: str


class LinkResponse(LinkBase):
    id: str

    class Config:
        from_attributes = True


class GraphData(BaseModel):
    nodes: List[NodeResponse]
    links: List[LinkResponse]