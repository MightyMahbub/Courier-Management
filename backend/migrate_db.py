import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models import User, Agent, Parcel

load_dotenv()

# -----------------------------
# SQLite database
# -----------------------------
sqlite_engine = create_engine(
    "sqlite:///./courier.db",
    connect_args={"check_same_thread": False}
)

SQLiteSession = sessionmaker(bind=sqlite_engine)

# -----------------------------
# Neon PostgreSQL database
# -----------------------------
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set in .env")

if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+psycopg://",
        1
    )

postgres_engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True
)

PostgresSession = sessionmaker(bind=postgres_engine)


def migrate():
    sqlite_db = SQLiteSession()
    postgres_db = PostgresSession()

    try:
        print("Reading SQLite data...")

        users = sqlite_db.query(User).all()
        agents = sqlite_db.query(Agent).all()
        parcels = sqlite_db.query(Parcel).all()

        print(f"Users found: {len(users)}")
        print(f"Agents found: {len(agents)}")
        print(f"Parcels found: {len(parcels)}")

        # Import Base here so PostgreSQL tables can be created
        from app.database import Base

        print("\nCreating PostgreSQL tables...")
        Base.metadata.create_all(bind=postgres_engine)

        # -----------------------------
        # Users
        # -----------------------------
        print("\nMigrating users...")

        for user in users:
            existing = (
                postgres_db.query(User)
                .filter(User.email == user.email)
                .first()
            )

            if existing:
                print(f"Skipping existing user: {user.email}")
                continue

            new_user = User(
                id=user.id,
                name=user.name,
                email=user.email,
                password_hash=user.password_hash,
                role=user.role,
                phone=user.phone,
                created_at=user.created_at
            )

            postgres_db.add(new_user)

        postgres_db.commit()

        # -----------------------------
        # Agents
        # -----------------------------
        print("\nMigrating agents...")

        for agent in agents:
            existing = (
                postgres_db.query(Agent)
                .filter(Agent.id == agent.id)
                .first()
            )

            if existing:
                print(f"Skipping existing agent: {agent.id}")
                continue

            new_agent = Agent(
                id=agent.id,
                name=agent.name,
                phone=agent.phone,
                is_available=agent.is_available
            )

            postgres_db.add(new_agent)

        postgres_db.commit()

        # -----------------------------
        # Parcels
        # -----------------------------
        print("\nMigrating parcels...")

        for parcel in parcels:
            existing = (
                postgres_db.query(Parcel)
                .filter(Parcel.tracking_id == parcel.tracking_id)
                .first()
            )

            if existing:
                print(
                    f"Skipping existing parcel: "
                    f"{parcel.tracking_id}"
                )
                continue

            new_parcel = Parcel(
                id=parcel.id,
                tracking_id=parcel.tracking_id,
                sender_id=parcel.sender_id,
                receiver_name=parcel.receiver_name,
                receiver_phone=parcel.receiver_phone,
                receiver_address=parcel.receiver_address,
                category=parcel.category,
                status=parcel.status,
                agent_id=parcel.agent_id,
                weight_kg=parcel.weight_kg,
                price=parcel.price,
                created_at=parcel.created_at,
                updated_at=parcel.updated_at
            )

            postgres_db.add(new_parcel)

        postgres_db.commit()

        print("\n===================================")
        print("DATABASE MIGRATION SUCCESSFUL!")
        print("===================================")

        print(f"Users migrated: {len(users)}")
        print(f"Agents migrated: {len(agents)}")
        print(f"Parcels migrated: {len(parcels)}")

    except Exception as e:
        postgres_db.rollback()
        print("\nMIGRATION FAILED!")
        print("Error:", e)
        raise

    finally:
        sqlite_db.close()
        postgres_db.close()


if __name__ == "__main__":
    migrate()