
import { LitElement, html, css } from "lit";

class AiCardBuilderEditor extends LitElement {
  static properties = {
    hass: {},
    config: {},
    _prompt: { state: true },
  };

  setConfig(config) {
    this.config = config;
    this._prompt = config.prompt || "";
  }

  _valueChanged(ev) {
    if (!this.config) {
      return;
    }
    const value = ev.target.value;
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this.config, prompt: value } },
      })
    );
  }

  render() {
    if (!this.hass) {
      return html``;
    }

    return html\`
      <div class="card-config">
        <ha-textarea
          .label="Prompt"
          .value=\${this._prompt}
          @input=\${this._valueChanged}
        ></ha-textarea>
      </div>
    \`;
  }

  static styles = css`
    .card-config {
      padding: 16px;
    }
  `;
}

customElements.define("ai-card-builder-editor", AiCardBuilderEditor);
