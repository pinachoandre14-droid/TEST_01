/**
 * <video-slot> — user-fillable VIDEO placeholder (drag & drop).
 *
 * Minimalist drop target styled to match the deck (hairline frame + mono label).
 * The user drags a video file onto it (or clicks to browse) and it plays inline
 * with native controls. A dropped file is shown via an object URL for the
 * current session. To embed a video permanently, upload it into the project and
 * set the `src` attribute (e.g. src="media/recorrido.mp4").
 *
 * Attributes:
 *   id           distinct id (kept for parity / future persistence)
 *   src          optional path to a video already uploaded to the project
 *   poster       optional poster image path
 *   label        empty-state caption (mono)
 *   accent       accent color for the empty-state icon/line (default currentColor)
 */
class VideoSlot extends HTMLElement {
  connectedCallback() {
    if (this._init) return;
    this._init = true;
    const src = this.getAttribute('src');
    const poster = this.getAttribute('poster');
    const label = this.getAttribute('label') || 'Arrastra tu video aquí · .mp4 / .webm';
    const accent = this.getAttribute('accent') || 'currentColor';

    this.style.display = 'block';
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.style.background = '#0f0e0d';

    this._accent = accent;
    this._label = label;
    this._poster = poster;

    if (src) {
      this._mountVideo(src, poster);
    } else {
      this._mountEmpty();
    }

    // drag & drop
    this.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.classList.add('vs-over');
    });
    this.addEventListener('dragleave', () => this.classList.remove('vs-over'));
    this.addEventListener('drop', (e) => {
      e.preventDefault();
      this.classList.remove('vs-over');
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file && file.type.startsWith('video/')) {
        this._mountVideo(URL.createObjectURL(file), this._poster);
      }
    });
  }

  _mountEmpty() {
    this.innerHTML = `
      <button type="button" class="vs-empty" aria-label="${this._label}">
        <span class="vs-frame"></span>
        <span class="vs-glyph" style="--vs-accent:${this._accent}">
          <svg viewBox="0 0 24 24" width="34" height="34" fill="none"
               stroke="var(--vs-accent)" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 8.5l7 3.5-7 3.5z"/>
          </svg>
        </span>
        <span class="vs-label">${this._label}</span>
      </button>`;
    this.querySelector('.vs-empty').addEventListener('click', () => this._pick());
    this._injectStyles();
  }

  _pick() {
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = 'video/*';
    inp.onchange = () => {
      const f = inp.files[0];
      if (f) this._mountVideo(URL.createObjectURL(f), this._poster);
    };
    inp.click();
  }

  _mountVideo(url, poster) {
    this.innerHTML = `<video class="vs-video" controls playsinline preload="metadata"
        ${poster ? `poster="${poster}"` : ''}
        style="width:100%;height:100%;object-fit:cover;display:block;background:#0f0e0d">
        <source src="${url}">
      </video>`;
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('vs-styles')) return;
    const s = document.createElement('style');
    s.id = 'vs-styles';
    s.textContent = `
      video-slot.vs-over { outline: 2px solid var(--accent, #b85c38); outline-offset: -8px; }
      video-slot .vs-empty {
        all: unset; box-sizing: border-box; cursor: pointer;
        position: absolute; inset: 0; width: 100%; height: 100%;
        display: flex; flex-direction: column; align-items: center; justify-content: center;
        gap: 18px; background: #131211; color: #d9d5cf;
      }
      video-slot .vs-frame {
        position: absolute; inset: 14px; border: 1px solid rgba(255,255,255,0.16);
        pointer-events: none;
      }
      video-slot .vs-glyph {
        width: 70px; height: 70px; border-radius: 50%;
        border: 1px solid rgba(255,255,255,0.22);
        display: flex; align-items: center; justify-content: center;
        transition: transform .25s ease, border-color .25s ease;
      }
      video-slot .vs-empty:hover .vs-glyph { transform: scale(1.06); border-color: var(--vs-accent); }
      video-slot .vs-label {
        font-family: 'IBM Plex Mono', ui-monospace, monospace;
        font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
        color: rgba(255,255,255,0.55);
      }`;
    document.head.appendChild(s);
  }
}
customElements.define('video-slot', VideoSlot);
