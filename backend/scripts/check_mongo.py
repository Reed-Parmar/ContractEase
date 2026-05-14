import asyncio
import logging
import traceback

from app.core import config
from app.db import mongo

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")
logger = logging.getLogger("check_mongo")

print("Loaded .env MONGO_URI:", config.MONGO_URI)
print("MONGO_STARTUP_RETRY_COUNT:", config.MONGO_STARTUP_RETRY_COUNT)

async def main():
    try:
        await mongo.ensure_mongo_ready()
        print("Mongo ping: SUCCESS")
    except Exception as e:
        print("Mongo ping: FAILED")
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
