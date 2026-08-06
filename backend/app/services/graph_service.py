from app.core.neo4j import neo4j_conn
import logging
import traceback


class GraphService:

    # =====================================================
    # Neo4j Read / Write Helpers
    # =====================================================

    def execute_write(self, cypher, params=None):
        session = neo4j_conn.get_session()

        if session is None:
            raise Exception("Neo4j session could not be created.")

        try:
            result = session.run(cypher, params or {})
            summary = result.consume()

            print("\n========== NEO4J WRITE ==========")
            print(cypher)
            print(params)
            print(summary.counters)
            print("=================================\n")

            return summary

        except Exception:
            traceback.print_exc()
            raise

        finally:
            session.close()

    def execute_read(self, cypher, params=None):
        session = neo4j_conn.get_session()

        if session is None:
            raise Exception("Neo4j session could not be created.")

        try:
            result = session.run(cypher, params or {})

            # Convert before closing session
            return list(result)

        except Exception:
            traceback.print_exc()
            raise

        finally:
            session.close()

    # =====================================================
    # CASES
    # =====================================================

    def upsert_case(self, case_id: int, props: dict):

        cypher = """
        MERGE (c:Case {id:$id})
        SET c.case_number = $case_number,
            c.title = $title,
            c.description = $description,
            c.status = $status,
            c.priority = $priority,
            c.location = $location,
            c.incident_date = $incident_date
        RETURN c
        """

        params = {
            "id": case_id,
            **props
        }

        self.execute_write(cypher, params)

        if props.get("location"):
            self.upsert_location_and_link_case(
                case_id,
                props["location"]
            )

    def delete_case(self, case_id: int):

        cypher = """
        MATCH (c:Case {id:$id})
        DETACH DELETE c
        """

        self.execute_write(
            cypher,
            {"id": case_id}
        )

    # =====================================================
    # EVIDENCE
    # =====================================================

    def upsert_evidence(
        self,
        evidence_id: int,
        props: dict,
        case_id: int
    ):

        cypher = """
        MERGE (e:Evidence {id:$id})
        SET e.title = $title,
            e.description = $description,
            e.evidence_type = $evidence_type,
            e.file_name = $file_name
        RETURN e
        """

        params = {
            "id": evidence_id,
            **props
        }

        self.execute_write(cypher, params)

        rel = """
        MATCH (c:Case {id:$case_id})
        MATCH (e:Evidence {id:$evidence_id})
        MERGE (c)-[:HAS_EVIDENCE]->(e)
        """

        self.execute_write(
            rel,
            {
                "case_id": case_id,
                "evidence_id": evidence_id
            }
        )

    def delete_evidence(self, evidence_id: int):

        cypher = """
        MATCH (e:Evidence {id:$id})
        DETACH DELETE e
        """

        self.execute_write(
            cypher,
            {"id": evidence_id}
        )

    # =====================================================
    # SUSPECTS
    # =====================================================

    def upsert_suspect(
        self,
        suspect_id: int,
        props: dict,
        case_id: int
    ):

        cypher = """
        MERGE (s:Suspect {id:$id})
        SET s.full_name = $full_name,
            s.alias = $alias,
            s.risk_level = $risk_level,
            s.status = $status
        RETURN s
        """

        params = {
            "id": suspect_id,
            **props
        }

        self.execute_write(cypher, params)

        rel = """
        MATCH (c:Case {id:$case_id})
        MATCH (s:Suspect {id:$suspect_id})
        MERGE (c)-[:HAS_SUSPECT]->(s)
        MERGE (s)-[:INVOLVED_IN]->(c)
        """

        self.execute_write(
            rel,
            {
                "case_id": case_id,
                "suspect_id": suspect_id
            }
        )

    def delete_suspect(self, suspect_id: int):

        cypher = """
        MATCH (s:Suspect {id:$id})
        DETACH DELETE s
        """

        self.execute_write(
            cypher,
            {"id": suspect_id}
        )

    # =====================================================
    # WITNESSES
    # =====================================================

    def upsert_witness(
        self,
        witness_id: int,
        props: dict,
        case_id: int
    ):

        cypher = """
        MERGE (w:Witness {id:$id})
        SET w.full_name = $full_name,
            w.credibility = $credibility,
            w.status = $status
        RETURN w
        """

        params = {
            "id": witness_id,
            **props
        }

        self.execute_write(cypher, params)

        rel = """
        MATCH (c:Case {id:$case_id})
        MATCH (w:Witness {id:$witness_id})
        MERGE (c)-[:HAS_WITNESS]->(w)
        MERGE (w)-[:INVOLVED_IN]->(c)
        """

        self.execute_write(
            rel,
            {
                "case_id": case_id,
                "witness_id": witness_id
            }
        )

    def delete_witness(self, witness_id: int):

        cypher = """
        MATCH (w:Witness {id:$id})
        DETACH DELETE w
        """

        self.execute_write(
            cypher,
            {"id": witness_id}
        )

        # =====================================================
    # TIMELINE EVENTS
    # =====================================================

    def upsert_timeline_event(
        self,
        event_id: int,
        props: dict,
        case_id: int
    ):

        cypher = """
        MERGE (t:TimelineEvent {id:$id})
        SET t.title = $title,
            t.description = $description,
            t.event_time = $event_time
        RETURN t
        """

        params = {
            "id": event_id,
            **props
        }

        self.execute_write(cypher, params)

        rel = """
        MATCH (c:Case {id:$case_id})
        MATCH (t:TimelineEvent {id:$event_id})
        MERGE (c)-[:HAS_EVENT]->(t)
        """

        self.execute_write(
            rel,
            {
                "case_id": case_id,
                "event_id": event_id
            }
        )

    def delete_timeline_event(self, event_id: int):

        cypher = """
        MATCH (t:TimelineEvent {id:$id})
        DETACH DELETE t
        """

        self.execute_write(
            cypher,
            {"id": event_id}
        )

    # =====================================================
    # LOCATION
    # =====================================================

    def upsert_location_and_link_case(
        self,
        case_id: int,
        location_name: str
    ):

        cypher = """
        MERGE (l:Location {name:$location})
        WITH l
        MATCH (c:Case {id:$case_id})
        MERGE (c)-[:LOCATED_AT]->(l)
        """

        self.execute_write(
            cypher,
            {
                "case_id": case_id,
                "location": location_name
            }
        )

    # =====================================================
    # ENTITY EXTRACTION
    # =====================================================

    def add_extracted_entity(
        self,
        evidence_id: int,
        entity_type: str,
        entity_value: str,
        rel_type="MENTIONED_IN"
    ):

        allowed = [
            "Person",
            "Location",
            "Phone",
            "Email",
            "Vehicle",
            "Weapon",
            "Organization",
            "TimelineEvent"
        ]

        label = entity_type.capitalize()

        if label not in allowed:
            label = "Organization"

        cypher = f"""
        MATCH (e:Evidence {{id:$evidence_id}})
        MERGE (x:{label} {{name:$value}})
        MERGE (e)-[:{rel_type}]->(x)
        """

        self.execute_write(
            cypher,
            {
                "evidence_id": evidence_id,
                "value": entity_value
            }
        )

        cypher2 = """
        MATCH (c:Case)-[:HAS_EVIDENCE]->(e:Evidence {id:$evidence_id})
        MATCH (x {name:$value})
        MERGE (x)-[:ASSOCIATED_WITH]->(c)
        """

        self.execute_write(
            cypher2,
            {
                "evidence_id": evidence_id,
                "value": entity_value
            }
        )

    # =====================================================
    # SUSPECT RELATIONSHIPS
    # =====================================================

    def add_suspect_relationship(
        self,
        suspect_id: int,
        target_name: str,
        target_label: str,
        rel_type: str
    ):

        cypher = f"""
        MATCH (s:Suspect {{id:$suspect_id}})
        MERGE (t:{target_label} {{name:$target_name}})
        MERGE (s)-[:{rel_type}]->(t)
        """

        self.execute_write(
            cypher,
            {
                "suspect_id": suspect_id,
                "target_name": target_name
            }
        )

    # =====================================================
    # GRAPH VISUALIZATION
    # =====================================================

    def get_graph_data(self, case_id=None):

        if case_id:

            cypher = """
            MATCH (c:Case {id:$case_id})
            OPTIONAL MATCH (c)-[r]-(n)
            RETURN c,r,n
            """

            records = self.execute_read(
                cypher,
                {
                    "case_id": case_id
                }
            )

        else:

            cypher = """
            MATCH (a)-[r]->(b)
            RETURN a,r,b
            LIMIT 300
            """

            records = self.execute_read(cypher)

        nodes = {}
        links = []

        for record in records:

            if case_id:
                start = record["c"]
                rel = record["r"]
                end = record["n"]
            else:
                start = record["a"]
                rel = record["r"]
                end = record["b"]

            for node in [start, end]:

                if node is None:
                    continue

                node_id = node.element_id

                if node_id not in nodes:

                    props = dict(node)

                    nodes[node_id] = {
                        "id": node_id,
                        "label": list(node.labels)[0],
                        "name":
                            props.get("full_name")
                            or props.get("title")
                            or props.get("case_number")
                            or props.get("name")
                            or str(props.get("id")),
                        "properties": props
                    }

            if rel:

                links.append({
                    "source": start.element_id,
                    "target": end.element_id,
                    "type": rel.type,
                    "properties": dict(rel)
                })

        return {
            "nodes": list(nodes.values()),
            "links": links
        }
    
        # =====================================================
    # GRAPH ANALYTICS
    # =====================================================

    def run_shortest_path(
        self,
        start_name: str,
        end_name: str
    ):

        cypher = """
        MATCH (start {name:$start_name}),
              (end {name:$end_name})
        MATCH p = shortestPath((start)-[*..10]-(end))
        RETURN p
        """

        records = self.execute_read(
            cypher,
            {
                "start_name": start_name,
                "end_name": end_name
            }
        )

        nodes = {}
        links = []

        for record in records:

            path = record.get("p")

            if path is None:
                continue

            for node in path.nodes:

                node_id = node.element_id

                if node_id not in nodes:

                    props = dict(node)

                    nodes[node_id] = {
                        "id": node_id,
                        "label": list(node.labels)[0],
                        "name":
                            props.get("full_name")
                            or props.get("title")
                            or props.get("case_number")
                            or props.get("name")
                            or str(props.get("id")),
                        "properties": props
                    }

            for rel in path.relationships:

                links.append({
                    "source": rel.start_node.element_id,
                    "target": rel.end_node.element_id,
                    "type": rel.type,
                    "properties": dict(rel)
                })

        return {
            "nodes": list(nodes.values()),
            "links": links
        }

    # =====================================================
    # DEGREE CENTRALITY
    # =====================================================

    def run_centrality(self):

        cypher = """
        MATCH (n)
        OPTIONAL MATCH (n)-[r]-()
        RETURN
            n AS node,
            count(r) AS score
        ORDER BY score DESC
        LIMIT 20
        """

        records = self.execute_read(cypher)

        output = []

        for record in records:

            node = record["node"]
            props = dict(node)

            output.append({

                "name":
                    props.get("full_name")
                    or props.get("title")
                    or props.get("case_number")
                    or props.get("name"),

                "label":
                    list(node.labels)[0],

                "score":
                    record["score"]

            })

        return output

    # =====================================================
    # COMMUNITY / CLUSTER DETECTION
    # =====================================================

    def run_cluster_detection(self):

        cypher = """
        MATCH (n)

        OPTIONAL MATCH
            (n)-[:HAS_SUSPECT|
                 HAS_WITNESS|
                 HAS_EVIDENCE|
                 HAS_EVENT|
                 ASSOCIATED_WITH|
                 INVOLVED_IN]-(c:Case)

        RETURN

            coalesce(
                n.full_name,
                n.title,
                n.case_number,
                n.name
            ) AS entity,

            coalesce(
                c.title,
                "Independent"
            ) AS cluster,

            count(*) AS count

        ORDER BY cluster
        """

        records = self.execute_read(cypher)

        output = []

        for record in records:

            output.append({

                "entity": record["entity"],

                "cluster": record["cluster"],

                "count": record["count"]

            })

        return output

    # =====================================================
    # DATABASE UTILITIES
    # =====================================================

    def clear_graph(self):

        cypher = """
        MATCH (n)
        DETACH DELETE n
        """

        self.execute_write(cypher)

    def graph_statistics(self):

        stats = {}

        labels = [
            "Case",
            "Suspect",
            "Witness",
            "Evidence",
            "TimelineEvent",
            "Location",
            "Organization",
            "Person"
        ]

        for label in labels:

            cypher = f"""
            MATCH (n:{label})
            RETURN count(n) AS total
            """

            result = self.execute_read(cypher)

            stats[label] = result[0]["total"] if result else 0

        return stats