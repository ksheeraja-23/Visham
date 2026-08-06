from fastapi import APIRouter, Depends, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services.graph_service import GraphService
from app.dependencies.auth import get_current_user
from app.models.user import User
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.graph_sync import GraphSyncService
router = APIRouter(
    prefix="/graph",
    tags=["Graph Database"]
)

graph_service = GraphService()
sync_service = GraphSyncService()
class RelationshipRequest(BaseModel):
    source_label: str
    source_id_val: str
    target_label: str
    target_id_val: str
    relationship_type: str
    properties: Optional[dict] = {}

@router.get("/")
def get_graph(
    case_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user)
):
    return graph_service.get_graph_data(case_id=case_id)

@router.get("/case/{case_id}")
def get_case_graph(
    case_id: int,
    current_user: User = Depends(get_current_user)
):
    try:
        return graph_service.get_graph_data(case_id=case_id)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
@router.get("/search")
def search_graph(
    query: str = Query(...),
    current_user: User = Depends(get_current_user)
):
    cypher = """
    MATCH (n)
    WHERE n.name CONTAINS $query OR n.title CONTAINS $query OR n.case_number CONTAINS $query OR n.full_name CONTAINS $query
    RETURN n LIMIT 25
    """
    res = graph_service.execute_read(cypher, {"query": query})
    results = []
    if res:
        for record in res:
            node = record.get("n")
            labels = list(node.labels)
            label = labels[0] if labels else "Entity"
            props = dict(node)
            name = props.get("name") or props.get("title") or props.get("case_number") or props.get("full_name")
            results.append({
                "id": props.get("id") or name,
                "name": name,
                "label": label,
                "properties": props
            })
    return results

@router.post("/relationship")
def create_custom_relationship(
    req: RelationshipRequest,
    current_user: User = Depends(get_current_user)
):
    # Using dynamic cypher insertion safely mapping labels
    allowed_labels = ["Case", "Evidence", "Witness", "Suspect", "Officer", "Victim", "Organization", "Phone", "Email", "Vehicle", "Weapon", "Location", "Report", "TimelineEvent", "AIFinding", "Person"]
    if req.source_label not in allowed_labels or req.target_label not in allowed_labels:
        raise HTTPException(status_code=400, detail="Invalid node labels specified.")
    
    cypher = f"""
    MERGE (s:{req.source_label} {{name: $source_id_val}})
    MERGE (t:{req.target_label} {{name: $target_id_val}})
    MERGE (s)-[r:{req.relationship_type}]->(t)
    SET r = $properties
    RETURN r
    """
    res = graph_service.execute_write(cypher, {
        "source_id_val": req.source_id_val,
        "target_id_val": req.target_id_val,
        "properties": req.properties
    })
    if res:
        return {"status": "success", "message": f"Relationship {req.relationship_type} created successfully."}
    raise HTTPException(status_code=500, detail="Failed to create relationship in graph.")

@router.get("/analytics/shortest-path")
def get_shortest_path(
    start: str = Query(...),
    end: str = Query(...),
    current_user: User = Depends(get_current_user)
):
    try:
        return graph_service.run_shortest_path(start, end)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/centrality")
def get_centrality_ranking(
    current_user: User = Depends(get_current_user)
):
    try:
        return graph_service.run_centrality()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/clusters")
def get_cluster_detection(
    current_user: User = Depends(get_current_user)
):
    try:
        return graph_service.run_cluster_detection()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
def sync_graph(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        return sync_service.sync_all(db)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )