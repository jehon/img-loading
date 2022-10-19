
const root = import.meta.url.match(/.*\//);
const urlAttribute = 'src';

/**
 * Sleep a bit
 *
 * @param {number} sec to wait
 * @returns {Promise} when waited
 */
async function sleep(sec) {
	return new Promise(resolve => setTimeout(resolve, sec * 1000));
}

/**
 *
 * System: 2 images presents
 *
 *  - img: the front image
 *  - img[loading]: the image preparing
 *
 */

export default class JehonImageLoading extends HTMLElement {
	static #waitingWheel = root + '/waiting.png';
	static setWaitingWheelUrl(url) {
		JehonImageLoading.#waitingWheel = url;
	}

	static #transitionTimeMs = 250;
	static settransitionTimeMs(ms) {
		JehonImageLoading.#transitionTimeMs = ms;
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
					transition: opacity ${JehonImageLoading.#transitionTimeMs}ms ease;
                }

				img[loading] {
                    opacity: 0;
                }
            </style>
			<slot></slot>
			<img src='${JehonImageLoading.#waitingWheel}' />
        `;
		this.#currentURL = JehonImageLoading.#waitingWheel;
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
		this.loadAndDisplayImage(JehonImageLoading.#waitingWheel, true);
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
			el.setAttribute('loading', 1);
			this.shadowRoot.appendChild(el);

			el.addEventListener('load', async () => {
				// Wait for the image to have dimensions
				// Thanks to https://stackoverflow.com/a/57569491/1954789
				while (el.naturalWidth == 0 && el.naturalHeight == 0) {
					await sleep(0.5);
				}

				// Image is really ready
				el.removeAttribute('loading');

				// Wait for animation to end
				await sleep(Math.max(JehonImageLoading.#transitionTimeMs, 0.001));

				this.shadowRoot.querySelectorAll('img:not([loading]):not(:last-of-type)')
					.forEach(img => img.remove());

				// Warn the parents
				this.dispatchEvent(new CustomEvent('load', { detail: url }));
			});
			el.setAttribute('src', url);
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
