from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from datetime import datetime
from typing import Optional
import uuid

from ..database import get_db
from ..models import (
    Parcel,
    User,
    Agent,
    ParcelStatus,
    ParcelCategory,
    UserRole
)
from ..schemas import (
    ParcelCreate,
    ParcelUpdate,
    ParcelResponse,
    ParcelStatusUpdate
)
from ..deps import get_current_user, require_admin


router = APIRouter(
    prefix="/parcels",
    tags=["Parcels"]
)


def generate_tracking_id():
    return f"CL-{uuid.uuid4().hex[:8].upper()}"


# =========================================================
# CREATE PARCEL
# =========================================================

@router.post(
    "",
    response_model=ParcelResponse,
    status_code=status.HTTP_201_CREATED
)
def create_parcel(
    parcel_data: ParcelCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tracking_id = generate_tracking_id()

    while db.query(Parcel).filter(
        Parcel.tracking_id == tracking_id
    ).first():
        tracking_id = generate_tracking_id()

    parcel = Parcel(
        tracking_id=tracking_id,
        sender_id=current_user.id,
        receiver_name=parcel_data.receiver_name,
        receiver_phone=parcel_data.receiver_phone,
        receiver_address=parcel_data.receiver_address,
        category=parcel_data.category,
        status=ParcelStatus.PENDING,
        weight_kg=parcel_data.weight_kg,
        price=parcel_data.price
    )

    db.add(parcel)
    db.commit()
    db.refresh(parcel)

    return parcel


# =========================================================
# GET PARCELS
# =========================================================

@router.get(
    "",
    response_model=list[ParcelResponse]
)
def get_parcels(
    search: Optional[str] = None,
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    sort: str = "newest",
    page: int = 1,
    limit: int = 10,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Parcel)

    if current_user.role != UserRole.ADMIN:
        query = query.filter(
            Parcel.sender_id == current_user.id
        )

    if search:
        search_value = f"%{search}%"

        query = query.filter(
            or_(
                Parcel.tracking_id.ilike(search_value),
                Parcel.receiver_name.ilike(search_value),
                Parcel.receiver_phone.ilike(search_value),
                Parcel.receiver_address.ilike(search_value)
            )
        )

    if category:
        try:
            category_enum = ParcelCategory(category)

            query = query.filter(
                Parcel.category == category_enum
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid category"
            )

    if status_filter:
        try:
            status_enum = ParcelStatus(status_filter)

            query = query.filter(
                Parcel.status == status_enum
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid status"
            )

    if date_from:
        try:
            from_date = datetime.fromisoformat(date_from)

            query = query.filter(
                Parcel.created_at >= from_date
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date_from"
            )

    if date_to:
        try:
            to_date = datetime.fromisoformat(date_to)

            if len(date_to) == 10:
                to_date = to_date.replace(
                    hour=23,
                    minute=59,
                    second=59
                )

            query = query.filter(
                Parcel.created_at <= to_date
            )

        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Invalid date_to"
            )

    if sort == "oldest":
        query = query.order_by(
            Parcel.created_at.asc()
        )

    elif sort == "price_high":
        query = query.order_by(
            Parcel.price.desc()
        )

    elif sort == "price_low":
        query = query.order_by(
            Parcel.price.asc()
        )

    elif sort == "weight_high":
        query = query.order_by(
            Parcel.weight_kg.desc()
        )

    elif sort == "weight_low":
        query = query.order_by(
            Parcel.weight_kg.asc()
        )

    else:
        query = query.order_by(
            Parcel.created_at.desc()
        )

    if page < 1:
        page = 1

    if limit < 1:
        limit = 10

    if limit > 100:
        limit = 100

    offset = (page - 1) * limit

    return query.offset(offset).limit(limit).all()


# =========================================================
# TRACK PARCEL
# =========================================================

