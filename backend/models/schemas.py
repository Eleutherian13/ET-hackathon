from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Any


class DocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(..., description="Document unique identifier")
    filename: str = Field(..., description="Original uploaded filename")
    doc_type: str = Field(..., description="Document type: specification or submittal")
    upload_ts: str = Field(..., description="Upload timestamp ISO format")
    status: str = Field(..., description="Processing status")
    page_count: int = Field(default=0, description="Number of pages extracted")


class SpecClauseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(..., description="Clause unique identifier")
    clause_number: str = Field(..., description="Clause number e.g. 4.2.4")
    clause_title: str = Field(default="", description="Clause title")
    equipment_class: str = Field(..., description="Equipment class e.g. UPS")
    requirements_json: str = Field(..., description="JSON array of requirements")
    tier: str = Field(default="TIER_IV", description="Applicable tier")


class DeviationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(..., description="Deviation unique identifier")
    po_id: str = Field(..., description="Purchase order ID")
    spec_clause_id: Optional[str] = Field(None, description="Linked spec clause ID")
    attribute_name: str = Field(..., description="Technical attribute name")
    specified_value: str = Field(..., description="Value required by spec")
    submitted_value: str = Field(..., description="Value submitted by vendor")
    deviation_pct: Optional[float] = Field(None, description="Percentage deviation from spec")
    severity: str = Field(..., description="CRITICAL, MAJOR, MINOR, or OBSERVATION")
    deviation_type: str = Field(default="VALUE", description="Type of deviation")
    w_conform: float = Field(default=0.5, description="Conformance weight 0-1")
    detected_ts: str = Field(..., description="Detection timestamp")
    ncr_id: Optional[str] = Field(None, description="Linked NCR ID if generated")


class NCRResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str = Field(..., description="NCR unique identifier")
    deviation_id: str = Field(..., description="Linked deviation ID")
    po_id: str = Field(..., description="Linked purchase order ID")
    equipment_item_id: Optional[str] = Field(None, description="Linked equipment item ID")
    title: str = Field(..., description="NCR title")
    severity: str = Field(..., description="Severity level")
    status: str = Field(default="open", description="NCR status")
    raised_ts: str = Field(..., description="Raised timestamp")
    due_date: Optional[str] = Field(None, description="Due date for resolution")
    spec_clause_ref: Optional[str] = Field(None, description="Specification clause reference")


class NCRDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    deviation_id: str
    po_id: str
    equipment_item_id: Optional[str]
    title: str
    description: Optional[str]
    severity: str
    status: str
    raised_ts: str
    due_date: Optional[str]
    assigned_to: Optional[str]
    resolution_text: Optional[str]
    spec_clause_ref: Optional[str]
    page_ref: Optional[str]
    schedule_impact_json: Optional[str]
    actions_json: Optional[str]
    attribute_name: Optional[str]
    specified_value: Optional[str]
    submitted_value: Optional[str]
    deviation_pct: Optional[float]
    w_conform: Optional[float]
    clause_number: Optional[str]
    clause_title: Optional[str]
    vendor_name: Optional[str]
    po_number: Optional[str]
    equipment_description: Optional[str]


class ScheduleTaskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    task_code: str
    description: str
    planned_start: str
    planned_finish: str
    total_float_days: int
    original_float_days: int
    predecessor_ids_json: str
    equipment_item_id: Optional[str]
    percent_complete: float
    risk_score: float
    delay_probability: float
    mitigation_text: Optional[str]
    risk_checked_ts: Optional[str]


class ScheduleRiskResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    tasks_analyzed: int
    high_risk_count: int
    at_risk_tasks: List[Any]
    agent_run_id: str
    completed_ts: str


class RFIQueryRequest(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    query: str = Field(..., description="Natural language query from project team")


class SourceCitation(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    doc_id: str
    clause_number: Optional[str]
    page_ref: Optional[str]
    score: float
    text_preview: str


class PrecedentRFI(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    rfi_id: str
    rfi_code: str
    title: str
    resolution_summary: str
    similarity_score: float


class RFIQueryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    answer: str
    sources: List[SourceCitation]
    precedent_rfis: List[PrecedentRFI]
    confidence: float
    agent_run_id: str


class AgentRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    agent_name: str
    trigger_event: Optional[str]
    input_summary: Optional[str]
    output_summary: Optional[str]
    status: str
    started_ts: str
    completed_ts: Optional[str]
    records_processed: int
    records_created: int


class DashboardSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    open_ncr_count: Any
    total_documents: int
    compliance_checks_run: int
    at_risk_tasks: int
    critical_path_tasks: int
    open_rfis: int
    recent_agent_runs: List[Any]
    project_health_score: float