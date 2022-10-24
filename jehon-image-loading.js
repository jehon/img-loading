
const root = import.meta.url.match(/.*\//);
const urlAttribute = 'src';

/**
 * Sleep a bit
 *
 * @param {number} ms to wait
 * @returns {Promise} when waited
 */
async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
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
				:host {
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
					transition: opacity ${JehonImageLoading.#transitionTimeMs}ms linear;
                }

				img[legacy] {
					opacity: 0;
					/* Removing the image is done a bit later to avoid the 'black' passage */
					transition-delay: ${JehonImageLoading.#transitionTimeMs / 2}ms
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
		// Must run in parallel since the second one must be top
		this.loadAndDisplayImage(JehonImageLoading.#waitingWheel, true);
		this.loadAndDisplayImage(url, false);
		return this;
	}

	/**
	 * Stay on current image while the url-image is loading
	 *
	 * @param {string} url of the image to be loaded
	 * @param {boolean?} waitUntillReady if the image need to be displayed directly
	 * @returns {JehonImageLoading} for chaining
	 */
	async loadAndDisplayImage(url, waitUntillReady = true) {
		if (url != this.#currentURL) {
			this.#currentURL = url;

			const el = await this.preLoad(url, !waitUntillReady);

			// Wait for the image to have dimensions
			// Thanks to https://stackoverflow.com/a/57569491/1954789
			while (!el.naturalWidth || !el.naturalHeight) {
				await sleep(100);

			}

			await this.moveTo(el);

			// Warn the parents
			this.dispatchEvent(new CustomEvent('load', { detail: url }));
		}

		return this;
	}

	async preLoad(url, nowait = false) {
		return new Promise(resolve => {
			const el = document.createElement('img');
			if (nowait) {
				resolve(el);
			} else {
				el.addEventListener('load', async () => resolve(el));
			}
			el.setAttribute('src', url);
		});
	}

	async moveTo(el) {
		return new Promise(resolve => {
			// Image is really ready
			this.shadowRoot.querySelectorAll('img')
				.forEach(img => img.setAttribute('legacy', 'legacy'));
			this.shadowRoot.appendChild(el);

			// Wait for animation to end
			sleep(2 * Math.max(JehonImageLoading.#transitionTimeMs, 1))
				.then(() => {
					this.shadowRoot.querySelectorAll('img[legacy]').forEach(img => img.remove());
					resolve();
				});
		});
	}
}

if (customElements.get('jehon-image-loading')) {
	console.warn('Component jehon-image-loading was already defined');
} else {
	customElements.define('jehon-image-loading', JehonImageLoading);
}
