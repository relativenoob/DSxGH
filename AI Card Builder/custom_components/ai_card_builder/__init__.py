"""AI Card Builder integration."""
from __future__ import annotations

import logging, voluptuous as vol
from homeassistant.core import HomeAssistant, callback
from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers import service
from homeassistant.components import conversation
from .const import DOMAIN, SERVICE_GENERATE_CARD, EVENT_CARD_GENERATED

_LOGGER = logging.getLogger(__name__)

SERVICE_SCHEMA = vol.Schema({vol.Required("prompt"): vol.All(str, vol.Length(min=1))})

async def async_setup(hass: HomeAssistant, config: dict) -> bool:
    """YAML setup placeholder (unused)."""
    return True

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up via the UI."""

    @callback
    async def _handle_generate(call: service.ServiceCall) -> None:
        prompt: str = call.data["prompt"]
        entities = ", ".join(state.entity_id for state in hass.states.async_all()[:200])
        system_prompt = (
            "You are Home Assistant's *AI Card Builder*. Using the entities listed below, "
            "return **only** YAML inside a single ```yaml fenced block. Do not add explanations.\n\n"
            f"Available entities: {entities}"
        )

        text = f"{system_prompt}\nUser request: {prompt}"

        result = await conversation.async_converse(
            hass,
            text=text,
            conversation_id=call.context.id if call.context else None,
        )

        speech: str = result.response.speech["plain"]["speech"]
        _LOGGER.debug("AI response: %s", speech)

        hass.bus.async_fire(
            EVENT_CARD_GENERATED,
            {
                "yaml": speech,
                "conversation_id": result.conversation_id,
            },
        )

    hass.services.async_register(
        DOMAIN, SERVICE_GENERATE_CARD, _handle_generate, schema=SERVICE_SCHEMA
    )

    return True
