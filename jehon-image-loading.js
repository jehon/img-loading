
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

	static #transitionTimeMs = 2500;
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
					xxx-transition-delay: ${JehonImageLoading.#transitionTimeMs / 2}ms
				}

				img[loaded] {
					opacity: 0.01;
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
	async loadImageWhileWaiting(url) {
		// Must run in parallel since the second one must be top
		await this.loadAndDisplayImage(JehonImageLoading.#waitingWheel, true);
		await this.loadAndDisplayImage(url, false);
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

			const el = await this.#preLoad(url, !waitUntillReady);
			await this.#moveTo(el);
		}

		// Warn the parents (in all cases)
		this.dispatchEvent(new CustomEvent('load', { detail: url }));

		return this;
	}

	async #preLoad(url, nowait = false) {
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

	async #moveTo(el) {
		return new Promise(resolve => {
			el.setAttribute('loaded', 'loaded');
			this.shadowRoot.appendChild(el);

			// Thanks to https://stackoverflow.com/a/24674486/1954789
			// See https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
			//
			// requestAnimationFrame = before drawing the next frame on the screen, execute this game logic/animation processing
			//
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						el.removeAttribute('loaded');

						// This will resolve when all img has finish "legacy" transition
						Promise.all(Array.from(this.shadowRoot.querySelectorAll('img'))
							.filter(img => img != el)
							.map(img => new Promise(resolve => {
								img.setAttribute('legacy', 'legacy');
								img.addEventListener('transitionend', () => {
									img.remove();
									resolve(img);
								});
							})))
							.then(() => resolve());
					});
				});
			});
		});
	}
}

if (customElements.get('jehon-image-loading')) {
	console.warn('Component jehon-image-loading was already defined');
} else {
	customElements.define('jehon-image-loading', JehonImageLoading);
}
