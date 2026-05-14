import asyncio
import logging
import os
from datetime import datetime

import httpx
from dotenv import load_dotenv
from livekit.agents import (
    Agent,
    AgentSession,
    AgentServer,
    AutoSubscribe,
    JobContext,
    JobProcess,
    cli,
)
from livekit.plugins import deepgram, silero

load_dotenv()

logger = logging.getLogger("foundersuite-agent")
logger.setLevel(logging.INFO)

server = AgentServer()
API_URL = os.getenv("API_SERVER_URL", "http://localhost:8000")

MEETING_INSTRUCTIONS = """
You are a meeting assistant for FounderSuite customer discovery interviews.
Your role is to listen to conversations between founders and their target users,
capture insights accurately, and help the founder understand what they learned.

When the founder says "generate summary" or the session ends, produce a structured JSON report:
{
  "findings": ["key finding 1", ...],
  "validations": [{"hypothesis": "...", "status": "validated|invalidated|unclear", "evidence": "..."}],
  "bias_flags": [{"question": "...", "issue": "leading|biased|double-barreled", "suggestion": "..."}],
  "next_steps": ["action item 1", ...],
  "scores": {
    "bias_score": 0-100,
    "question_quality": 0-100,
    "insight_density": 0-100,
    "validation_strength": 0-100
  }
}

Higher bias_score = less bias detected (good). Be specific and actionable.
"""


def prewarm(proc: JobProcess):
    proc.userdata["vad"] = silero.VAD.load()


server.setup_fnc = prewarm


class MeetingAgent(Agent):
    def __init__(self, room_name: str) -> None:
        super().__init__(instructions=MEETING_INSTRUCTIONS)
        self._room_name = room_name
        self._transcript_buffer: list[dict] = []

    async def on_enter(self) -> None:
        logger.info("Transcription assistant connected for room %s", self._room_name)

    async def _store_segment(self, speaker: str, text: str) -> None:
        segment = {
            "room_name": self._room_name,
            "speaker": speaker,
            "text": text,
            "timestamp_ms": int(datetime.now().timestamp() * 1000),
        }
        self._transcript_buffer.append(segment)
        try:
            async with httpx.AsyncClient() as client:
                await client.post(f"{API_URL}/transcript", json=segment, timeout=5.0)
        except Exception as e:
            logger.warning(f"Failed to store transcript segment: {e}")


@server.rtc_session()
async def entrypoint(ctx: JobContext) -> None:
    ctx.log_context_fields = {"room": ctx.room.name}
    if not os.getenv("DEEPGRAM_API_KEY"):
        logger.warning("DEEPGRAM_API_KEY is not set; live transcription will not start.")

    session = AgentSession(
        stt=deepgram.STT(
            model=os.getenv("DEEPGRAM_MODEL", "nova-3"),
            language=os.getenv("DEEPGRAM_LANGUAGE", "en"),
        ),
        vad=ctx.proc.userdata["vad"],
    )

    agent = MeetingAgent(room_name=ctx.room.name)

    @session.on("user_input_transcribed")
    def on_transcript(event):
        if event.is_final and event.transcript:
            asyncio.create_task(
                agent._store_segment("founder", event.transcript)
            )

    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)
    await session.start(agent=agent, room=ctx.room)


if __name__ == "__main__":
    cli.run_app(server)
