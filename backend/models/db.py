from sqlalchemy import create_engine, Column, String, Text, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship


# Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./relationship_graph.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # People, Institutions, Projects, Methods
    bio = Column(Text)
    description = Column(Text)
    website = Column(String)
    connections = Column(String)
    budget = Column(String)
    methods = Column(Text)
    involved_institutions = Column(Text)
    category = Column(String)
    steps = Column(Text)
    challenges = Column(Text)
    conditions = Column(Text)
    links = Column(String)

    # Relationships
    source_links = relationship("Link", foreign_keys="Link.source_id", back_populates="source")
    target_links = relationship("Link", foreign_keys="Link.target_id", back_populates="target")


class Link(Base):
    __tablename__ = "links"

    id = Column(String, primary_key=True)
    source_id = Column(String, ForeignKey("nodes.id"), nullable=False)
    target_id = Column(String, ForeignKey("nodes.id"), nullable=False)
    relationship_type = Column(String, nullable=False)  # leads, develops, applies, etc.
    strength = Column(Float, default=1.0)

    # Relationships
    source = relationship("Node", foreign_keys=[source_id], back_populates="source_links")
    target = relationship("Node", foreign_keys=[target_id], back_populates="target_links")


Base.metadata.create_all(bind=engine)