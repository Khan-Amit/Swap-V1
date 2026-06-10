from decimal import Decimal
import uuid
from sqlalchemy.orm import Session
from backend.src.db.models import WalletBalance, Transaction, ExchangeRateCache

class LedgerEngine:
    """
    Executes core double-entry accounting and cross-currency exchange 
    operations with strict atomic database isolation.
    """

    @staticmethod
    def deposit_funds(db_session: Session, user_id: uuid.UUID, amount: Decimal, currency: str, reference_id: str) -> dict:
        """
        Inbound funding logic (e.g., Receiving Euro via SEPA network transfer).
        Loads external money directly into the user's regional pocket.
        """
        try:
            with db_session.begin_nested(): # Atomic sub-transaction barrier
                # 1. Prevent race conditions by acquiring a row lock
                wallet = db_session.query(WalletBalance).filter_by(
                    user_id=user_id, currency=currency
                ).with_for_update().first()

                # 2. Provision pocket if this is the user's first time using this currency
                if not wallet:
                    wallet = WalletBalance(user_id=user_id, currency=currency, balance=Decimal('0.0000'))
                    db_session.add(wallet)

                # 3. Add funds safely
                wallet.balance += amount

                # 4. Log the immutable deposit record
                ledger_entry = Transaction(
                    transaction_id=uuid.uuid4(),
                    reference_id=reference_id,
                    sender_id=None, # External bank source
                    receiver_id=user_id,
                    source_currency=currency,
                    source_amount=amount,
                    target_currency=currency,
                    target_amount=amount,
                    applied_rate=Decimal('1.000000'),
                    status="SUCCESS"
                )
                db_session.add(ledger_entry)

            return {"status": "SUCCESS", "new_balance": float(wallet.balance)}
        except Exception as e:
            return {"status": "FAILED", "reason": str(e)}


    @staticmethod
    def execute_fx_exchange(db_session: Session, user_id: uuid.UUID, source_currency: str, target_currency: str, source_amount: Decimal, reference_id: str) -> dict:
        """
        Converts money internally between two wallets (e.g., Converting EUR to THB).
        Applies live mid-market rates plus standard system fees markup.
        """
        try:
            with db_session.begin_nested():
                # 1. Look up live exchange metrics
                rate_meta = db_session.query(ExchangeRateCache).filter_by(
                    from_currency=source_currency, to_currency=target_currency
                ).with_for_update().first()

                if not rate_meta:
                    raise ValueError(f"Exchange pair {source_currency}/{target_currency} is not active.")

                # Calculate user conversion rate: mid_market * (1 - markup_percent)
                client_rate = rate_meta.mid_market_rate * (Decimal('1.0') - rate_meta.fee_markup_percent)
                calculated_payout = (source_amount * client_rate).quantize(Decimal('0.0001'))

                # 2. Secure and check source wallet balance (EUR)
                source_wallet = db_session.query(WalletBalance).filter_by(
                    user_id=user_id, currency=source_currency
                ).with_for_update().one()

                if source_wallet.balance < source_amount:
                    raise ValueError(f"Insufficient funds in {source_currency} pocket.")

                # 3. Secure or provision target pocket (THB)
                target_wallet = db_session.query(WalletBalance).filter_by(
                    user_id=user_id, currency=target_currency
                ).with_for_update().first()

                if not target_wallet:
                    target_wallet = WalletBalance(user_id=user_id, currency=target_currency, balance=Decimal('0.0000'))
                    db_session.add(target_wallet)

                # 4. Shift balances atomically
                source_wallet.balance -= source_amount
                target_wallet.balance += calculated_payout

                # 5. Commit permanent record to the ledger
                ledger_entry = Transaction(
                    transaction_id=uuid.uuid4(),
                    reference_id=reference_id,
                    sender_id=user_id,
                    receiver_id=user_id,
                    source_currency=source_currency,
                    source_amount=source_amount,
                    target_currency=target_currency,
                    target_amount=calculated_payout,
                    applied_rate=client_rate,
                    status="SUCCESS"
                )
                db_session.add(ledger_entry)

            return {
                "status": "SUCCESS",
                "debited": float(source_amount),
                "credited": float(calculated_payout),
                "rate_applied": float(client_rate)
            }
        except Exception as e:
            return {"status": "FAILED", "reason": str(e)}


    @staticmethod
    def process_p2p_payment(db_session: Session, sender_id: uuid.UUID, receiver_id: uuid.UUID, amount: Decimal, currency: str, reference_id: str) -> dict:
        """
        Executes an instant P2P transfer between two app users in the same asset currency 
        (e.g., Paying a Thai shop or scanning a local PromptPay merchant QR).
        """
        try:
            with db_session.begin_nested():
                # 1. Lock sender wallet and verify cash availability
                sender_wallet = db_session.query(WalletBalance).filter_by(
                    user_id=sender_id, currency=currency
                ).with_for_update().one()

                if sender_wallet.balance < amount:
                    raise ValueError(f"Insufficient {currency} balance to complete payment.")

                # 2. Lock receiver wallet
                receiver_wallet = db_session.query(WalletBalance).filter_by(
                    user_id=receiver_id, currency=currency
                ).with_for_update().one()

                # 3. Swap values
                sender_wallet.balance -= amount
                receiver_wallet.balance += amount

                # 4. Generate transaction ticket
                ledger_entry = Transaction(
                    transaction_id=uuid.uuid4(),
                    reference_id=reference_id,
                    sender_id=sender_id,
                    receiver_id=receiver_id,
                    source_currency=currency,
                    source_amount=amount,
                    target_currency=currency,
                    target_amount=amount,
                    applied_rate=Decimal('1.000000'),
                    status="SUCCESS"
                )
                db_session.add(ledger_entry)

            return {"status": "SUCCESS", "reference_id": reference_id, "amount_settled": float(amount)}
        except Exception as e:
            return {"status": "FAILED", "reason": str(e)}
