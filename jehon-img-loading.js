
export let WaitingWheel = '/waiting.gif';

class JehonImgLoading extends HTMLElement {
	static get observedAttributes() {
		return ['src'];
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
            
            <img id='visible'>
            <img id='preload'>
        `;

		this.#visible = this.shadowRoot.querySelector('#visible');
		this.#preload = this.shadowRoot.querySelector('#preload');
		this.#preload.addEventListener('load', () => {
			const url = this.#preload.getAttribute('src');
			this.#visible.setAttribute('src', url);
			this.dispatchEvent(new CustomEvent('load', { detail: url }));
		});
	}

	attributeChangedCallback(attributeName, oldValue, newValue) {
		switch (attributeName) {
			case 'src':
				if (newValue != oldValue) {
					this.loadAndDisplayImage(newValue);
				}
				break;
		}
	}

	/**
	 * Show a waiting wheel while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @returns {JehonImgLoading} for chaining
	 */
	loadImageWhileWaiting(url) {
		this.#visible.setAttribute('url', WaitingWheel);
		this.#preload.setAttribute('url', url);
		return this;
	}

	/**
	 * Stay on current image while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @returns {JehonImgLoading} for chaining
	 */
	loadAndDisplayImage(url) {
		this.#preload.setAttribute('url', url);
		return this;
	}
}

customElements.define('jehon-img-loading', JehonImgLoading);
