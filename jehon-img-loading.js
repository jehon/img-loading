
export let WaitingWheel = '/waiting.gif';

const urlAttribute = 'src';

class JehonImgLoading extends HTMLElement {
	static get observedAttributes() {
		return [urlAttribute];
	}

	/** @type {HTMLImageElement} */
	#visible;

	/** @type {HTMLImageElement} */
	#preload;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
            <style>
                img {
                    width: 50px;
                    height: 50px;
                    background-color: green;
                    object-fit: contain;

                    width: 100%;
                    height: 100%
                }

                img#preload {
                    display: none;
                }
            </style>
            
            <img id='preload'>
            <img id='visible' src='${WaitingWheel}'>
        `;

		this.#visible = this.shadowRoot.querySelector('#visible');
		this.#preload = this.shadowRoot.querySelector('#preload');
		this.#preload.addEventListener('load', () => {
			const url = this.#preload.getAttribute('src');
			this.#visible.setAttribute('src', url);
			this.#preload.setAttribute('src', '');
			this.dispatchEvent(new CustomEvent('load', { detail: url }));
		});
	}

	attributeChangedCallback(attributeName, oldValue, newValue) {
		switch (attributeName) {
			case urlAttribute:
				if (newValue != oldValue) {
					this.loadAndDisplayImage(newValue);
				}
				break;
		}
	}

	/**
	 * Show a waiting wheel while the url-image is loading
	 *
	 * @param {string} src of the image to be loaded
	 * @returns {JehonImgLoading} for chaining
	 */
	loadImageWhileWaiting(src) {
		this.setAttribute(urlAttribute, src);
		this.#visible.setAttribute('src', WaitingWheel);
		this.#preload.setAttribute('src', src);
		return this;
	}

	/**
	 * Stay on current image while the url-image is loading
	 *
	 * @param {string} src of the image to be loaded
	 * @returns {JehonImgLoading} for chaining
	 */
	loadAndDisplayImage(src) {
		this.setAttribute('src', src);
		this.#preload.setAttribute('src', src);
		return this;
	}
}

customElements.define('jehon-img-loading', JehonImgLoading);
