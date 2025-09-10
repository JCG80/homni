from sqlalchemy.ext.asyncio import create_async_engine, AsyncConnection
from sqlalchemy import text
from app.config import get_settings

settings = get_settings()
engine = create_async_engine(settings.DATABASE_URL, pool_pre_ping=True)

async def fetchval(sql: str, *args):
    async with engine.connect() as conn:  # type: AsyncConnection
        res = await conn.execute(text(sql), args)
        row = res.first()
        return row[0] if row else None

async def fetchall(sql: str, *args):
    async with engine.connect() as conn:
        res = await conn.execute(text(sql), args)
        return [dict(r._mapping) for r in res.fetchall()]