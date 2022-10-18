
const root = import.meta.url.match(/.*\//);
let WaitingWheel = root + '/waiting.png';

const urlAttribute = 'src';
const transitionTimeSecs = 0;
/**
 *
 * System: 2 images presents
 *
 *  - img: the front image
 *  - img[loading]: the image preparing
 *
 */

export default class JehonImageLoading extends HTMLElement {
	static setWaitingWheelUrl(url) {
		WaitingWheel = url;
	}

	static get observedAttributes() {
		return [urlAttribute];
	}

	/** @type {string} The URL of the image (loading or already current) => the last request */
	#currentURL = '';

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.shadowRoot.innerHTML = `
            <style>
				:host(*) {
					display: block;
					width: 100%;
					height: 100%;

					position: relative;
				}

                img {
					position: absolute;

                    width: 100%;
                    height: 100%;

                    object-fit: contain;

					opacity: 1;
					transition: opacity ${transitionTimeSecs}s linear;
                }

                img[loading] {
                    opacity: 0;
                }

            </style>
			<slot></slot>
            <img src='${WaitingWheel}' />
        `;

		this.#currentURL = WaitingWheel;
	}

	attributeChangedCallback(attributeName, _oldValue, newValue) {
		switch (attributeName) {
			case urlAttribute:
				this.loadAndDisplayImage(newValue);
				break;
		}
	}

	/**
	 * Show a waiting wheel while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @returns {JehonImageLoading} for chaining
	 */
	loadImageWhileWaiting(url) {
		this.loadAndDisplayImage(WaitingWheel, true);
		this.loadAndDisplayImage(url, false);
		return this;
	}

	/**
	 * Stay on current image while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @param {boolean?} whenReady if the image need to be displayed directly
	 * @returns {JehonImageLoading} for chaining
	 */
	loadAndDisplayImage(url, whenReady = true) {
		if (url != this.#currentURL) {
			this.#currentURL = url;

			// All the others are now supposed to be loaded
			this.querySelectorAll('img').forEach(el => el.removeAttribute('loading'));

			// Create the new element, as "loading"
			const el = document.createElement('img');
			el.setAttribute('src', url);
			el.setAttribute('loading', 1);
			this.shadowRoot.appendChild(el);

			el.addEventListener('load', () => {
				el.removeAttribute('loading');
				setTimeout(() => {
					this.shadowRoot.querySelectorAll('img:not([loading]):not(:last-child)')
						.forEach(img => img.remove());
				}, transitionTimeSecs * 1000);

				// Warn parents
				this.dispatchEvent(new CustomEvent('load', { detail: url }));
			});

		}

		if (!whenReady) {
			// Simulate that we are ready on the first 'loading' element (should be only one)
			this.shadowRoot.querySelector('[loading]').dispatchEvent(new Event('load'));
		}

		return this;
	}
}

if (customElements.get('jehon-image-loading')) {
	console.warn('Component jehon-image-loading was already defined');
} else {
	customElements.define('jehon-image-loading', JehonImageLoading);
}
