
class AiCardBuilderDiagnostic extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<div style="padding: 16px; background: #e0f7fa; border: 2px dashed #006064;">
      ✅ AI Card Builder JavaScript is loaded correctly!
    </div>`;
  }
}
customElements.define('ai-card-builder-diagnostic', AiCardBuilderDiagnostic);
