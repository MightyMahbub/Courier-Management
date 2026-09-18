from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Enum
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"


class ParcelCategory(str, enum.Enum):
    DOCUMENT = "Document"
    FRAGILE = "Fragile"
    ELECTRONICS = "Electronics"
    FOOD = "Food"
    OTHER = "Other"


class ParcelStatus(str, enum.Enum):
    PENDING = "pending"
    PICKED_UP = "picked_up"
    IN_TRANSIT = "in_transit"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.USER, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    parcels = relationship("Parcel", back_populates="sender")


class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    is_available = Column(Boolean, default=True)

    parcels = relationship("Parcel", back_populates="agent")


class Parcel(Base):
    __tablename__ = "parcels"

    id = Column(Integer, primary_key=True, index=True)
    tracking_id = Column(String, unique=True, nullable=False, index=True)

    sender_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    receiver_name = Column(String, nullable=False)
    receiver_phone = Column(String, nullable=False)
    receiver_address = Column(String, nullable=False)

    category = Column(Enum(ParcelCategory), nullable=False)

    status = Column(
        Enum(ParcelStatus),
        default=ParcelStatus.PENDING,
        nullable=False
    )

    agent_id = Column(
        Integer,
        ForeignKey("agents.id"),
        nullable=True
    )

    weight_kg = Column(Float, nullable=False)
    price = Column(Float, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    sender = relationship("User", back_populates="parcels")
    agent = relationship("Agent", back_populates="parcels")