@router.get(
    "/track/{tracking_id}",
    response_model=ParcelResponse
)
def track_parcel(
    tracking_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.tracking_id == tracking_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    if (
        current_user.role != UserRole.ADMIN
        and parcel.sender_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only track your own parcels"
        )

    return parcel


# =========================================================
# GET SINGLE PARCEL
# =========================================================

@router.get(
    "/{parcel_id}",
    response_model=ParcelResponse
)
def get_parcel(
    parcel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    if (
        current_user.role != UserRole.ADMIN
        and parcel.sender_id != current_user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return parcel


# =========================================================
# UPDATE PARCEL
# =========================================================

@router.put(
    "/{parcel_id}",
    response_model=ParcelResponse
)
def update_parcel(
    parcel_id: int,
    parcel_data: ParcelUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    if current_user.role != UserRole.ADMIN:

        if parcel.sender_id != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        if parcel.status != ParcelStatus.PENDING:
            raise HTTPException(
                status_code=400,
                detail="Only pending parcels can be edited"
            )

    update_data = parcel_data.model_dump(
        exclude_unset=True
    )

    for key, value in update_data.items():
        setattr(parcel, key, value)

    db.commit()
    db.refresh(parcel)

    return parcel


# =========================================================
# DELETE / CANCEL PARCEL
# =========================================================

@router.delete("/{parcel_id}")
def delete_parcel(
    parcel_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    if current_user.role == UserRole.ADMIN:

        if parcel.agent_id:
            old_agent = db.query(Agent).filter(
                Agent.id == parcel.agent_id
            ).first()

            if old_agent:
                old_agent.is_available = True

        db.delete(parcel)
        db.commit()

        return {
            "message": "Parcel deleted successfully"
        }

    if parcel.sender_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    if parcel.status != ParcelStatus.PENDING:
        raise HTTPException(
            status_code=400,
            detail="Only pending parcels can be cancelled"
        )

    parcel.status = ParcelStatus.CANCELLED

    db.commit()

    return {
        "message": "Parcel cancelled successfully"
    }


# =========================================================
# ADMIN UPDATE STATUS + AGENT
# =========================================================

@router.patch(
    "/{parcel_id}/status",
    response_model=ParcelResponse
)
def update_parcel_status(
    parcel_id: int,
    status_data: ParcelStatusUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    # Free old agent when changing/removing assignment
    if parcel.agent_id and (
        status_data.agent_id is not None
        and parcel.agent_id != status_data.agent_id
    ):
        old_agent = db.query(Agent).filter(
            Agent.id == parcel.agent_id
        ).first()

        if old_agent:
            old_agent.is_available = True

    # Assign new agent
    if status_data.agent_id is not None:

        agent = db.query(Agent).filter(
            Agent.id == status_data.agent_id
        ).first()

        if not agent:
            raise HTTPException(
                status_code=404,
                detail="Agent not found"
            )

        # Don't allow unavailable agent unless
        # it is already assigned to this parcel
        if (
            not agent.is_available
            and agent.id != parcel.agent_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Agent is currently unavailable"
            )

        parcel.agent_id = agent.id

        # Agent is busy after assignment
        agent.is_available = False

    # Update status
    parcel.status = status_data.status

    # Free agent after delivery/cancellation
    if status_data.status in [
        ParcelStatus.DELIVERED,
        ParcelStatus.CANCELLED
    ]:

        if parcel.agent_id:

            agent = db.query(Agent).filter(
                Agent.id == parcel.agent_id
            ).first()

            if agent:
                agent.is_available = True

    db.commit()
    db.refresh(parcel)

    return parcel


# =========================================================
# ADMIN DASHBOARD STATS
# =========================================================

@router.get("/admin/stats")
def admin_stats(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    return {
        "total_parcels": db.query(Parcel).count(),

        "pending": db.query(Parcel).filter(
            Parcel.status == ParcelStatus.PENDING
        ).count(),

        "picked_up": db.query(Parcel).filter(
            Parcel.status == ParcelStatus.PICKED_UP
        ).count(),

        "in_transit": db.query(Parcel).filter(
            Parcel.status == ParcelStatus.IN_TRANSIT
        ).count(),

        "delivered": db.query(Parcel).filter(
            Parcel.status == ParcelStatus.DELIVERED
        ).count(),

        "cancelled": db.query(Parcel).filter(
            Parcel.status == ParcelStatus.CANCELLED
        ).count(),

        "total_users": db.query(User).count(),

        "total_agents": db.query(Agent).count(),

        "available_agents": db.query(Agent).filter(
            Agent.is_available == True
        ).count()
    }


# =========================================================
# ADMIN USERS
# =========================================================

@router.get("/admin/users")
def admin_users(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(
        User.created_at.desc()
    ).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role.value,
            "created_at": user.created_at
        }
        for user in users
    ]


# =========================================================
# GET AGENTS
# =========================================================

@router.get("/admin/agents")
def get_agents(
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    agents = db.query(Agent).order_by(
        Agent.id.desc()
    ).all()

    return [
        {
            "id": agent.id,
            "name": agent.name,
            "phone": agent.phone,
            "is_available": agent.is_available
        }
        for agent in agents
    ]


# =========================================================
# ADD AGENT
# =========================================================

@router.post("/admin/agents")
def add_agent(
    name: str,
    phone: str,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    agent = Agent(
        name=name,
        phone=phone,
        is_available=True
    )

    db.add(agent)
    db.commit()
    db.refresh(agent)

    return {
        "message": "Agent created successfully",
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "phone": agent.phone,
            "is_available": agent.is_available
        }
    }


# =========================================================
# TOGGLE AGENT AVAILABILITY
# =========================================================

@router.patch("/admin/agents/{agent_id}/availability")
def toggle_agent_availability(
    agent_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(
        Agent.id == agent_id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    if not agent.is_available:
        assigned_parcel = db.query(Parcel).filter(
            Parcel.agent_id == agent.id,
            Parcel.status.in_([
                ParcelStatus.PICKED_UP,
                ParcelStatus.IN_TRANSIT
            ])
        ).first()

        if assigned_parcel:
            raise HTTPException(
                status_code=400,
                detail="Agent is assigned to an active parcel"
            )

    agent.is_available = not agent.is_available

    db.commit()
    db.refresh(agent)

    return {
        "message": "Agent availability updated",
        "agent": {
            "id": agent.id,
            "name": agent.name,
            "phone": agent.phone,
            "is_available": agent.is_available
        }
    }


# =========================================================
# DELETE AGENT
# =========================================================

@router.delete("/admin/agents/{agent_id}")
def delete_agent(
    agent_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(
        Agent.id == agent_id
    ).first()

    if not agent:
        raise HTTPException(
            status_code=404,
            detail="Agent not found"
        )

    assigned_parcels = db.query(Parcel).filter(
        Parcel.agent_id == agent_id
    ).count()

    if assigned_parcels > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete an agent assigned to parcels"
        )

    db.delete(agent)
    db.commit()

    return {
        "message": "Agent deleted successfully"
    }


# =========================================================
# UNASSIGN AGENT FROM PARCEL
# =========================================================

@router.delete("/{parcel_id}/agent")
def unassign_agent(
    parcel_id: int,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    parcel = db.query(Parcel).filter(
        Parcel.id == parcel_id
    ).first()

    if not parcel:
        raise HTTPException(
            status_code=404,
            detail="Parcel not found"
        )

    if parcel.agent_id is None:
        return {
            "message": "No agent is assigned to this parcel"
        }

    agent = db.query(Agent).filter(
        Agent.id == parcel.agent_id
    ).first()

    if agent:
        agent.is_available = True

    parcel.agent_id = None

    db.commit()
    db.refresh(parcel)

    return {
        "message": "Agent unassigned successfully"
    }