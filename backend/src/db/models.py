import uuid
from datetime import datetime
from sqlalchemy import Column, String, Decimal, DateTime, ForeignKey, UniqueConstraint, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    """
    Tracks the core customer identity and cross-border regulatory compliance statuses.
    """
    __tablename__ = 'users'

    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String(100), nullable=False)
    
    # Compliance pipeline statuses (e.g., PENDING, APPROVED, REJECTED)
    eu_compliance_status = Column(String(20), nullable=False, default='PENDING')
    thai_compliance_status = Column(String(20), nullable=False, default='PENDING')
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    balances = relationship("WalletBalance", back_populates="user")
    transactions_sent = relationship("Transaction", foreign_keys="[Transaction.sender_id]", back_populates="sender")
    transactions_received = relationship("Transaction", foreign_keys="[Transaction.receiver_id]", back_populates="receiver")


class WalletBalance(Base):
    """
    Holds isolated asset pockets for each user. 
    A check constraint guarantees that balances can never drop below 0.0000.
    """
    __tablename__ = 'wallet_balances'

    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True)
    currency = Column(String(3), primary_key=True) # E.g., 'EUR' or 'THB'
    
    # 15 digits total capacity, 4 decimal places for precision handling
    balance = Column(Decimal(15, 4), nullable=False, default=Decimal('0.0000'))
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Enforce non-negative wallet balances at the database hardware layer
    __table_args__ = (
        CheckConstraint('balance >= 0.0000', name='check_positive_balance'),
    )

    user = relationship("User", back_populates="balances")


class Transaction(Base):
    """
    The immutable master ledger accounting log. 
    Tracks the origin currency, conversion rates, and settlement destinations.
    """
    __tablename__ = 'transactions'

    transaction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Idempotency token to block duplicate form submissions from weak networks
    reference_id = Column(String(100), unique=True, nullable=False)
    
    sender_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=True)   # Null if funding outer wallet via SEPA
    receiver_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=True) # Null if payout to external Thai Bank
    
    # FX Matrix Ledger Data
    source_currency = Column(String(3), nullable=False) # 'EUR'
    source_amount = Column(Decimal(15, 4), nullable=False)
    
    target_currency = Column(String(3), nullable=False) # 'THB'
    target_amount = Column(Decimal(15, 4), nullable=False)
    
    # FX execution conversion rate applied to this specific order
    applied_rate = Column(Decimal(15, 6), nullable=False)
    
    # Operational Status: PENDING, SUCCESS, FAILED
    status = Column(String(20), nullable=False, default='PENDING')
    created_at = Column(DateTime, default=datetime.utcnow)

    sender = relationship("User", foreign_keys=[sender_id], back_populates="transactions_sent")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="transactions_received")


class ExchangeRateCache(Base):
    """
    Maintains real-time wholesale currency pair metrics used by the FX calculator.
    """
    __tablename__ = 'exchange_rate_cache'

    from_currency = Column(String(3), primary_key=True) # 'EUR'
    to_currency = Column(String(3), primary_key=True)   # 'THB'
    
    mid_market_rate = Column(Decimal(15, 6), nullable=False)
    fee_markup_percent = Column(Decimal(5, 4), nullable=False, default=Decimal('0.0100')) # 1.00% standard spread revenue
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
