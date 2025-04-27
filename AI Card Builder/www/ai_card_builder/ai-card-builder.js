// AI Card Builder custom element – minimal viable product.
import { LitElement, html, css } from "lit";

const EVENT = "ai_card_builder_card_generated";

class AiCardBuilder extends LitElement {
  static properties = {
    hass: {},
    _stage: { state: true },
    _yaml: { state: true },
    _input: { state: true },
    _busy: { state: true },
  };

  constructor() {
    super();
    this._stage = "chat"; // chat | preview
    this._yaml = "";
    this._input = "";
    this._busy = false;
    window.addEventListener(EVENT, (e) => {
      this._yaml = e.detail.yaml;
      this._stage = "preview";
      this.requestUpdate();
    });
  }

  render() {
    if (this._stage === "chat") {
      return html\`
        <ha-textarea
          .value=\${this._input}
          placeholder="Describe the card you want to build…"
          @input=\${(e) => (this._input = e.target.value)}
        ></ha-textarea>
        <mwc-button
          .disabled=\${this._busy || !this._input}
          @click=\${this._askAssist}
          >Ask Assist</mwc-button
        >
      \`;
    }

    /* Preview stage */
    const yaml = this._yaml.replace(/```yaml|```/g, "").trim();
    const cardElementPromise =
      yaml && this.hass
        ? window
            .loadCardHelpers()
            .then((helpers) => helpers.createCardElement(YAML.parse(yaml)))
        : Promise.resolve(null);

    return html\`
      <div class="preview">
        \${cardElementPromise.then((el) => (el ? el : ""))}
      </div>
      <mwc-button @click=\${() => (this._stage = "chat")}>Back</mwc-button>
      <mwc-button @click=\${this._apply}>Apply</mwc-button>
    \`;
  }

  async _askAssist() {
    this._busy = true;
    await this.hass.callService("ai_card_builder", "generate_card", {
      prompt: this._input,
    });
    this._busy = false;
  }

  _apply() {
    const yaml = this._yaml.replace(/```yaml|```/g, "");
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: YAML.parse(yaml) },
      })
    );
  }

  static styles = css`
    :host {
      display: block;
    }
    .preview {
      margin: 8px 0;
    }
  `;
}
customElements.define("ai-card-builder", AiCardBuilder);
