"""LangGraph state definition for the Career Copilot chatbot."""

from typing import TypedDict, Annotated
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages


class CopilotState(TypedDict):
    """Typed state flowing through the Career Copilot graph.

    Attributes:
        messages: Conversation history (appended via add_messages reducer).
        user_id:  Authenticated user identifier — passed to every tool.
        is_off_topic: Set by the guard node; True ⇒ skip agent, return refusal.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    user_id: str
    is_off_topic: bool
