import os
import logging
from dotenv import load_dotenv
from neo4j import GraphDatabase, Driver

load_dotenv()
print("NEO4J_URI =", os.getenv("NEO4J_URI"))
print("NEO4J_USER =", os.getenv("NEO4J_USER"))
print("NEO4J_DATABASE =", os.getenv("NEO4J_DATABASE"))

class Neo4jConnection:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI", "neo4j://127.0.0.1:7687")
        self.user = os.getenv("NEO4J_USER", "neo4j")
        self.password = os.getenv("NEO4J_PASSWORD", "password")
        self.database = os.getenv("NEO4J_DATABASE", "visham")
        self.driver: Driver = None

    def connect(self):
        try:
            self.driver = GraphDatabase.driver(
                self.uri,
                auth=(self.user, self.password)
            )

            self.driver.verify_connectivity()

            logging.info("✅ Connected to Neo4j")

        except Exception as e:
            logging.error(f"❌ Neo4j Connection Failed: {e}")
            self.driver = None

    def close(self):
        if self.driver:
            self.driver.close()

    def get_session(self):
        if self.driver is None:
            self.connect()

        if self.driver is None:
            return None

        return self.driver.session(database=self.database)


neo4j_conn = Neo4jConnection()